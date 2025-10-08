import { create } from "zustand";

import type { ProviderId } from "@/lib/chat/providers";

const TEXT_PROVIDER_IDS: readonly ProviderId[] = [
	"pollinations",
	"claude",
	"openai",
	"deepseek",
	"gemini",
	"openrouter",
];

const VOICE_PROVIDER_IDS: readonly ProviderId[] = ["vapi"];
const STREAMING_PROVIDER_IDS: readonly ProviderId[] = ["heygen"];

export type TextProviderMode = (typeof TEXT_PROVIDER_IDS)[number];
export type VoiceProviderMode = (typeof VOICE_PROVIDER_IDS)[number];
export type StreamingProviderMode = (typeof STREAMING_PROVIDER_IDS)[number];

type TextProviderMode = Exclude<ChatProviderMode, "heygen"> | "heygen";

interface ChatProviderState {
	textMode: TextProviderMode;
	voiceMode: ChatProviderMode;
	setTextMode: (mode: TextProviderMode) => void;
	setVoiceMode: (mode: ChatProviderMode) => void;
}

// Simple localStorage persistence (no SSR impact in client-only chat)
const STORAGE_KEY_TEXT = "chat_provider_mode:text";
const STORAGE_KEY_VOICE = "chat_provider_mode:voice";

const isValidMode = (value: string | null): value is ChatProviderMode => {
	return (
		value === "pollinations" ||
		value === "heygen" ||
		value === "gemini" ||
		value === "openrouter" ||
		value === "claude" ||
		value === "openai" ||
		value === "deepseek"
	);
};

const getInitialTextMode = (): TextProviderMode => {
	if (typeof window === "undefined") return "pollinations";
	const saved = window.localStorage.getItem(STORAGE_KEY_TEXT);
	if (!isValidMode(saved)) return "pollinations";
	return saved;
};

const getInitialVoiceMode = (): ChatProviderMode => {
	if (typeof window === "undefined") return "heygen";
	const saved = window.localStorage.getItem(STORAGE_KEY_VOICE);
	if (!isValidMode(saved)) return "heygen";
	return saved;
};

export const useChatProviderStore = create<ChatProviderState>((set) => ({
	textMode: getInitialTextMode(),
	voiceMode: getInitialVoiceMode(),
	setTextMode: (mode) => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY_TEXT, mode);
			}
		} catch {}
		set({ textMode: mode });
	},
	setVoiceMode: (mode) => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY_VOICE, mode);
			}
		} catch {}
		set({ voiceMode: mode });
	},
}));
