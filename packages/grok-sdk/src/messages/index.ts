import { z } from "zod";

const ToolCallSchema = z.object({
	id: z.string(),
	name: z.string(),
	arguments: z.record(z.unknown()),
});

export const ModelMessageSchema = z.object({
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	toolCalls: z.array(ToolCallSchema).optional(),
});

export type ModelMessage = z.infer<typeof ModelMessageSchema>;

export const UIMessageSchema = z.object({
	id: z.string(),
	role: z.enum(["user", "assistant"]),
	content: z.string(),
});

export type UIMessage = z.infer<typeof UIMessageSchema>;

export function validateUIMessages(messages: UIMessage[]): UIMessage[] {
	return z.array(UIMessageSchema).parse(messages);
}

export function safeValidateUIMessages(
	messages: UIMessage[],
): { success: true; data: UIMessage[] } | { success: false; error: unknown } {
	try {
		const data = validateUIMessages(messages);
		return { success: true, data };
	} catch (error) {
		return { success: false, error };
	}
}
