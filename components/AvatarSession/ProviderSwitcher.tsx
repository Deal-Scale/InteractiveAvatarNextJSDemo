"use client";
import { useEffect, useMemo } from "react";

import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { Button } from "@/components/ui/button";
import { useGeminiAvailability } from "./hooks/useGeminiAvailability";
import { useHeygenAvailability } from "./hooks/useHeygenAvailability";
import { usePollinationsAvailability } from "./hooks/usePollinationsAvailability";
import { useOpenRouterAvailability } from "./hooks/useOpenRouterAvailability";
import { useClaudeAvailability } from "./hooks/useClaudeAvailability";
import { useOpenAIAAvailability } from "./hooks/useOpenAIAAvailability";
import { useDeepSeekAvailability } from "./hooks/useDeepSeekAvailability";

type ProviderConfig = {
	id:
		| "heygen"
		| "pollinations"
		| "gemini"
		| "openrouter"
		| "claude"
		| "openai"
		| "deepseek";
	label: string;
	available: boolean;
	checking: boolean;
	error?: string | null;
};

interface GroupProps {
	ariaLabel: string;
	current: string;
	onChange: (id: ProviderConfig["id"]) => void;
	providers: ProviderConfig[];
}

const ProviderGroup = ({
	ariaLabel,
	current,
	onChange,
	providers,
}: GroupProps) => {
	return (
		<div className="flex items-center gap-2" aria-label={ariaLabel}>
			<span className="text-xs text-muted-foreground whitespace-nowrap">
				{ariaLabel}
			</span>
			<div className="flex overflow-hidden rounded-md border border-input">
				{providers.map((provider) => (
					<span
						key={provider.id}
						title={
							provider.available
								? undefined
								: provider.error || `${provider.label} unavailable`
						}
					>
						<Button
							type="button"
							size="sm"
							variant={current === provider.id ? "default" : "ghost"}
							onClick={() => onChange(provider.id)}
							aria-pressed={current === provider.id}
							disabled={!provider.available || provider.checking}
							aria-disabled={!provider.available || provider.checking}
						>
							{provider.label}
						</Button>
					</span>
				))}
			</div>
		</div>
	);
};

const mapProvider = (
	id: ProviderConfig["id"],
	label: string,
	availability: {
		available: boolean;
		checking: boolean;
		lastError: string | null;
	},
): ProviderConfig => ({
	id,
	label,
	available: availability.available,
	checking: availability.checking,
	error: availability.lastError,
});

export const ProviderSwitcher = () => {
	const textMode = useChatProviderStore((s) => s.textMode);
	const voiceMode = useChatProviderStore((s) => s.voiceMode);
	const setTextMode = useChatProviderStore((s) => s.setTextMode);
	const setVoiceMode = useChatProviderStore((s) => s.setVoiceMode);

	const heygen = useHeygenAvailability();
	const pollinations = usePollinationsAvailability();
	const gemini = useGeminiAvailability();
	const openRouter = useOpenRouterAvailability();
	const claude = useClaudeAvailability();
	const openai = useOpenAIAAvailability();
	const deepseek = useDeepSeekAvailability();

	const textProviders = useMemo<ProviderConfig[]>(
		() => [
			mapProvider("pollinations", "Pollinations", pollinations),
			mapProvider("claude", "Claude", claude),
			mapProvider("openai", "OpenAI", openai),
			mapProvider("deepseek", "DeepSeek", deepseek),
			mapProvider("gemini", "Gemini", gemini),
			mapProvider("openrouter", "OpenRouter", openRouter),
			mapProvider("heygen", "Heygen", heygen),
		],
		[pollinations, claude, openai, deepseek, gemini, openRouter, heygen],
	);

	const voiceProviders = useMemo<ProviderConfig[]>(
		() => [mapProvider("heygen", "Heygen", heygen)],
		[heygen],
	);

	const firstAvailableText = useMemo(
		() => textProviders.find((p) => p.available && !p.checking),
		[textProviders],
	);
	const firstAvailableVoice = useMemo(
		() => voiceProviders.find((p) => p.available && !p.checking),
		[voiceProviders],
	);

	useEffect(() => {
		const textEntry = textProviders.find(
			(provider) => provider.id === textMode,
		);
		if (!textEntry || (!textEntry.available && firstAvailableText)) {
			if (firstAvailableText) setTextMode(firstAvailableText.id);
		}
	}, [firstAvailableText, setTextMode, textMode, textProviders]);

	useEffect(() => {
		const voiceEntry = voiceProviders.find(
			(provider) => provider.id === voiceMode,
		);
		if (!voiceEntry || (!voiceEntry.available && firstAvailableVoice)) {
			if (firstAvailableVoice) setVoiceMode(firstAvailableVoice.id);
		}
	}, [firstAvailableVoice, setVoiceMode, voiceMode, voiceProviders]);

	return (
		<div
			className="mb-3 flex flex-col gap-2"
			role="group"
			aria-label="Provider selection"
		>
			<ProviderGroup
				ariaLabel="Voice provider"
				current={voiceMode}
				onChange={setVoiceMode}
				providers={voiceProviders}
			/>
			<ProviderGroup
				ariaLabel="Text provider"
				current={textMode}
				onChange={setTextMode}
				providers={textProviders}
			/>
		</div>
	);
};
