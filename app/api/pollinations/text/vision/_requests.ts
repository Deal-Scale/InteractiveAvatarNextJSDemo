export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
	role: ChatRole;
	// Can be string for normal text, or richer structures for vision/audio
	content: unknown;
}

export interface ChatCompletionRequest {
	model: string;
	messages: ChatMessage[];
	seed?: number;
	temperature?: number; // 0.0 - 3.0
	top_p?: number; // 0.0 - 1.0
	presence_penalty?: number; // -2.0 - 2.0
	frequency_penalty?: number; // -2.0 - 2.0
	stream?: boolean; // default false
	jsonMode?: boolean; // legacy alias for response_format
	response_format?: { type: string } | { type: "json_object" };
	tools?: unknown[];
	tool_choice?: unknown;
	private?: boolean; // default false
	referrer?: string;
}

export function isStreamingRequest(body: ChatCompletionRequest): boolean {
	return !!body?.stream;
}
