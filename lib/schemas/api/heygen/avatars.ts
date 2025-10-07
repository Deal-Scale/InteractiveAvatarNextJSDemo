import { z } from "zod";

export const StreamingAvatarSchema = z.object({
	avatar_id: z.string(),
	created_at: z.number(),
	default_voice: z.string().optional(),
	is_public: z.boolean().optional(),
	normal_preview: z.string().url().optional(),
	pose_name: z.string().optional(),
	status: z.string().optional(),
});

export const AvatarsResponseSchema = z.object({
	code: z.number(),
	message: z.string(),
	data: z.array(StreamingAvatarSchema),
});

export type AvatarsResponse = z.infer<typeof AvatarsResponseSchema>;
export type StreamingAvatar = z.infer<typeof StreamingAvatarSchema>;
