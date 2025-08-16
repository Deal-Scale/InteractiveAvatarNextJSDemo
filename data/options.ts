import { STTProvider, VoiceChatTransport, VoiceEmotion } from "@heygen/streaming-avatar";

export type Option = { value: string; label: string };

// Generic helpers
export const enumToOptions = (e: Record<string, string | number>): Option[] => {
  return Object.values(e)
    .filter((v): v is string => typeof v === "string")
    .map((v) => ({ value: v, label: v }));
};

export const arrayToOptions = (arr: string[]): Option[] => arr.map((v) => ({ value: v, label: v }));

// Common static option sets (extend as needed)
export const languagesOptions: Option[] = arrayToOptions([
  "en-US",
  "en-GB",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "pt-BR",
  "ja-JP",
  "ko-KR",
  "zh-CN",
]);

// HeyGen SDK enums
export const sttProviderOptions: Option[] = enumToOptions(STTProvider as unknown as Record<string, string | number>);
export const voiceChatTransportOptions: Option[] = enumToOptions(VoiceChatTransport as unknown as Record<string, string | number>);
export const voiceEmotionOptions: Option[] = enumToOptions(VoiceEmotion as unknown as Record<string, string | number>);

// Placeholder loaders for future API-driven lists
export const loadAvatarOptions = async (): Promise<Option[]> => {
  try {
    const res = await fetch("/api/avatars", { cache: "no-store" });
    const json: any = await res.json();
    // Try a few common shapes
    const list =
      (Array.isArray(json?.data?.avatars) && json.data.avatars) ||
      (Array.isArray(json?.avatars) && json.avatars) ||
      (Array.isArray(json?.data) && json.data) ||
      [];
    const opts: Option[] = list
      .map((item: any) => {
        const id = item?.avatarId || item?.avatar_id || item?.id;
        const name = item?.name || item?.avatarName || item?.avatar_name || id;
        return id ? { value: String(id), label: String(name ?? id) } : undefined;
      })
      .filter(Boolean);
    return opts;
  } catch {
    return [];
  }
};

export const loadVoiceOptions = async (): Promise<Option[]> => {
  try {
    const res = await fetch("/api/voices", { cache: "no-store" });
    const json: any = await res.json();
    const list =
      (Array.isArray(json?.data?.voices) && json.data.voices) ||
      (Array.isArray(json?.voices) && json.voices) ||
      (Array.isArray(json?.data) && json.data) ||
      [];
    const opts: Option[] = list
      .map((item: any) => {
        const id = item?.voiceId || item?.voice_id || item?.id;
        const name = item?.name || item?.voiceName || item?.voice_name || id;
        return id ? { value: String(id), label: String(name ?? id) } : undefined;
      })
      .filter(Boolean);
    return opts;
  } catch {
    return [];
  }
};

export const loadMcpServerOptions = async (): Promise<Option[]> => {
  try {
    const res = await fetch("/api/mcp/servers", { cache: "no-store" });
    const json: any = await res.json();
    const list =
      (Array.isArray(json?.servers) && json.servers) ||
      (Array.isArray(json?.data?.servers) && json.data.servers) ||
      [];
    const opts: Option[] = list
      .map((s: any) => {
        const id = s?.id || s?.name;
        const label = s?.description || id;
        return id ? { value: String(id), label: String(label ?? id) } : undefined;
      })
      .filter(Boolean);
    return opts;
  } catch {
    return [];
  }
};
