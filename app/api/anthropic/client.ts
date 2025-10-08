import {
	messageRequestSchema,
	messageResponseSchema,
	streamEventSchema,
	type MessageRequest,
	type MessageResponse,
	type StreamEvent,
} from "./zod-schemas";

interface AnthropicClientOptions {
	apiKey: string;
	baseUrl?: string;
	version?: string;
	beta?: string;
	timeoutMs?: number;
	defaultHeaders?: HeadersInit;
}

interface MessageRequestOptions {
	idempotencyKey?: string;
	signal?: AbortSignal;
	headers?: HeadersInit;
}

interface StreamOptions extends MessageRequestOptions {
	onChunk(chunk: StreamEvent): Promise<void> | void;
}

const DEFAULT_BASE_URL = "https://api.anthropic.com";
const DEFAULT_VERSION = "2023-06-01";

/**
 * Represents an error returned by the Anthropic Messages API.
 */
export class AnthropicAPIError extends Error {
	public readonly status: number;
	public readonly type?: string;
	public readonly retryable?: boolean;
	public readonly rawBody?: unknown;

	public constructor(
		message: string,
		init: {
			status: number;
			type?: string;
			retryable?: boolean;
			rawBody?: unknown;
		},
	) {
		super(message);
		this.name = "AnthropicAPIError";
		this.status = init.status;
		this.type = init.type;
		this.retryable = init.retryable;
		this.rawBody = init.rawBody;
	}
}

/**
 * Lightweight client for interacting with the Anthropic Messages API.
 */
export class AnthropicClient {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly version: string;
	private readonly beta?: string;
	private readonly timeoutMs?: number;
	private readonly defaultHeaders: HeadersInit | undefined;

	public constructor(options: AnthropicClientOptions) {
		if (!options.apiKey?.trim()) {
			throw new Error("AnthropicClient apiKey is required");
		}

		this.apiKey = options.apiKey;
		this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
		this.version = options.version ?? DEFAULT_VERSION;
		this.beta = options.beta;
		this.timeoutMs = options.timeoutMs;
		this.defaultHeaders = options.defaultHeaders;
	}

	/**
	 * Sends a synchronous Messages API request and validates the response payload.
	 */
	public async createMessage(
		request: MessageRequest,
		options: MessageRequestOptions = {},
	): Promise<MessageResponse> {
		const body = messageRequestSchema.parse(request);
		const response = await this.performFetch("/v1/messages", body, options);

		const json = await response.json();
		const parsed = messageResponseSchema.parse(json);
		return parsed;
	}

	/**
	 * Sends a streaming Messages API request and processes server-sent events.
	 */
	public async streamMessage(
		request: MessageRequest,
		options: StreamOptions,
	): Promise<void> {
		const body = { ...messageRequestSchema.parse(request), stream: true };
		const response = await this.performFetch("/v1/messages", body, options);

		const contentType = response.headers.get("content-type") ?? "";
		if (!contentType.includes("text/event-stream")) {
			throw new AnthropicAPIError("Expected text/event-stream response", {
				status: response.status,
				rawBody: await response.text().catch(() => undefined),
			});
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new AnthropicAPIError("Response body is not readable", {
				status: response.status,
			});
		}

		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });

			const segments = buffer.split("\n\n");
			buffer = segments.pop() ?? "";

			for (const segment of segments) {
				const line = segment.trim();
				if (!line.startsWith("data:")) continue;

				const payload = line.replace(/^data:\s*/, "");
				if (!payload || payload === "[DONE]") continue;

				const parsedJson = JSON.parse(payload);
				const event = streamEventSchema.parse(parsedJson);
				await options.onChunk(event);
			}
		}

		if (buffer.trim()) {
			const line = buffer.trim();
			if (line.startsWith("data:")) {
				const payload = line.replace(/^data:\s*/, "");
				if (payload && payload !== "[DONE]") {
					const parsedJson = JSON.parse(payload);
					const event = streamEventSchema.parse(parsedJson);
					await options.onChunk(event);
				}
			}
		}
	}

	private async performFetch(
		path: string,
		body: unknown,
		options: MessageRequestOptions,
	): Promise<Response> {
		const headers = new Headers({
			"content-type": "application/json",
			"x-api-key": this.apiKey,
			"anthropic-version": this.version,
		});

		if (this.beta) {
			headers.set("anthropic-beta", this.beta);
		}

		if (this.defaultHeaders) {
			for (const [key, value] of Object.entries(
				Object.fromEntries(new Headers(this.defaultHeaders)),
			)) {
				headers.set(key, value);
			}
		}

		if (options.headers) {
			for (const [key, value] of Object.entries(
				Object.fromEntries(new Headers(options.headers)),
			)) {
				headers.set(key, value);
			}
		}

		if (options.idempotencyKey) {
			headers.set("idempotency-key", options.idempotencyKey);
		}

		const controller = this.timeoutMs ? new AbortController() : undefined;
		let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
		if (controller && this.timeoutMs) {
			timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);
		}

		let signal: AbortSignal | undefined = options.signal;
		if (controller) {
			if (signal) {
				const composite = new AbortController();
				const forwardAbort = (source: AbortSignal) => {
					source.addEventListener(
						"abort",
						() => composite.abort(source.reason),
						{ once: true },
					);
				};
				forwardAbort(controller.signal);
				forwardAbort(signal);
				signal = composite.signal;
			} else {
				signal = controller.signal;
			}
		}

		const response = await fetch(`${this.baseUrl}${path}`, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			signal,
		});

		if (timeoutHandle) {
			clearTimeout(timeoutHandle);
		}

		if (!response.ok) {
			let parsedError: unknown;
			try {
				parsedError = await response.json();
			} catch {
				parsedError = undefined;
			}

			const errorBody = parsedError as
				| { error?: { type?: string; message?: string; retryable?: boolean } }
				| undefined;
			const message =
				errorBody?.error?.message ??
				`Anthropic request failed with ${response.status}`;
			throw new AnthropicAPIError(message, {
				status: response.status,
				type: errorBody?.error?.type,
				retryable: errorBody?.error?.retryable,
				rawBody: parsedError,
			});
		}

		return response;
	}
}

export type { MessageRequest, MessageResponse, StreamEvent };
