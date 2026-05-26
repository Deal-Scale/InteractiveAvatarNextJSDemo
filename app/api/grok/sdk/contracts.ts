export interface RequestOptions {
	readonly path: string;
	readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	readonly query?: Record<string, string | number | boolean | undefined>;
	readonly body?: unknown;
	readonly headers?: Record<string, string>;
}

export interface StreamingChunk<T> {
	readonly text?: string;
	readonly data: T;
}

export interface TextRequest {
	readonly model: string;
	readonly prompt: string;
	readonly maxTokens?: number;
	readonly temperature?: number;
	readonly stream?: boolean;
	readonly metadata?: Record<string, unknown>;
}

export interface TextResponse {
	readonly text: string;
	readonly usage?: {
		readonly tokens: number;
	};
	readonly reasoning?: string;
}

export interface ObjectRequest<TSchema> extends TextRequest {
	readonly schema: TSchema;
}

export interface ObjectResponse<T> {
	readonly object: T;
	readonly usage?: TextResponse["usage"];
}

export interface EmbeddingRequest {
	readonly model: string;
	readonly input: string | string[];
}

export interface EmbeddingItem {
	readonly id?: string;
	readonly vector: number[];
	readonly metadata?: Record<string, unknown>;
}

export interface EmbeddingResponse {
	readonly vector: number[];
	readonly id?: string;
	readonly metadata?: Record<string, unknown>;
}

export interface EmbeddingBatchResponse {
	readonly items: EmbeddingResponse[];
	readonly errors: Error[];
}

export interface ImageGenerationRequest {
	readonly model: string;
	readonly prompt: string;
	readonly size?: string;
	readonly pollIntervalMs?: number;
}

export interface ImageGenerationResponse {
	readonly images: string[];
	readonly status: "queued" | "processing" | "succeeded";
}

export interface TranscriptionRequest {
	readonly model: string;
	readonly file: File | Blob;
	readonly language?: string;
}

export interface TranscriptionResponse {
	readonly text: string;
	readonly words?: Array<{
		readonly start: number;
		readonly end: number;
		readonly text: string;
	}>;
}

export interface SpeechRequest {
	readonly model: string;
	readonly text: string;
	readonly voice?: string;
	readonly format?: "mp3" | "wav" | "ogg";
}

export interface ProviderDefinition {
	readonly name: string;
	readonly baseUrl: string;
	readonly models: string[];
	readonly metadata?: Record<string, unknown>;
}

export interface ToolDefinition<TArgs = unknown, TResult = unknown> {
	readonly name: string;
	readonly description: string;
	readonly schema: { parse(data: unknown): TArgs };
	readonly handler: (args: TArgs) => Promise<TResult> | TResult;
}

export interface DynamicToolDefinition<TArgs = unknown, TResult = unknown> {
	readonly name: string;
	readonly description: string;
	readonly schema: { parse(data: unknown): TArgs };
	readonly resolver: () =>
		| Promise<ToolDefinition<TArgs, TResult>>
		| ToolDefinition<TArgs, TResult>;
}

export type MiddlewareContext<TInput, TOutput> = {
	readonly input: TInput;
	readonly next: (input: TInput) => Promise<TOutput>;
};

export interface MCPTransport<Request, Response> {
	send(payload: Request): Promise<Response>;
	close?(): Promise<void> | void;
}
