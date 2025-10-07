import { AvatarQuality } from "@heygen/streaming-avatar";
import { z } from "zod";

export const UserSettingsSchema = z.object({
	userId: z.string().min(1),
	organizationId: z.string().optional(),

	// General preferences
	language: z.string().min(1, "Language is required"),
	quality: z
		.union([z.nativeEnum(AvatarQuality), z.enum(["high", "medium", "low"])])
		.refine((v) => v != null && String(v).length > 0, {
			message: "Quality is required",
		}),
	// Fields moved to AgentConfig: voiceChatTransport, stt, disableIdleTimeout, activityIdleTimeout
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// App-level (global) settings for the demo UI
export const AppGlobalSettingsSchema = z.object({
	theme: z.enum(["system", "dark", "light"]).default("system"),
	telemetryEnabled: z.boolean().default(false),
	apiBaseUrl: z.string().url().default("https://api.heygen.com"),
});

export type AppGlobalSettings = z.infer<typeof AppGlobalSettingsSchema>;
