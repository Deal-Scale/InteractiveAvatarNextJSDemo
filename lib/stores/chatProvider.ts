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

const VOICE_PROVIDER_IDS: readonly ProviderId[] = ["elevenlabs"];
const STREAMING_PROVIDER_IDS: readonly ProviderId[] = ["heygen"];

export type TextProviderMode = (typeof TEXT_PROVIDER_IDS)[number];
export type VoiceProviderMode = (typeof VOICE_PROVIDER_IDS)[number];
export type StreamingProviderMode = (typeof STREAMING_PROVIDER_IDS)[number];

interface ChatProviderState {
	textMode: TextProviderMode;
	voiceMode: VoiceProviderMode;
	streamingMode: StreamingProviderMode;
	textSettings: {
		systemPrompt: string;
		jsonMode: boolean;
		seed: string;
	};
	voiceSettings: {
		autoSpeak: boolean;
		voiceEnabled: boolean;
	};
	setTextMode: (mode: TextProviderMode) => void;
	setVoiceMode: (mode: VoiceProviderMode) => void;
	setStreamingMode: (mode: StreamingProviderMode) => void;
	setTextSettings: (
		settings: Partial<ChatProviderState["textSettings"]>,
	) => void;
	setVoiceSettings: (
		settings: Partial<ChatProviderState["voiceSettings"]>,
	) => void;
}

// Simple localStorage persistence (no SSR impact in client-only chat)
const STORAGE_KEY_TEXT = "chat_provider_mode:text";
const STORAGE_KEY_VOICE = "chat_provider_mode:voice";
const STORAGE_KEY_STREAMING = "chat_provider_mode:streaming";
const STORAGE_KEY_TEXT_SETTINGS = "chat_provider_settings:text";
const STORAGE_KEY_VOICE_SETTINGS = "chat_provider_settings:voice";

const isValidTextMode = (value: string | null): value is TextProviderMode =>
	TEXT_PROVIDER_IDS.includes(value as ProviderId);

const isValidVoiceMode = (value: string | null): value is VoiceProviderMode =>
	VOICE_PROVIDER_IDS.includes(value as ProviderId);

const isValidStreamingMode = (
	value: string | null,
): value is StreamingProviderMode =>
	STREAMING_PROVIDER_IDS.includes(value as ProviderId);

const getInitialTextMode = (): TextProviderMode => {
	if (typeof window === "undefined") return "pollinations";
	const saved = window.localStorage.getItem(STORAGE_KEY_TEXT);
	if (!isValidTextMode(saved)) return "pollinations";
	return saved;
};

const getInitialVoiceMode = (): VoiceProviderMode => {
	if (typeof window === "undefined") return "elevenlabs";
	const saved = window.localStorage.getItem(STORAGE_KEY_VOICE);
	if (!isValidVoiceMode(saved)) return "elevenlabs";
	return saved;
};

const getInitialStreamingMode = (): StreamingProviderMode => {
	if (typeof window === "undefined") return "heygen";
	const saved = window.localStorage.getItem(STORAGE_KEY_STREAMING);
	if (!isValidStreamingMode(saved)) return "heygen";
	return saved;
};

const getInitialTextSettings = (): ChatProviderState["textSettings"] => {
	const defaults = {
		systemPrompt: "",
		jsonMode: false,
		seed: "",
	};
	if (typeof window === "undefined") return defaults;
	try {
		const saved = window.localStorage.getItem(STORAGE_KEY_TEXT_SETTINGS);
		if (!saved) return defaults;
		const parsed = JSON.parse(saved) as Partial<typeof defaults>;
		return {
			systemPrompt:
				typeof parsed.systemPrompt === "string"
					? parsed.systemPrompt
					: defaults.systemPrompt,
			jsonMode:
				typeof parsed.jsonMode === "boolean"
					? parsed.jsonMode
					: defaults.jsonMode,
			seed: typeof parsed.seed === "string" ? parsed.seed : defaults.seed,
		};
	} catch {
		return defaults;
	}
};

const getInitialVoiceSettings = (): ChatProviderState["voiceSettings"] => {
	const defaults = {
		autoSpeak: false,
		voiceEnabled: false,
	};
	if (typeof window === "undefined") return defaults;
	try {
		const saved = window.localStorage.getItem(STORAGE_KEY_VOICE_SETTINGS);
		if (!saved) return defaults;
		const parsed = JSON.parse(saved) as Partial<typeof defaults>;
		return {
			autoSpeak:
				typeof parsed.autoSpeak === "boolean"
					? parsed.autoSpeak
					: defaults.autoSpeak,
			voiceEnabled:
				typeof parsed.voiceEnabled === "boolean"
					? parsed.voiceEnabled
					: defaults.voiceEnabled,
		};
	} catch {
		return defaults;
	}
};

export const useChatProviderStore = create<ChatProviderState>((set) => ({
	textMode: getInitialTextMode(),
	voiceMode: getInitialVoiceMode(),
	streamingMode: getInitialStreamingMode(),
	textSettings: getInitialTextSettings(),
	voiceSettings: getInitialVoiceSettings(),
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
	setTextSettings: (settings) =>
		set((state) => {
			const next = { ...state.textSettings, ...settings };
			try {
				if (typeof window !== "undefined") {
					window.localStorage.setItem(
						STORAGE_KEY_TEXT_SETTINGS,
						JSON.stringify(next),
					);
				}
			} catch {}
			return { textSettings: next };
		}),
	setVoiceSettings: (settings) =>
		set((state) => {
			const next = { ...state.voiceSettings, ...settings };
			try {
				if (typeof window !== "undefined") {
					window.localStorage.setItem(
						STORAGE_KEY_VOICE_SETTINGS,
						JSON.stringify(next),
					);
				}
			} catch {}
			return { voiceSettings: next };
		}),
}));
