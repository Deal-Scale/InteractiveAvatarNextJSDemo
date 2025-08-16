import z from "zod";
import { VoiceEmotion } from "@heygen/streaming-avatar";

export const AgentConfigSchema = z.object({
  id: z.string().min(1), // agent ID
  name: z.string().min(1), // display name
  avatarId: z.string().min(1), // avatar asset
  voiceId: z.string().optional(), // default voice
  language: z.string().optional(), // default language
  model: z.string().optional(), // backend model (may restrict to allowed list)
  temperature: z.number().min(0).max(2).optional(),

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
});
