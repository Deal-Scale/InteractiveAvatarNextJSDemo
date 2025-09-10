import type { ChatProvider, ProviderId } from "@/lib/chat/providers";
import { HeygenAdapter } from "@/lib/providers/HeygenAdapter";
import { PollinationsAdapter } from "@/lib/providers/PollinationsAdapter";
import { GeminiAdapter } from "@/lib/providers/GeminiAdapter";

const registry: Record<ProviderId, ChatProvider> = {
	heygen: HeygenAdapter,
	pollinations: PollinationsAdapter,
	gemini: GeminiAdapter,
};

export const getProvider = (id: ProviderId): ChatProvider => registry[id];

export const listProviders = (): ChatProvider[] => Object.values(registry);
