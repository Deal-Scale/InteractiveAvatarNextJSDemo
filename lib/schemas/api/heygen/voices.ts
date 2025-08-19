import { z } from "zod";

export const VoiceSchema = z.object({
	voice_id: z.string(),
	language: z.string(),
	gender: z.string(),
	name: z.string(),
	preview_audio: z.string().url().optional(),
	support_pause: z.boolean().optional(),
	emotion_support: z.boolean().optional(),
	support_locale: z.boolean().optional(),
});

export const VoicesResponseSchema = z.object({
	voices: z.array(VoiceSchema),
});

export type VoicesResponse = z.infer<typeof VoicesResponseSchema>;
export type Voice = z.infer<typeof VoiceSchema>;
