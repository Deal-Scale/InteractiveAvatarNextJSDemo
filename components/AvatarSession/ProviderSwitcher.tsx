"use client";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { Button } from "@/components/ui/button";
import { useGeminiAvailability } from "./hooks/useGeminiAvailability";
import { useHeygenAvailability } from "./hooks/useHeygenAvailability";
import { usePollinationsAvailability } from "./hooks/usePollinationsAvailability";
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

	// Auto-fallback if current mode becomes unavailable. Priority: pollinations -> heygen -> gemini
	useEffect(() => {
		if (mode === "gemini" && !geminiChecking && !geminiOk) {
			if (pollOk) return setMode("pollinations");
			if (heygenOk) return setMode("heygen");
		}
		if (mode === "heygen" && !heygenChecking && !heygenOk) {
			if (pollOk) return setMode("pollinations");
			if (geminiOk) return setMode("gemini");
		}
		if (mode === "pollinations" && !pollChecking && !pollOk) {
			if (heygenOk) return setMode("heygen");
			if (geminiOk) return setMode("gemini");
		}
	}, [
		mode,
		geminiOk,
		geminiChecking,
		heygenOk,
		heygenChecking,
		pollOk,
		pollChecking,
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
			</div>
		</div>
	);
};
