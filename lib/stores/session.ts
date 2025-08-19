import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import type { AgentConfig } from "@/lib/schemas/agent";
import type { UserSettings, AppGlobalSettings } from "@/lib/schemas/global";
import type { Message } from "@/lib/types";

import { persist, createJSONStorage } from "zustand/middleware";
import { create } from "zustand";

import type { MessageSender } from "@/lib/types";

export type ChatMode = "voice" | "text";

interface SessionState {
	isConfigModalOpen: boolean;
	openConfigModal: () => void;
	closeConfigModal: () => void;

	config: StartAvatarRequest | null;
	setConfig: (config: StartAvatarRequest) => void;

	chatMode: ChatMode;
	setChatMode: (mode: ChatMode) => void;

	messages: Message[];
	addMessage: (message: Message) => void;
	appendMessageChunk: (sender: MessageSender, chunk: string) => void;
	clearMessages: () => void;

	// UI flags
	isChatSolidBg: boolean;
	setChatSolidBg: (solid: boolean) => void;
	// Minimized state for the top-center tab group (Video/Brain/Data/Actions)
	controlsMinimized: boolean;
	setControlsMinimized: (val: boolean) => void;

	// Credits
	creditsRemaining: number; // user's remaining credits
	setCreditsRemaining: (val: number) => void;
	creditsPerMinute: number; // estimated burn rate while connected
	setCreditsPerMinute: (val: number) => void;

	// Video panel tab/view selection
	viewTab: "video" | "brain" | "data" | "actions";
	setViewTab: (tab: "video" | "brain" | "data" | "actions") => void;

	// Settings persisted in app state
	userSettings?: UserSettings;
	setUserSettings: (s: UserSettings) => void;
	globalSettings?: AppGlobalSettings;
	setGlobalSettings: (s: AppGlobalSettings) => void;
	agentSettings?: AgentConfig;
	setAgentSettings: (s: AgentConfig) => void;
}

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			isConfigModalOpen: true, // Open modal by default
			openConfigModal: () => set({ isConfigModalOpen: true }),
			closeConfigModal: () => set({ isConfigModalOpen: false }),

			config: null,
			setConfig: (config) => set({ config }),

			chatMode: "text",
			setChatMode: (mode) => set({ chatMode: mode }),

			messages: [],
			addMessage: (message) =>
				set((state) => ({ messages: [...state.messages, message] })),
			appendMessageChunk: (sender, chunk) =>
				set((state) => {
					const msgs = state.messages;

					if (msgs.length > 0 && msgs[msgs.length - 1].sender === sender) {
						const last = msgs[msgs.length - 1];
						const updated: Message = {
							...last,
							content: `${last.content}${chunk}`,
						};

						return { messages: [...msgs.slice(0, -1), updated] };
					}
					// start a new message if sender changed or list empty
					const id = Date.now().toString();

					return {
						messages: [
							...msgs,
							{
								id,
								sender,
								content: chunk,
							},
						],
					};
				}),
			clearMessages: () => set({ messages: [] }),

			// UI flags
			isChatSolidBg: false,
			setChatSolidBg: (solid) => set({ isChatSolidBg: solid }),
			controlsMinimized: false,
			setControlsMinimized: (val) => set({ controlsMinimized: val }),

			// Credits (defaults can be adjusted or fetched later)
			creditsRemaining: 1000,
			setCreditsRemaining: (val) => set({ creditsRemaining: Math.max(0, val) }),
			creditsPerMinute: 120,
			setCreditsPerMinute: (val) => set({ creditsPerMinute: Math.max(0, val) }),

			// View tab
			viewTab: "video",
			setViewTab: (tab) => set({ viewTab: tab }),

			// Settings
			userSettings: undefined,
			setUserSettings: (s) => set({ userSettings: s }),
			globalSettings: undefined,
			setGlobalSettings: (s) => set({ globalSettings: s }),
			agentSettings: undefined,
			setAgentSettings: (s) => set({ agentSettings: s }),
		}),
		{
			name: "session-store",
			storage: createJSONStorage(() => localStorage),
			// Only persist what's useful across reloads
			partialize: (state) => ({
				messages: state.messages,
				chatMode: state.chatMode,
				creditsRemaining: state.creditsRemaining,
				creditsPerMinute: state.creditsPerMinute,
				viewTab: state.viewTab,
				controlsMinimized: state.controlsMinimized,
				userSettings: state.userSettings,
				globalSettings: state.globalSettings,
				agentSettings: state.agentSettings,
			}),
		},
	),
);
