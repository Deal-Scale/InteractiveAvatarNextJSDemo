import type {
	CountTokensRequest,
	CountTokensResponse,
	GenerateContentRequest,
	GenerateContentResponse,
	StreamingResponseChunk,
} from "./types";

export interface GeminiVertexClientConfig {
	project: string;
	location: string;
	model: string;
	accessToken?: string;
	baseUrl?: string;
	fetch?: typeof fetch;
}

export interface RequestOptions {
	project?: string;
	location?: string;
	model?: string;
	accessToken?: string;
	signal?: AbortSignal;
	headers?: Record<string, string>;
}

export class GeminiVertexAPIError extends Error {
	readonly status: number;
	readonly details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.name = "GeminiVertexAPIError";
		this.status = status;
		this.details = details;
	}
}

export interface GeminiVertexClient {
	generateContent(
		body: GenerateContentRequest,
		options?: RequestOptions,
	): Promise<GenerateContentResponse>;
	countTokens(
		body: CountTokensRequest,
		options?: RequestOptions,
	): Promise<CountTokensResponse>;
	streamGenerateContent(
		body: GenerateContentRequest,
		options?: RequestOptions,
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
		throw new GeminiVertexAPIError(
			"Failed to parse JSON response",
			response.status,
			error instanceof Error ? { message: error.message } : undefined,
		);
	}
}

async function buildError(response: Response): Promise<GeminiVertexAPIError> {
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
		// Ignore parsing failures and fall back to default message
	}
	return new GeminiVertexAPIError(message, response.status, details);
}

function applyHeaders(
	baseHeaders: Headers,
	extra?: Record<string, string>,
): Headers {
	if (!extra) return baseHeaders;
	for (const [key, value] of Object.entries(extra)) {
		baseHeaders.set(key, value);
	}
	return baseHeaders;
}

export function createGeminiVertexClient(
	config: GeminiVertexClientConfig,
): GeminiVertexClient {
	const defaultBaseUrl = config.baseUrl
		? trimTrailingSlash(config.baseUrl)
		: undefined;
	const http = config.fetch ?? fetch;

	const resolveToken = (options?: RequestOptions) =>
		options?.accessToken ?? config.accessToken;

	const resolveBaseUrl = (options?: RequestOptions) => {
		if (defaultBaseUrl) {
			return defaultBaseUrl;
		}
		const locationForHost = options?.location ?? config.location;
		return trimTrailingSlash(
			`https://${locationForHost}-aiplatform.googleapis.com`,
		);
	};

	const resolveHeaders = (options?: RequestOptions, acceptStream = false) => {
		const headers = new Headers();
		headers.set("Content-Type", "application/json");
		applyHeaders(headers, options?.headers);
		if (acceptStream) {
			if (
				!headers.has("Accept") ||
				headers.get("Accept") === "application/json"
			) {
				headers.set("Accept", "application/x-ndjson");
			}
		} else if (!headers.has("Accept")) {
			headers.set("Accept", "application/json");
		}
		const token = resolveToken(options);
		if (token) {
			headers.set("Authorization", `Bearer ${token}`);
		}
		return headers;
	};

	const resolveUrl = (options: RequestOptions | undefined, action: string) => {
		const project = options?.project ?? config.project;
		const location = options?.location ?? config.location;
		const model = options?.model ?? config.model;
		const path = buildModelPath(project, location, model);
		return `${resolveBaseUrl(options)}${path}:${action}`;
	};

	const requestJson = async <T>(
		action: string,
		body: unknown,
		options?: RequestOptions,
	): Promise<T> => {
		const url = resolveUrl(options, action);
		const response = await http(url, {
			method: "POST",
			headers: resolveHeaders(options),
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
		options?: RequestOptions,
	): Promise<Response> => {
		const url = resolveUrl(options, action);
		const response = await http(url, {
			method: "POST",
			headers: resolveHeaders(options, true),
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
				throw new GeminiVertexAPIError(
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
					throw new GeminiVertexAPIError(
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
