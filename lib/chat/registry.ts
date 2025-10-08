import type { ChatProvider, ProviderId } from "@/lib/chat/providers";
import { HeygenAdapter } from "@/lib/providers/HeygenAdapter";
import { PollinationsAdapter } from "@/lib/providers/PollinationsAdapter";
import { GeminiAdapter } from "@/lib/providers/GeminiAdapter";
import { OpenRouterAdapter } from "@/lib/providers/OpenRouterAdapter";
import { ClaudeAdapter } from "@/lib/providers/ClaudeAdapter";
import { OpenAIChatAdapter } from "@/lib/providers/OpenAIChatAdapter";
import { DeepSeekAdapter } from "@/lib/providers/DeepSeekAdapter";

const registry: Record<ProviderId, ChatProvider> = {
	heygen: HeygenAdapter,
	pollinations: PollinationsAdapter,
	gemini: GeminiAdapter,
	openrouter: OpenRouterAdapter,
	claude: ClaudeAdapter,
	openai: OpenAIChatAdapter,
	deepseek: DeepSeekAdapter,
};

export const getProvider = (id: ProviderId): ChatProvider => registry[id];

export const listProviders = (): ChatProvider[] => Object.values(registry);
