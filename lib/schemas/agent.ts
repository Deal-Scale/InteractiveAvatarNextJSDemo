import {
	AvatarQuality,
	STTProvider,
	VoiceChatTransport,
	VoiceEmotion,
} from "@heygen/streaming-avatar";
import { z } from "zod";

export const AgentConfigSchema = z.object({
	id: z.string().min(1), // agent ID
	name: z.string().min(1), // display name
	promptStarter: z.string().optional(),
	conversationStarters: z.array(z.string()).optional(),
	avatarId: z.string().optional(), // avatar asset, required only for video modes at session start
	voiceId: z.string().optional(), // default voice
	videoVoiceId: z.string().optional(), // video session voice
	textProvider: z.enum(["openai", "anthropic", "gemini"]).optional(),
	voiceProvider: z
		.enum(["liveavatar", "elevenlabs", "openai", "gemini"])
		.optional(),
	videoVoiceProvider: z
		.enum(["liveavatar", "elevenlabs", "openai", "gemini"])
		.optional(),
	language: z.string().optional(), // default language
	model: z.string().optional(), // backend model (may restrict to allowed list)
	temperature: z.number().min(0).max(2).optional(),
	maxOutputTokens: z.number().int().min(1).max(128000).optional(),
	topP: z.number().min(0).max(1).optional(),
	frequencyPenalty: z.number().min(-2).max(2).optional(),
	presencePenalty: z.number().min(-2).max(2).optional(),
	quality: z.nativeEnum(AvatarQuality).optional(),
	sessionType: z
		.enum(["text", "voice", "video", "all"])
		.optional()
		.default("all"),
	interactionModes: z
		.array(z.enum(["text", "voice", "video"]))
		.optional()
		.default(["text", "voice", "video"]),

	// Connection / transport
	voiceChatTransport: z.nativeEnum(VoiceChatTransport).optional(),

	// Speech-to-text preferences (mirrors UserSettings)
	stt: z
		.object({
			provider: z.nativeEnum(STTProvider).optional(),
			confidenceThreshold: z.number().optional(),
		})
		.optional(),

	// Session idle behavior (mirrors UserSettings)
	disableIdleTimeout: z.boolean().optional(),
	activityIdleTimeout: z.number().int().min(30).max(3600).optional(),

	video: z
		.object({
			resolution: z.enum(["720p", "1080p"]).optional(),

			background: z.enum(["transparent", "blur", "none"]).optional(),
			fps: z.number().int().positive().optional(),
		})
		.optional(),

	audio: z
		.object({
			sampleRate: z.number().int().positive().optional(),
			noiseSuppression: z.boolean().optional(),
			echoCancellation: z.boolean().optional(),
		})
		.optional(),

	// Personality / voice tuning
	voice: z
		.object({
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
	videoVoice: z
		.object({
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

	knowledgeBaseId: z.string().optional(), // if tied to a knowledge base
	contextFiles: z.any().optional().describe("file-upload"),
	canBrowseWeb: z.boolean().optional().default(false),
	canRunCode: z.boolean().optional().default(false),
	canGenerateImages: z.boolean().optional().default(false),
	// List of enabled MCP servers (by id)
	mcpServers: z.array(z.string()).optional(),
	// Optional freeform system prompt or knowledge base text
	systemPrompt: z.string().optional().describe("multiline"),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
