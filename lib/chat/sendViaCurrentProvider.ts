import { getProvider } from "@/lib/chat/registry";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

export type ProviderId = Parameters<typeof getProvider>[0];

// ? Availability endpoints for each provider (client-side health checks)
async function isProviderAvailable(id: ProviderId): Promise<boolean> {
	try {
		if (id === "gemini") {
			const res = await fetch("/api/gemini-stream?health=1", {
				headers: { "Cache-Control": "no-cache" },
			});
			return res.status === 204;
		}
		if (id === "heygen") {
			const res = await fetch("/api/streaming/health", {
				headers: { "Cache-Control": "no-cache" },
			});
			return res.status === 204;
		}
		if (id === "pollinations") {
			const res = await fetch("/api/pollinations/health", {
				headers: { "Cache-Control": "no-cache" },
			});
			return res.status === 204;
		}
		if (id === "openrouter") {
			const res = await fetch("/api/openrouter/health", {
				headers: { "Cache-Control": "no-cache" },
			});
			return res.status === 204;
		}
		return false;
	} catch {
		return false;
	}
}

export interface SendOptions {
	timeoutMs?: number; // default 30s
	checkAvailability?: boolean; // default true
	fallbackOrder?: ProviderId[]; // optional fallback providers
	// UI callbacks (e.g., to show toasts)
	onFallback?: (from: ProviderId, to: ProviderId) => void;
	onUnavailable?: (id: ProviderId) => void;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
	const ac = new AbortController();
	const t = setTimeout(() => ac.abort(), ms);
	try {
		// If the promise is a fetch, it should respect the signal; for provider adapters we just race a reject.
		const raced = await Promise.race([
			p,
			new Promise<T>((_, rej) =>
				ac.signal.addEventListener("abort", () =>
					rej(new Error("Request timed out")),
				),
			),
		]);
		return raced as T;
	} finally {
		clearTimeout(t);
	}
}

export async function sendViaProvider(
	providerId: ProviderId,
	params: { history: Message[]; input: string },
	options: SendOptions = {},
): Promise<Message> {
	const {
		timeoutMs = 30_000,
		checkAvailability = true,
		fallbackOrder = [],
		onFallback,
		onUnavailable,
	} = options;

	// Optional availability check + fallback
	let chosen: ProviderId = providerId;
	if (checkAvailability) {
		const ok = await isProviderAvailable(providerId);
		if (!ok) {
			onUnavailable?.(providerId);
			for (const alt of fallbackOrder) {
				if (await isProviderAvailable(alt)) {
					chosen = alt;
					break;
				}
			}
			if (chosen !== providerId) {
				// notify UI that we are falling back
				onFallback?.(providerId, chosen);
			} else {
				return {
					id: `resp-${Date.now()}`,
					sender: MessageSender.AVATAR,
					content: `Provider ${providerId} is unavailable. Please try again later or switch providers.`,
					provider: providerId,
					toolParts: [
						{
							type: "provider",
							state: "output-error",
							errorText: `unavailable:${providerId}`,
						},
					],
				} as Message;
			}
		}
	}

	try {
		const provider = getProvider(chosen);
		const result = await withTimeout(provider.sendMessage(params), timeoutMs);
		// Attach provider metadata for UI transparency
		return {
			...result,
			provider: chosen,
			...(chosen !== providerId ? { fallbackFrom: providerId } : {}),
		} as Message;
	} catch (e: unknown) {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `Error from ${chosen}: ${(e as Error).message}`,
			provider: chosen,
			...(chosen !== providerId ? { fallbackFrom: providerId } : {}),
			toolParts: [
				{
					type: "provider",
					state: "output-error",
					errorText: (e as Error).message,
				},
			],
		} as Message;
	}
}

export function useSendViaCurrentProvider() {
	const mode = useChatProviderStore((s) => s.mode);
	const send = async (
		params: { history: Message[]; input: string },
		options: SendOptions = {},
	) => {
		// Default sensible fallback order prioritizes text providers for resilience
		const fallback =
			options.fallbackOrder ??
			(["pollinations", "heygen", "gemini", "openrouter"].filter(
				(p) => p !== mode,
			) as ProviderId[]);
		return sendViaProvider(mode as ProviderId, params, {
			...options,
			fallbackOrder: fallback,
		});
	};
	return { mode, send } as const;
}
