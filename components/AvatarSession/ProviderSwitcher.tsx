"use client";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { useClaudeAvailability } from "./hooks/useClaudeAvailability";
import { useDeepSeekAvailability } from "./hooks/useDeepSeekAvailability";
import { useElevenLabsAvailability } from "./hooks/useElevenLabsAvailability";
import { useGeminiAvailability } from "./hooks/useGeminiAvailability";
import { useHeygenAvailability } from "./hooks/useHeygenAvailability";
import { useOpenAIAAvailability } from "./hooks/useOpenAIAAvailability";
import { useOpenRouterAvailability } from "./hooks/useOpenRouterAvailability";
import { usePollinationsAvailability } from "./hooks/usePollinationsAvailability";

type ProviderConfig = {
	id:
		| "heygen"
		| "pollinations"
		| "gemini"
		| "openrouter"
		| "claude"
		| "openai"
		| "deepseek"
		| "elevenlabs";
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
	allowUnavailableSelection?: boolean;
}

const ProviderGroup = ({
	ariaLabel,
	current,
	onChange,
	providers,
	allowUnavailableSelection = false,
}: GroupProps) => {
	return (
		<fieldset className="flex items-center gap-2">
			<legend className="text-xs text-muted-foreground whitespace-nowrap">
				{ariaLabel}
			</legend>
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
							disabled={
								!allowUnavailableSelection &&
								(!provider.available || provider.checking)
							}
							aria-disabled={
								!allowUnavailableSelection &&
								(!provider.available || provider.checking)
							}
						>
							{provider.label}
						</Button>
					</span>
				))}
			</div>
		</fieldset>
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
	const streamingMode = useChatProviderStore((s) => s.streamingMode);
	const setTextMode = useChatProviderStore((s) => s.setTextMode);
	const setVoiceMode = useChatProviderStore((s) => s.setVoiceMode);
	const setStreamingMode = useChatProviderStore((s) => s.setStreamingMode);

	const heygen = useHeygenAvailability();
	const elevenlabs = useElevenLabsAvailability();
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
		],
		[pollinations, claude, openai, deepseek, gemini, openRouter],
	);

	const voiceProviders = useMemo<ProviderConfig[]>(
		() => [mapProvider("elevenlabs", "ElevenLabs", elevenlabs)],
		[elevenlabs],
	);

	const streamingProviders = useMemo<ProviderConfig[]>(
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
	const firstAvailableStreaming = useMemo(
		() => streamingProviders.find((p) => p.available && !p.checking),
		[streamingProviders],
	);

	useEffect(() => {
		const textEntry = textProviders.find(
			(provider) => provider.id === textMode,
		);
		if (!textEntry && firstAvailableText) {
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

	useEffect(() => {
		const streamingEntry = streamingProviders.find(
			(provider) => provider.id === streamingMode,
		);
		if (
			(!streamingEntry ||
				(!streamingEntry.available && firstAvailableStreaming)) &&
			firstAvailableStreaming
		) {
			setStreamingMode(firstAvailableStreaming.id);
		}
	}, [
		firstAvailableStreaming,
		setStreamingMode,
		streamingMode,
		streamingProviders,
	]);

	return (
		<fieldset
			className="mb-3 flex flex-col gap-2"
			aria-label="Provider selection"
		>
			<legend className="sr-only">Provider selection</legend>
			<ProviderGroup
				ariaLabel="Voice provider"
				current={voiceMode}
				onChange={setVoiceMode}
				providers={voiceProviders}
			/>
			<ProviderGroup
				ariaLabel="Video streaming provider"
				current={streamingMode}
				onChange={setStreamingMode}
				providers={streamingProviders}
			/>
			<ProviderGroup
				ariaLabel="Text provider"
				allowUnavailableSelection
				current={textMode}
				onChange={setTextMode}
				providers={textProviders}
			/>
		</fieldset>
	);
};
