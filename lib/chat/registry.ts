import type { ChatProvider, ProviderId } from "@/lib/chat/providers";
import { HeygenAdapter } from "@/lib/providers/HeygenAdapter";
import { PollinationsAdapter } from "@/lib/providers/PollinationsAdapter";

const registry: Record<ProviderId, ChatProvider> = {
	heygen: HeygenAdapter,
	pollinations: PollinationsAdapter,
};

export const getProvider = (id: ProviderId): ChatProvider => registry[id];

export const listProviders = (): ChatProvider[] => Object.values(registry);
