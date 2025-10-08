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

interface ChatProviderState {
	textMode: TextProviderMode;
	voiceMode: VoiceProviderMode;
	streamingMode: StreamingProviderMode;
	setTextMode: (mode: TextProviderMode) => void;
	setVoiceMode: (mode: VoiceProviderMode) => void;
	setStreamingMode: (mode: StreamingProviderMode) => void;
}

// Simple localStorage persistence (no SSR impact in client-only chat)
const STORAGE_KEY_TEXT = "chat_provider_mode:text";
const STORAGE_KEY_VOICE = "chat_provider_mode:voice";
const STORAGE_KEY_STREAMING = "chat_provider_mode:streaming";

const isValidTextMode = (value: string | null): value is TextProviderMode => {
	return TEXT_PROVIDER_IDS.includes(value as ProviderId);
};

const isValidVoiceMode = (value: string | null): value is VoiceProviderMode => {
	return VOICE_PROVIDER_IDS.includes(value as ProviderId);
};

const isValidStreamingMode = (
	value: string | null,
): value is StreamingProviderMode => {
	return STREAMING_PROVIDER_IDS.includes(value as ProviderId);
};

const getInitialTextMode = (): TextProviderMode => {
	if (typeof window === "undefined") return "pollinations";
	const saved = window.localStorage.getItem(STORAGE_KEY_TEXT);
	if (!isValidTextMode(saved)) return "pollinations";
	return saved;
};

const getInitialVoiceMode = (): VoiceProviderMode => {
	if (typeof window === "undefined") return "vapi";
	const saved = window.localStorage.getItem(STORAGE_KEY_VOICE);
	if (!isValidVoiceMode(saved)) return "vapi";
	return saved;
};

const getInitialStreamingMode = (): StreamingProviderMode => {
	if (typeof window === "undefined") return "heygen";
	const saved = window.localStorage.getItem(STORAGE_KEY_STREAMING);
	if (!isValidStreamingMode(saved)) return "heygen";
	return saved;
};

export const useChatProviderStore = create<ChatProviderState>((set) => ({
	textMode: getInitialTextMode(),
	voiceMode: getInitialVoiceMode(),
	streamingMode: getInitialStreamingMode(),
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
	setStreamingMode: (mode) => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY_STREAMING, mode);
			}
		} catch {}
		set({ streamingMode: mode });
	},
}));
