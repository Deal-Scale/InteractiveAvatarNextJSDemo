"use client";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { Button } from "@/components/ui/button";
import { useGeminiAvailability } from "./hooks/useGeminiAvailability";
import { useHeygenAvailability } from "./hooks/useHeygenAvailability";
import { usePollinationsAvailability } from "./hooks/usePollinationsAvailability";
import { useOpenRouterAvailability } from "./hooks/useOpenRouterAvailability";
import { useClaudeAvailability } from "./hooks/useClaudeAvailability";
import { useOpenAIAAvailability } from "./hooks/useOpenAIAAvailability";
import { useDeepSeekAvailability } from "./hooks/useDeepSeekAvailability";
import { useEffect } from "react";

export const ProviderSwitcher = () => {
	const mode = useChatProviderStore((s) => s.mode);
	const setMode = useChatProviderStore((s) => s.setMode);
	const {
		available: geminiOk,
		checking: geminiChecking,
		lastError: geminiErr,
	} = useGeminiAvailability();
	const {
		available: heygenOk,
		checking: heygenChecking,
		lastError: heygenErr,
	} = useHeygenAvailability();
	const {
		available: pollOk,
		checking: pollChecking,
		lastError: pollErr,
	} = usePollinationsAvailability();
	const {
		available: orOk,
		checking: orChecking,
		lastError: orErr,
	} = useOpenRouterAvailability();
	const {
		available: claudeOk,
		checking: claudeChecking,
		lastError: claudeErr,
	} = useClaudeAvailability();
	const {
		available: openaiOk,
		checking: openaiChecking,
		lastError: openaiErr,
	} = useOpenAIAAvailability();
	const {
		available: deepseekOk,
		checking: deepseekChecking,
		lastError: deepseekErr,
	} = useDeepSeekAvailability();

	// Auto-fallback if current mode becomes unavailable. Priority: pollinations -> heygen -> gemini -> openrouter
	useEffect(() => {
		const tryFallback = (
			...choices: (
				| "pollinations"
				| "heygen"
				| "gemini"
				| "openrouter"
				| "claude"
				| "openai"
				| "deepseek"
			)[]
		) => {
			for (const c of choices) {
				if (c === "pollinations" && pollOk) return setMode("pollinations");
				if (c === "heygen" && heygenOk) return setMode("heygen");
				if (c === "gemini" && geminiOk) return setMode("gemini");
				if (c === "openrouter" && orOk) return setMode("openrouter");
				if (c === "claude" && claudeOk) return setMode("claude");
				if (c === "openai" && openaiOk) return setMode("openai");
				if (c === "deepseek" && deepseekOk) return setMode("deepseek");
			}
		};

		if (mode === "gemini" && !geminiChecking && !geminiOk) {
			return tryFallback(
				"pollinations",
				"claude",
				"openai",
				"deepseek",
				"heygen",
				"openrouter",
			);
		}
		if (mode === "heygen" && !heygenChecking && !heygenOk) {
			return tryFallback(
				"pollinations",
				"claude",
				"openai",
				"deepseek",
				"gemini",
				"openrouter",
			);
		}
		if (mode === "pollinations" && !pollChecking && !pollOk) {
			return tryFallback(
				"claude",
				"openai",
				"deepseek",
				"gemini",
				"heygen",
				"openrouter",
			);
		}
		if (mode === "openrouter" && !orChecking && !orOk) {
			return tryFallback(
				"pollinations",
				"claude",
				"openai",
				"deepseek",
				"heygen",
				"gemini",
			);
		}
		if (mode === "claude" && !claudeChecking && !claudeOk) {
			return tryFallback(
				"pollinations",
				"openai",
				"deepseek",
				"gemini",
				"openrouter",
				"heygen",
			);
		}
		if (mode === "openai" && !openaiChecking && !openaiOk) {
			return tryFallback(
				"pollinations",
				"claude",
				"deepseek",
				"gemini",
				"openrouter",
				"heygen",
			);
		}
		if (mode === "deepseek" && !deepseekChecking && !deepseekOk) {
			return tryFallback(
				"pollinations",
				"claude",
				"openai",
				"gemini",
				"openrouter",
				"heygen",
			);
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
		claudeOk,
		claudeChecking,
		openaiOk,
		openaiChecking,
		deepseekOk,
		deepseekChecking,
		setMode,
	]);

	return (
		<div className="mb-3 flex items-center gap-2">
			<span className="text-xs text-muted-foreground">Chat provider:</span>
			<div className="flex rounded-md overflow-hidden border border-input">
				<span title={!heygenOk ? heygenErr || "Heygen unavailable" : undefined}>
					<Button
						type="button"
						size="sm"
						variant={mode === "heygen" ? "default" : "ghost"}
						onClick={() => setMode("heygen")}
						aria-pressed={mode === "heygen"}
						disabled={!heygenOk || heygenChecking}
						aria-disabled={!heygenOk || heygenChecking}
					>
						Heygen
					</Button>
				</span>
				<span title={!claudeOk ? claudeErr || "Claude unavailable" : undefined}>
					<Button
						type="button"
						size="sm"
						variant={mode === "claude" ? "default" : "ghost"}
						onClick={() => setMode("claude")}
						aria-pressed={mode === "claude"}
						disabled={!claudeOk || claudeChecking}
						aria-disabled={!claudeOk || claudeChecking}
					>
						Claude
					</Button>
				</span>
				<span title={!openaiOk ? openaiErr || "OpenAI unavailable" : undefined}>
					<Button
						type="button"
						size="sm"
						variant={mode === "openai" ? "default" : "ghost"}
						onClick={() => setMode("openai")}
						aria-pressed={mode === "openai"}
						disabled={!openaiOk || openaiChecking}
						aria-disabled={!openaiOk || openaiChecking}
					>
						OpenAI
					</Button>
				</span>
				<span
					title={
						!deepseekOk ? deepseekErr || "DeepSeek unavailable" : undefined
					}
				>
					<Button
						type="button"
						size="sm"
						variant={mode === "deepseek" ? "default" : "ghost"}
						onClick={() => setMode("deepseek")}
						aria-pressed={mode === "deepseek"}
						disabled={!deepseekOk || deepseekChecking}
						aria-disabled={!deepseekOk || deepseekChecking}
					>
						DeepSeek
					</Button>
				</span>
				<span
					title={!pollOk ? pollErr || "Pollinations unavailable" : undefined}
				>
					<Button
						type="button"
						size="sm"
						variant={mode === "pollinations" ? "default" : "ghost"}
						onClick={() => setMode("pollinations")}
						aria-pressed={mode === "pollinations"}
						disabled={!pollOk || pollChecking}
						aria-disabled={!pollOk || pollChecking}
					>
						Pollinations
					</Button>
				</span>
				<span title={!geminiOk ? geminiErr || "Gemini unavailable" : undefined}>
					<Button
						type="button"
						size="sm"
						variant={mode === "gemini" ? "default" : "ghost"}
						onClick={() => setMode("gemini")}
						aria-pressed={mode === "gemini"}
						disabled={!geminiOk || geminiChecking}
						aria-disabled={!geminiOk || geminiChecking}
					>
						Gemini
					</Button>
				</span>
				<span title={!orOk ? orErr || "OpenRouter unavailable" : undefined}>
					<Button
						type="button"
						size="sm"
						variant={mode === "openrouter" ? "default" : "ghost"}
						onClick={() => setMode("openrouter")}
						aria-pressed={mode === "openrouter"}
						disabled={!orOk || orChecking}
						aria-disabled={!orOk || orChecking}
					>
						OpenRouter
					</Button>
				</span>
			</div>
		</div>
	);
};
