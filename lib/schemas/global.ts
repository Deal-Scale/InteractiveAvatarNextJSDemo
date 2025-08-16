import {
  AvatarQuality,
  STTProvider,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";
import { z } from "zod";

export const UserSettingsSchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().optional(),

  // General preferences
  language: z.string().default("en-US"),
  quality: z
    .union([z.nativeEnum(AvatarQuality), z.enum(["high", "medium", "low"])])
    .default("high"),

  // Transport / connection
  voiceChatTransport: z
    .nativeEnum(VoiceChatTransport)
    .default(VoiceChatTransport.WEBSOCKET),

  // Speech-to-text preferences
  stt: z
    .object({
      provider: z.nativeEnum(STTProvider).optional(),
      confidenceThreshold: z.number().optional(),
    })
    .optional(),

  // Session timeout / idle prefs
  disableIdleTimeout: z.boolean().optional(),
  activityIdleTimeout: z.number().int().min(30).max(3600).optional(),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// App-level (global) settings for the demo UI
export const AppGlobalSettingsSchema = z.object({
  theme: z.enum(["system", "dark", "light"]).default("system"),
  telemetryEnabled: z.boolean().default(false),
  apiBaseUrl: z.string().url().default("https://api.heygen.com"),
});

export type AppGlobalSettings = z.infer<typeof AppGlobalSettingsSchema>;