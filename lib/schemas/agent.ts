import { z } from "zod";
import { STTProvider, VoiceChatTransport, VoiceEmotion, AvatarQuality } from "@heygen/streaming-avatar";

export const AgentConfigSchema = z.object({
  id: z.string().min(1), // agent ID
  name: z.string().min(1), // display name
  avatarId: z.string().min(1), // avatar asset
  voiceId: z.string().optional(), // default voice
  language: z.string().optional(), // default language
  model: z.string().optional(), // backend model (may restrict to allowed list)
  temperature: z.number().min(0).max(2).optional(),
  quality: z.nativeEnum(AvatarQuality).optional(),

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

  knowledgeBaseId: z.string().optional(), // if tied to a knowledge base
  // List of enabled MCP servers (by id)
  mcpServers: z.array(z.string()).optional(),
  // Optional freeform system prompt or knowledge base text
  systemPrompt: z.string().optional().describe("multiline"),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
