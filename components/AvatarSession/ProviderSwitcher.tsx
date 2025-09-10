"use client";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { Button } from "@/components/ui/button";
import { useGeminiAvailability } from "./hooks/useGeminiAvailability";
import { useHeygenAvailability } from "./hooks/useHeygenAvailability";
import { usePollinationsAvailability } from "./hooks/usePollinationsAvailability";
import { useOpenRouterAvailability } from "./hooks/useOpenRouterAvailability";
import { useEffect } from "react";

export const ProviderSwitcher = () => {
	const mode = useChatProviderStore((s) => s.mode);
	const setMode = useChatProviderStore((s) => s.setMode);
	const { available: geminiOk, checking: geminiChecking } =
		useGeminiAvailability();
	const { available: heygenOk, checking: heygenChecking } =
		useHeygenAvailability();
	const { available: pollOk, checking: pollChecking } =
		usePollinationsAvailability();
	const { available: orOk, checking: orChecking } = useOpenRouterAvailability();

	// Auto-fallback if current mode becomes unavailable. Priority: pollinations -> heygen -> gemini -> openrouter
	useEffect(() => {
		const tryFallback = (
			...choices: ("pollinations" | "heygen" | "gemini" | "openrouter")[]
		) => {
			for (const c of choices) {
				if (c === "pollinations" && pollOk) return setMode("pollinations");
				if (c === "heygen" && heygenOk) return setMode("heygen");
				if (c === "gemini" && geminiOk) return setMode("gemini");
				if (c === "openrouter" && orOk) return setMode("openrouter");
			}
		};

		if (mode === "gemini" && !geminiChecking && !geminiOk) {
			return tryFallback("pollinations", "heygen", "openrouter");
		}
		if (mode === "heygen" && !heygenChecking && !heygenOk) {
			return tryFallback("pollinations", "gemini", "openrouter");
		}
		if (mode === "pollinations" && !pollChecking && !pollOk) {
			return tryFallback("heygen", "gemini", "openrouter");
		}
		if (mode === "openrouter" && !orChecking && !orOk) {
			return tryFallback("pollinations", "heygen", "gemini");
		}
	}, [
		mode,
		geminiOk,
		geminiChecking,
		heygenOk,
		heygenChecking,
		pollOk,
		pollChecking,
		orOk,
		orChecking,
		setMode,
	]);

	return (
		<div className="mb-3 flex items-center gap-2">
			<span className="text-xs text-muted-foreground">Chat provider:</span>
			<div className="flex rounded-md overflow-hidden border border-input">
				<Button
					type="button"
					size="sm"
					variant={mode === "heygen" ? "default" : "ghost"}
					onClick={() => setMode("heygen")}
					aria-pressed={mode === "heygen"}
					disabled={!heygenOk || heygenChecking}
					aria-disabled={!heygenOk || heygenChecking}
					title={!heygenOk ? "Heygen unavailable" : undefined}
				>
					Heygen
				</Button>
				<Button
					type="button"
					size="sm"
					variant={mode === "pollinations" ? "default" : "ghost"}
					onClick={() => setMode("pollinations")}
					aria-pressed={mode === "pollinations"}
					disabled={!pollOk || pollChecking}
					aria-disabled={!pollOk || pollChecking}
					title={!pollOk ? "Pollinations unavailable" : undefined}
				>
					Pollinations
				</Button>
				<Button
					type="button"
					size="sm"
					variant={mode === "gemini" ? "default" : "ghost"}
					onClick={() => setMode("gemini")}
					aria-pressed={mode === "gemini"}
					disabled={!geminiOk || geminiChecking}
					aria-disabled={!geminiOk || geminiChecking}
					title={!geminiOk ? "Gemini unavailable" : undefined}
				>
					Gemini
				</Button>
				<Button
					type="button"
					size="sm"
					variant={mode === "openrouter" ? "default" : "ghost"}
					onClick={() => setMode("openrouter")}
					aria-pressed={mode === "openrouter"}
					disabled={!orOk || orChecking}
					aria-disabled={!orOk || orChecking}
					title={!orOk ? "OpenRouter unavailable" : undefined}
				>
					OpenRouter
				</Button>
			</div>
		</div>
	);
};
