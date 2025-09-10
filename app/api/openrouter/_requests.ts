// * OpenRouter request typings (subset aligned with docs)

export type ORTextPart = { type: "text"; text: string };
export type ORImagePart = {
	type: "image_url";
	image_url: { url: string; detail?: string };
};
export type ORUserContent = string | Array<ORTextPart | ORImagePart>;

export type ORMessage =
	| {
			role: "system" | "assistant" | "user";
			content: ORUserContent;
			name?: string;
	  }
	| { role: "tool"; content: string; tool_call_id: string; name?: string };

export type ORFunctionDescription = {
	description?: string;
	name: string;
	parameters: object;
};
export type ORTool = { type: "function"; function: ORFunctionDescription };
export type ORToolChoice =
	| "none"
	| "auto"
	| { type: "function"; function: { name: string } };

export type ORProviderPreferences = {
	order?: string[];
	allow_fallbacks?: boolean;
	require_parameters?: string[];
};

export type ORChatCompletionsRequest = {
	messages?: ORMessage[];
	prompt?: string;
	model?: string;
	response_format?: { type: "json_object" };
	stop?: string | string[];
	stream?: boolean;
	max_tokens?: number;
	temperature?: number;
	tools?: ORTool[];
	tool_choice?: ORToolChoice;
	// Advanced parameters (subset)
	seed?: number;
	top_p?: number;
	top_k?: number;
	frequency_penalty?: number;
	presence_penalty?: number;
	repetition_penalty?: number;
	logit_bias?: Record<number, number>;
	top_logprobs?: number;
	min_p?: number;
	top_a?: number;
	// OpenRouter-only
	transforms?: string[];
	models?: string[];
	route?: "fallback";
	provider?: ORProviderPreferences;
	user?: string;
};

// API keys
export type ORCreateKeyRequest = { name: string; permissions?: string[] };
export type ORPatchKeyRequest = {
	name?: string;
	permissions?: string[];
	active?: boolean;
};
