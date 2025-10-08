export interface InlineData {
	mimeType: string;
	data: string;
}

export interface FileData {
	mimeType: string;
	fileUri: string;
}

export interface FunctionCall {
	name: string;
	args?: Record<string, unknown>;
}

export interface FunctionResponse {
	name: string;
	response?: Record<string, unknown>;
}

export interface ContentPart {
	text?: string;
	inlineData?: InlineData;
	fileData?: FileData;
	functionCall?: FunctionCall;
	functionResponse?: FunctionResponse;
	[key: string]: unknown;
}

export interface Content {
	role?: string;
	parts: ContentPart[];
	[key: string]: unknown;
}

export interface SafetySetting {
	category?: string;
	threshold?: string;
}

export interface GenerateContentRequest {
	contents: Content[];
	systemInstruction?: Content;
	tools?: Record<string, unknown>[];
	toolConfig?: Record<string, unknown>;
	generationConfig?: Record<string, unknown>;
	safetySettings?: SafetySetting[];
	cachedContent?: string;
	[key: string]: unknown;
}

export interface Candidate {
	index?: number;
	content?: Content;
	finishReason?: string;
	safetyRatings?: Record<string, unknown>[];
	[key: string]: unknown;
}

export interface GenerateContentResponse {
	candidates?: Candidate[];
	usageMetadata?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface CountTokensRequest {
	contents: Content[];
	model?: string;
	systemInstruction?: Content;
	[key: string]: unknown;
}

export interface CountTokensResponse {
	totalTokens?: number;
	totalBillableTokens?: number;
	modelVersion?: string;
	[key: string]: unknown;
}

export interface StreamingResponseChunk {
	candidates?: Array<{
		content?: Content;
		finishReason?: string;
		[key: string]: unknown;
	}>;
	usageMetadata?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface VertexErrorPayload {
	code?: number;
	message: string;
	status?: string;
	details?: Record<string, unknown>[];
	[key: string]: unknown;
}

export interface VertexError {
	error: VertexErrorPayload;
	[key: string]: unknown;
}
