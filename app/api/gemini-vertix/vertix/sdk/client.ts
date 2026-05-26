import type {
	CountTokensRequest,
	CountTokensResponse,
	GenerateContentRequest,
	GenerateContentResponse,
	StreamingResponseChunk,
} from "./types";

const DEFAULT_PROXY_BASE_URL = "/api/gemini-vertix/vertix";

export interface VertexProxyClientConfig {
	project: string;
	location: string;
	model: string;
	baseUrl?: string;
	fetch?: typeof fetch;
	defaultHeaders?: Record<string, string>;
}

export interface VertexProxyRequestOptions {
	project?: string;
	location?: string;
	model?: string;
	endpoint?: string;
	region?: string;
	accessToken?: string;
	apiKey?: string;
	userProject?: string;
	headers?: Record<string, string>;
	signal?: AbortSignal;
}

export class VertexProxyAPIError extends Error {
	readonly status: number;
	readonly details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.name = "VertexProxyAPIError";
		this.status = status;
		this.details = details;
	}
}

export interface VertexProxyClient {
	generateContent(
		body: GenerateContentRequest,
		options?: VertexProxyRequestOptions,
	): Promise<GenerateContentResponse>;
	countTokens(
		body: CountTokensRequest,
		options?: VertexProxyRequestOptions,
	): Promise<CountTokensResponse>;
	streamGenerateContent(
		body: GenerateContentRequest,
		options?: VertexProxyRequestOptions,
	): AsyncIterable<StreamingResponseChunk>;
}

function trimTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url;
}

function buildModelPath(
	project: string,
	location: string,
	model: string,
): string {
	const encodedProject = encodeURIComponent(project);
	const encodedLocation = encodeURIComponent(location);
	const encodedModel = encodeURIComponent(model);
	return `/v1/projects/${encodedProject}/locations/${encodedLocation}/publishers/google/models/${encodedModel}`;
}

async function parseJson<T>(response: Response): Promise<T> {
	const text = await response.text();
	if (!text) {
		return {} as T;
	}
	try {
		return JSON.parse(text) as T;
	} catch (error) {
		throw new VertexProxyAPIError(
			"Failed to parse JSON response",
			response.status,
			error instanceof Error ? { message: error.message } : undefined,
		);
	}
}

async function buildError(response: Response): Promise<VertexProxyAPIError> {
	let message = `Request failed with status ${response.status}`;
	let details: unknown;
	try {
		const text = await response.text();
		if (text) {
			try {
				const parsed = JSON.parse(text) as Record<string, unknown>;
				details = parsed;
				const errorPayload = (parsed as { error?: { message?: string } }).error;
				if (errorPayload && typeof errorPayload.message === "string") {
					message = errorPayload.message;
				} else if (
					typeof (parsed as { message?: string }).message === "string"
				) {
					message = (parsed as { message: string }).message;
				} else {
					message = text;
				}
			} catch {
				message = text;
			}
		}
	} catch {
		// Ignore parsing failures and fall back to the default message.
	}
	return new VertexProxyAPIError(message, response.status, details);
}

function applyHeaders(target: Headers, additions?: Record<string, string>) {
	if (!additions) return;
	for (const [key, value] of Object.entries(additions)) {
		target.set(key, value);
	}
}

function buildHeaders(
	config: VertexProxyClientConfig,
	options: VertexProxyRequestOptions | undefined,
	acceptStream = false,
): Headers {
	const headers = new Headers(config.defaultHeaders);
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}
	if (acceptStream) {
		if (!headers.has("Accept")) {
			headers.set("Accept", "application/x-ndjson");
		}
	} else if (!headers.has("Accept")) {
		headers.set("Accept", "application/json");
	}
	applyHeaders(headers, options?.headers);

	if (options?.endpoint && !headers.has("x-vertex-endpoint")) {
		headers.set("x-vertex-endpoint", options.endpoint);
	}
	if (options?.region && !headers.has("x-vertex-region")) {
		headers.set("x-vertex-region", options.region);
	}
	if (options?.apiKey && !headers.has("x-goog-api-key")) {
		headers.set("x-goog-api-key", options.apiKey);
	}
	if (options?.userProject && !headers.has("x-goog-user-project")) {
		headers.set("x-goog-user-project", options.userProject);
	}
	if (options?.accessToken && !headers.has("authorization")) {
		headers.set("authorization", `Bearer ${options.accessToken}`);
	}
	return headers;
}

export function createVertexProxyClient(
	config: VertexProxyClientConfig,
): VertexProxyClient {
	const http = config.fetch ?? fetch;
	const baseUrl = trimTrailingSlash(config.baseUrl ?? DEFAULT_PROXY_BASE_URL);

	const resolveUrl = (
		options: VertexProxyRequestOptions | undefined,
		action: string,
	) => {
		const project = options?.project ?? config.project;
		const location = options?.location ?? config.location;
		const model = options?.model ?? config.model;
		const path = buildModelPath(project, location, model);
		return `${baseUrl}${path}:${action}`;
	};

	const requestJson = async <T>(
		action: string,
		body: unknown,
		options?: VertexProxyRequestOptions,
	): Promise<T> => {
		const url = resolveUrl(options, action);
		const response = await http(url, {
			method: "POST",
			headers: buildHeaders(config, options),
			body: JSON.stringify(body ?? {}),
			signal: options?.signal,
		});
		if (!response.ok) {
			throw await buildError(response);
		}
		return parseJson<T>(response);
	};

	const requestStream = async (
		action: string,
		body: unknown,
		options?: VertexProxyRequestOptions,
	): Promise<Response> => {
		const url = resolveUrl(options, action);
		const response = await http(url, {
			method: "POST",
			headers: buildHeaders(config, options, true),
			body: JSON.stringify(body ?? {}),
			signal: options?.signal,
		});
		if (!response.ok) {
			throw await buildError(response);
		}
		return response;
	};

	return {
		generateContent(body, options) {
			return requestJson<GenerateContentResponse>(
				"generateContent",
				body,
				options,
			);
		},
		countTokens(body, options) {
			return requestJson<CountTokensResponse>("countTokens", body, options);
		},
		async *streamGenerateContent(body, options) {
			const response = await requestStream(
				"streamGenerateContent",
				body,
				options,
			);
			const stream = response.body;
			if (!stream) {
				throw new VertexProxyAPIError(
					"Streaming response body is not available in this environment",
					response.status,
				);
			}
			const reader = stream.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });
					let newlineIndex = buffer.indexOf("\n");
					while (newlineIndex !== -1) {
						let line = buffer.slice(0, newlineIndex).trim();
						buffer = buffer.slice(newlineIndex + 1);
						if (!line) {
							newlineIndex = buffer.indexOf("\n");
							continue;
						}
						if (line.startsWith("event:")) {
							newlineIndex = buffer.indexOf("\n");
							continue;
						}
						if (line.startsWith("data:")) {
							line = line.slice(5).trim();
						}
						if (!line || line === "[DONE]") {
							newlineIndex = buffer.indexOf("\n");
							continue;
						}
						yield JSON.parse(line) as StreamingResponseChunk;
						newlineIndex = buffer.indexOf("\n");
					}
				}
				let remaining = buffer.trim();
				if (remaining) {
					if (remaining.startsWith("event:")) {
						return;
					}
					if (remaining.startsWith("data:")) {
						remaining = remaining.slice(5).trim();
					}
					if (remaining && remaining !== "[DONE]") {
						yield JSON.parse(remaining) as StreamingResponseChunk;
					}
				}
			} catch (error) {
				if (error instanceof SyntaxError) {
					throw new VertexProxyAPIError(
						"Failed to parse streamed response chunk",
						response.status,
						{ cause: error.message },
					);
				}
				throw error;
			} finally {
				reader.releaseLock();
			}
		},
	};
}

export { DEFAULT_PROXY_BASE_URL };
