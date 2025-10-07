import { create } from "zustand";

export type ChatProviderMode =
	| "heygen"
	| "pollinations"
	| "gemini"
	| "openrouter";

interface ChatProviderState {
	mode: ChatProviderMode;
	setMode: (m: ChatProviderMode) => void;
}

// Simple localStorage persistence (no SSR impact in client-only chat)
const STORAGE_KEY = "chat_provider_mode";

const getInitialMode = (): ChatProviderMode => {
	if (typeof window === "undefined") return "pollinations";
	const saved = window.localStorage.getItem(
		STORAGE_KEY,
	) as ChatProviderMode | null;
	return saved === "pollinations" ||
		saved === "heygen" ||
		saved === "gemini" ||
		saved === "openrouter"
		? saved
		: "pollinations";
};

export const useChatProviderStore = create<ChatProviderState>((set) => ({
	mode: getInitialMode(),
	setMode: (mode) => {
		try {
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY, mode);
			}
		} catch {}
		set({ mode });
	},
}));
