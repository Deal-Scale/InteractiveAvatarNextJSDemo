import type {
	ObjectRequest,
	ObjectResponse,
	StreamingChunk,
	TextRequest,
	TextResponse,
} from "../contracts";
import { HttpClient } from "../http";

export interface TextClientOptions {
	readonly httpClient: HttpClient;
}

export interface StreamTextOptions extends TextRequest {
	readonly signal?: AbortSignal;
}

export interface TextChunk {
	readonly text: string;
}

export interface ObjectChunk<T> {
	readonly object: T;
}

export function createTextClient(options: TextClientOptions) {
	const { httpClient } = options;

	return {
		generateText: (request: TextRequest) =>
			httpClient.request<TextResponse>({
				path: "/v1/text/generate",
				method: "POST",
				body: request,
			}),

		streamText: async function* (
			request: StreamTextOptions,
		): AsyncGenerator<TextChunk, void, void> {
			const response = await httpClient.raw({
				path: "/v1/text/stream",
				method: "POST",
				body: JSON.stringify(request),
				headers: { "content-type": "application/json" },
			});

			for await (const chunk of parseEventStream<TextChunk>(response)) {
				if (chunk.text) {
					yield chunk;
				}
			}
		},

		generateObject: async <
			TSchema extends { parse(data: unknown): unknown },
			TResult = unknown,
		>(
			request: ObjectRequest<TSchema>,
		): Promise<ObjectResponse<TResult>> => {
			const result = await httpClient.request<ObjectResponse<TResult>>({
				path: "/v1/object/generate",
				method: "POST",
				body: request,
			});

			return {
				...result,
				object: request.schema.parse(result.object) as TResult,
			};
		},

		streamObject: async function* <
			TSchema extends { parse(data: unknown): unknown },
			TResult = unknown,
		>(
			request: ObjectRequest<TSchema>,
		): AsyncGenerator<ObjectChunk<TResult>, void, void> {
			const response = await httpClient.raw({
				path: "/v1/object/stream",
				method: "POST",
				body: JSON.stringify(request),
				headers: { "content-type": "application/json" },
			});

			for await (const chunk of parseEventStream<ObjectChunk<TResult>>(
				response,
			)) {
				if (chunk.object) {
					yield {
						object: request.schema.parse(chunk.object) as TResult,
					};
				}
			}
		},
	};
}

async function* parseEventStream<T>(
	response: Response,
): AsyncGenerator<StreamingChunk<T>, void, void> {
	const reader = response.body?.getReader();
	if (!reader) {
		return;
	}

	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			if (buffer.trim()) {
				yield parseLine<T>(buffer.trim());
			}
			break;
		}

		buffer += decoder.decode(value, { stream: true });

		let delimiterIndex = buffer.indexOf("\n\n");
		while (delimiterIndex !== -1) {
			const raw = buffer.slice(0, delimiterIndex);
			buffer = buffer.slice(delimiterIndex + 2);

			const line = raw.trim();
			if (line) {
				yield parseLine<T>(line);
			}

			delimiterIndex = buffer.indexOf("\n\n");
		}
	}
}

function parseLine<T>(line: string): StreamingChunk<T> {
	if (!line.startsWith("data:")) {
		return { data: {} as T };
	}

	const payload = line.slice(5).trim();
	if (!payload || payload === "[DONE]") {
		return { data: {} as T };
	}

	const parsed = JSON.parse(payload) as T;
	return { data: parsed, ...(parsed as object) } as StreamingChunk<T>;
}
