import { z } from "zod";

const TextContentPartSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
});

const ImageUrlPartSchema = z.object({
	type: z.literal("image_url"),
	image_url: z.union([
		z.string(),
		z.object({
			url: z.string(),
			detail: z.enum(["low", "high", "auto"]).optional(),
		}),
	]),
});

const ToolResultPartSchema = z.object({
	type: z.literal("tool_result"),
	tool_call_id: z.string(),
	content: z.union([z.string(), z.array(TextContentPartSchema)]).optional(),
	is_error: z.boolean().optional(),
});

const ToolUsePartSchema = z.object({
	type: z.literal("tool_use"),
	id: z.string(),
	name: z.string(),
	input: z.unknown(),
});

const MessageContentPartSchema = z.union([
	TextContentPartSchema,
	ImageUrlPartSchema,
	ToolResultPartSchema,
	ToolUsePartSchema,
]);

const MessageContentSchema = z.union([
	z.string(),
	z.array(MessageContentPartSchema).min(1),
]);

const BaseMessageSchema = z
	.object({
		role: z.enum(["system", "user", "assistant", "tool"]),
		content: MessageContentSchema,
		name: z.string().optional(),
		prefix: z.boolean().optional(),
		tool_call_id: z.string().optional(),
		metadata: z.object({}).catchall(z.unknown()).optional(),
	})
	.superRefine((message, ctx) => {
		if (message.role === "tool" && !message.tool_call_id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["tool_call_id"],
				message: "tool messages must include tool_call_id",
			});
		}

		if (message.prefix && message.role !== "assistant") {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["prefix"],
				message: "prefix can only be set on assistant messages",
			});
		}
	});

const ToolCallSchema = z.object({
	id: z.string(),
	type: z.literal("function"),
	function: z.object({
		name: z.string(),
		arguments: z.string(),
		strict: z.boolean().optional(),
	}),
});

export const ChatCompletionRequestSchema = z.object({
	model: z.string(),
	messages: z.array(BaseMessageSchema).min(1),
	stream: z.boolean().optional(),
	stream_options: z
		.object({
			include_usage: z.boolean().optional(),
		})
		.optional(),
	temperature: z.number().min(0).max(2).optional(),
	top_p: z.number().min(0).max(1).optional(),
	max_tokens: z.number().int().positive().optional(),
	stop: z.union([z.string(), z.array(z.string())]).optional(),
	frequency_penalty: z.number().min(-2).max(2).optional(),
	presence_penalty: z.number().min(-2).max(2).optional(),
	logprobs: z.boolean().optional(),
	top_logprobs: z.number().int().min(0).max(20).optional(),
	tools: z
		.array(
			z.object({
				type: z.literal("function"),
				function: z.object({
					name: z.string(),
					description: z.string().optional(),
					strict: z.boolean().optional(),
					parameters: z.object({}).catchall(z.unknown()).optional(),
				}),
			}),
		)
		.optional(),
	tool_choice: z
		.union([
			z.literal("auto"),
			z.literal("none"),
			z.object({
				type: z.literal("function"),
				function: z.object({ name: z.string() }),
			}),
		])
		.optional(),
	response_format: z
		.union([
			z.literal("json_object"),
			z.object({
				type: z.literal("json_schema"),
				json_schema: z.object({
					name: z.string(),
					schema: z.object({}).catchall(z.unknown()),
				}),
			}),
		])
		.optional(),
});

const TokenLogprobSchema = z.object({
	token: z.string(),
	logprob: z.number(),
	bytes: z.array(z.number()).optional(),
});

const LogprobItemSchema = TokenLogprobSchema.extend({
	top_logprobs: z.array(TokenLogprobSchema).optional(),
});

const ChatCompletionChoiceSchema = z.object({
	index: z.number().int(),
	message: BaseMessageSchema.extend({
		tool_calls: z.array(ToolCallSchema).optional(),
		reasoning_content: z.array(z.any()).optional(),
	}),
	logprobs: z
		.object({ content: z.array(LogprobItemSchema).optional() })
		.optional(),
	finish_reason: z.string().nullable(),
});

const UsageSchema = z.object({
	prompt_tokens: z.number().int().nonnegative(),
	completion_tokens: z.number().int().nonnegative().optional(),
	total_tokens: z.number().int().nonnegative(),
	prompt_cache_hit_tokens: z.number().int().nonnegative().optional(),
	prompt_cache_miss_tokens: z.number().int().nonnegative().optional(),
});

export const ChatCompletionResponseSchema = z.object({
	id: z.string(),
	object: z.literal("chat.completion"),
	model: z.string(),
	created: z.number().int(),
	system_fingerprint: z.string(),
	choices: z.array(ChatCompletionChoiceSchema),
	usage: UsageSchema.optional(),
});

export const ReasoningRequestSchema = ChatCompletionRequestSchema.extend({
	reasoning: z
		.object({
			effort: z.enum(["low", "medium", "high"]).optional(),
			planning: z.boolean().optional(),
		})
		.optional(),
});

export const ReasoningResponseSchema = ChatCompletionResponseSchema.extend({
	reasoning_content: z.array(z.any()).optional(),
});

const EmbeddingInputSchema = z.union([
	z.string(),
	z.array(z.string()),
	z.array(z.array(z.number())),
]);

export const EmbeddingRequestSchema = z.object({
	model: z.string(),
	input: EmbeddingInputSchema,
	encoding_format: z.enum(["float", "base64"]).optional(),
	dimensions: z.number().int().positive().optional(),
});

export const EmbeddingItemSchema = z.object({
	index: z.number().int(),
	embedding: z.array(z.number()),
	object: z.literal("embedding"),
});

export const EmbeddingResponseSchema = z.object({
	object: z.literal("list"),
	data: z.array(EmbeddingItemSchema),
	usage: z
		.object({
			prompt_tokens: z.number().int().nonnegative(),
			total_tokens: z.number().int().nonnegative(),
		})
		.optional(),
});

export const SpeechSynthesisRequestSchema = z.object({
	model: z.string(),
	input: z.string(),
	voice: z.string(),
	format: z.enum(["mp3", "wav", "flac", "pcm"]).optional(),
	speed: z.number().positive().max(4).optional(),
});

export const SpeechSynthesisResponseSchema = z.object({
	audio: z.string(),
	format: z.string(),
});

export const ModelSchema = z.object({
	id: z.string(),
	object: z.literal("model"),
	created: z.number().int().optional(),
	owned_by: z.string().optional(),
	permissions: z.array(z.object({}).catchall(z.unknown())).optional(),
});

export const ListModelsResponseSchema = z.object({
	object: z.literal("list"),
	data: z.array(ModelSchema),
});

const BalanceInfoSchema = z.object({
	balance_name: z.string(),
	balance: z.union([z.string(), z.number()]).optional(),
	currency: z.string().optional(),
	expires_at: z.string().optional(),
});

export const BalanceResponseSchema = z.object({
	is_available: z.boolean(),
	balance_infos: z.array(BalanceInfoSchema),
});
