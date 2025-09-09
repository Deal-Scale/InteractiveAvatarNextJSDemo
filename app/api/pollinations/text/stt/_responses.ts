export interface ChatChoiceMessageDelta {
	role?: string;
	content?: string;
}

export interface ChatChoiceMessage {
	role: string;
	content: string;
}

export interface ChatChoice {
	index: number;
	finish_reason?: string | null;
	message?: ChatChoiceMessage;
	delta?: ChatChoiceMessageDelta; // present in streaming chunks
}

export interface ChatCompletionResponse {
	id?: string;
	created?: number;
	model?: string;
	choices: ChatChoice[];
}

// Streaming chunks: each SSE `data:` is a JSON with at least { choices: [{ delta: { content } }] }
export type ChatStreamChunk = ChatCompletionResponse;
1;
