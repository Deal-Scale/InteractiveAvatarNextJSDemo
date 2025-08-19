import { z } from "zod";
import {
	AvatarQuality,
	STTProvider,
	VoiceChatTransport,
	VoiceEmotion,
} from "@heygen/streaming-avatar";

// Minimal request schema for starting a Heygen avatar session
// Captures fields referenced by the UI and keeps it permissive where needed
export const StartAvatarRequestSchema = z.object({
	// UI/legacy fields
	avatarName: z.string().default(""),
	language: z.string().default("en-US"),
	quality: z
		.union([z.nativeEnum(AvatarQuality), z.enum(["high", "medium", "low"])])
		.default("medium"),
	voiceChatTransport: z.nativeEnum(VoiceChatTransport).optional(),

	// Heygen fields
	avatar_id: z.string().optional(),
	video_encoding: z.enum(["VP8", "H264"]).default("VP8"),
	version: z.string().default("v2"),
	knowledge_base: z.unknown().optional(),
	knowledge_base_id: z.string().optional(),
	knowledgeId: z.string().optional(),
	disable_idle_timeout: z.boolean().default(false),
	activity_idle_timeout: z.number().int().default(120),

	// Voice settings
	voice: z
		.object({
			voice_id: z.string().optional(),
			rate: z.number().optional(),
			emotion: z
				.union([
					z.nativeEnum(VoiceEmotion),
					z.enum(["Excited", "Serious", "Friendly", "Soothing", "Broadcaster"]),
				])
				.optional(),
			elevenlabs_settings: z
				.object({
					stability: z.number().optional(),
					model_id: z.string().optional(),
					similarity_boost: z.number().optional(),
					style: z.number().optional(),
					use_speaker_boost: z.boolean().optional(),
				})
				.optional(),
		})
		.optional(),
	voice_name: z.string().optional(),

	// STT settings
	stt_settings: z
		.object({
			provider: z.nativeEnum(STTProvider).optional(),
		})
		.optional(),
	sttSettings: z
		.object({
			provider: z.nativeEnum(STTProvider).optional(),
		})
		.optional(),
});

export type StartAvatarRequest = z.infer<typeof StartAvatarRequestSchema>;
