import { z } from "zod";

const metadataValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
]);

const contentBaseSchema = z
	.object({
		type: z.string().min(1),
	})
	.passthrough();

const textContentSchema = contentBaseSchema.extend({
	type: z.literal("text"),
	text: z.string(),
});

const imageContentSchema = contentBaseSchema.extend({
	type: z.literal("image"),
	source: z
		.object({
			type: z.enum(["base64", "url"]),
			media_type: z.string().min(1),
			data: z.string().optional(),
			url: z.string().url().optional(),
		})
		.refine((value) => Boolean(value.data || value.url), {
			message: "Image source requires data or url",
		}),
});

const toolResultContentSchema = contentBaseSchema.extend({
	type: z.literal("tool_result"),
	tool_use_id: z.string().min(1),
	content: z.array(contentBaseSchema).optional(),
	is_error: z.boolean().optional(),
});

const requestMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system", "tool"]),
	content: z
		.array(
			z.union([
				textContentSchema,
				imageContentSchema,
				toolResultContentSchema,
				contentBaseSchema,
			]),
		)
		.min(1),
});

const toolSchema = z.object({
	name: z
		.string()
		.min(1)
		.max(64)
		.regex(/^[a-zA-Z0-9_\-]+$/),
	description: z.string().min(1).max(400).optional(),
	input_schema: z.object({
		type: z.literal("object"),
		properties: z.record(z.string(), z.any()).default({}),
		required: z.array(z.string()).default([]),
	}),
});

export const messageRequestSchema = z.object({
	model: z.string().min(1),
	max_tokens: z.number().int().positive(),
	messages: z.array(requestMessageSchema).min(1),
	system: z.union([z.string(), z.array(textContentSchema)]).optional(),
	metadata: z.record(z.string(), metadataValueSchema).optional(),
	temperature: z.number().min(0).max(1).optional(),
	top_p: z.number().min(0).max(1).optional(),
	top_k: z.number().int().min(1).optional(),
	stop_sequences: z.array(z.string()).optional(),
	tools: z.array(toolSchema).optional(),
});

const toolUseContentSchema = contentBaseSchema.extend({
	type: z.literal("tool_use"),
	id: z.string().min(1),
	name: z.string().min(1),
	input: z.record(z.string(), z.any()).default({}),
});

const responseContentSchema = z.union([
	textContentSchema,
	imageContentSchema,
	toolUseContentSchema,
	toolResultContentSchema,
	contentBaseSchema,
]);

export const messageResponseSchema = z.object({
	id: z.string().min(1),
	type: z.literal("message"),
	role: z.string().min(1),
	model: z.string().min(1),
	stop_reason: z.string().nullable().optional(),
	usage: z
		.object({
			input_tokens: z.number().int().nonnegative(),
			output_tokens: z.number().int().nonnegative(),
		})
		.optional(),
	content: z.array(responseContentSchema),
});

const streamMessageStartSchema = z.object({
	type: z.literal("message_start"),
	message: messageResponseSchema
		.pick({ id: true, type: true, role: true, model: true })
		.extend({
			stop_reason: z.string().nullable().optional(),
		}),
});

const streamContentBlockStartSchema = z.object({
	type: z.literal("content_block_start"),
	index: z.number().int().nonnegative(),
	content_block: responseContentSchema,
});

const streamContentBlockDeltaSchema = z.object({
	type: z.literal("content_block_delta"),
	index: z.number().int().nonnegative(),
	delta: z.object({
		type: z.string().min(1),
		text: z.string().optional(),
	}),
});

const streamContentBlockStopSchema = z.object({
	type: z.literal("content_block_stop"),
	index: z.number().int().nonnegative(),
});

const streamMessageDeltaSchema = z.object({
	type: z.literal("message_delta"),
	delta: z.record(z.string(), z.any()).optional(),
});

const streamMessageStopSchema = z.object({
	type: z.literal("message_stop"),
});

export const streamEventSchema = z.union([
	streamMessageStartSchema,
	streamContentBlockStartSchema,
	streamContentBlockDeltaSchema,
	streamContentBlockStopSchema,
	streamMessageDeltaSchema,
	streamMessageStopSchema,
]);

export type MessageRequest = z.infer<typeof messageRequestSchema>;
export type MessageResponse = z.infer<typeof messageResponseSchema>;
export type StreamEvent = z.infer<typeof streamEventSchema>;
