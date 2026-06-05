import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AgentConfig } from "../schemas/agent";
import type { AppGlobalSettings, UserSettings } from "../schemas/global";
import type { Message, MessageSender } from "@/lib/types";

export type ChatMode = "voice" | "text";
export type ChatExperience = "basic" | "advanced" | "avatar";
export type ChatSettingsTab = "text" | "voice" | "avatar";

export type ConfigModalTab = "global" | "user";

export type KnowledgeFolder = { id: string; name: string; parentId?: string };
export type ChatFolder = { id: string; name: string; parentId?: string };
export type ToolConnection = {
	id: string;
	name: string;
	connectedAt: number;
	authType: "oauth" | "apiKey";
	config: Record<string, string>;
};

interface SessionState {
	isConfigModalOpen: boolean;
	openConfigModal: (tab?: ConfigModalTab) => void;
	closeConfigModal: () => void;

	configModalTab: ConfigModalTab;
	setConfigModalTab: (tab: ConfigModalTab) => void;

	isChatSettingsOpen: boolean;
	openChatSettings: (tab?: ChatSettingsTab) => void;
	closeChatSettings: () => void;
	chatSettingsTab: ChatSettingsTab;
	setChatSettingsTab: (tab: ChatSettingsTab) => void;
	chatFolders: ChatFolder[];
	setChatFolders: (
		folders: ChatFolder[] | ((prev: ChatFolder[]) => ChatFolder[]),
	) => void;
	chatFolderAssignments: Record<string, string | undefined>;
	setChatFolderAssignments: (
		assignments:
			| Record<string, string | undefined>
			| ((
					prev: Record<string, string | undefined>,
			  ) => Record<string, string | undefined>),
	) => void;

	config: StartAvatarRequest | null;
	setConfig: (config: StartAvatarRequest) => void;

	chatMode: ChatMode;
	setChatMode: (mode: ChatMode) => void;
	chatExperience: ChatExperience;
	setChatExperience: (mode: ChatExperience) => void;

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

	// Active streaming session id (from /api/streaming/new)
	currentSessionId: string | null;
	setCurrentSessionId: (id: string | null) => void;

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

	// Shared Knowledge Base States
	kbFolders: KnowledgeFolder[];
	setKbFolders: (
		folders:
			| KnowledgeFolder[]
			| ((prev: KnowledgeFolder[]) => KnowledgeFolder[]),
	) => void;
	kbItemFolders: Record<string, string | undefined>;
	setKbItemFolders: (
		itemFolders:
			| Record<string, string | undefined>
			| ((
					prev: Record<string, string | undefined>,
			  ) => Record<string, string | undefined>),
	) => void;
	createdKnowledgeItems: Array<{ id: string; name: string }>;
	setCreatedKnowledgeItems: (
		items:
			| Array<{ id: string; name: string }>
			| ((
					prev: Array<{ id: string; name: string }>,
			  ) => Array<{ id: string; name: string }>),
	) => void;

	toolConnections: Record<string, ToolConnection | undefined>;
	setToolConnection: (connectorKey: string, connection: ToolConnection) => void;
	removeToolConnection: (connectorKey: string) => void;
	clearToolConnections: () => void;
}

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			isConfigModalOpen: false,
			openConfigModal: (tab = "global") =>
				set({
					isConfigModalOpen: true,
					configModalTab: tab,
				}),
			closeConfigModal: () => set({ isConfigModalOpen: false }),

			configModalTab: "global",
			setConfigModalTab: (tab) => set({ configModalTab: tab }),

			isChatSettingsOpen: false,
			openChatSettings: (tab) =>
				set((state) => ({
					isChatSettingsOpen: true,
					chatSettingsTab:
						tab ?? (state.chatExperience === "avatar" ? "avatar" : "text"),
				})),
			closeChatSettings: () => set({ isChatSettingsOpen: false }),
			chatSettingsTab: "text",
			setChatSettingsTab: (tab) => set({ chatSettingsTab: tab }),
			chatFolders: [
				{ id: "chat-folder-sales", name: "Sales" },
				{ id: "chat-folder-support", name: "Support" },
			],
			setChatFolders: (folders) =>
				set((state) => ({
					chatFolders:
						typeof folders === "function"
							? folders(state.chatFolders)
							: folders,
				})),
			chatFolderAssignments: {},
			setChatFolderAssignments: (assignments) =>
				set((state) => ({
					chatFolderAssignments:
						typeof assignments === "function"
							? assignments(state.chatFolderAssignments)
							: assignments,
				})),

			config: null,
			setConfig: (config) => set({ config }),

			chatMode: "text",
			setChatMode: (mode) => set({ chatMode: mode }),
			chatExperience: "basic",
			setChatExperience: (mode) => set({ chatExperience: mode }),

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

			// Active session id
			currentSessionId: null,
			setCurrentSessionId: (id) => set({ currentSessionId: id }),

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

			// Shared Knowledge Base States
			kbFolders: [],
			setKbFolders: (folders) =>
				set((state) => ({
					kbFolders:
						typeof folders === "function" ? folders(state.kbFolders) : folders,
				})),
			kbItemFolders: {},
			setKbItemFolders: (itemFolders) =>
				set((state) => ({
					kbItemFolders:
						typeof itemFolders === "function"
							? itemFolders(state.kbItemFolders)
							: itemFolders,
				})),
			createdKnowledgeItems: [],
			setCreatedKnowledgeItems: (items) =>
				set((state) => ({
					createdKnowledgeItems:
						typeof items === "function"
							? items(state.createdKnowledgeItems)
							: items,
				})),
			toolConnections: {},
			setToolConnection: (connectorKey, connection) =>
				set((state) => ({
					toolConnections: {
						...state.toolConnections,
						[connectorKey]: connection,
					},
				})),
			removeToolConnection: (connectorKey) =>
				set((state) => {
					const next = { ...state.toolConnections };
					delete next[connectorKey];
					return { toolConnections: next };
				}),
			clearToolConnections: () => set({ toolConnections: {} }),
		}),
		{
			name: "session-store",
			version: 2,
			storage: createJSONStorage(() => localStorage),
			migrate: (persistedState) => {
				if (!persistedState || typeof persistedState !== "object") {
					return persistedState;
				}

				return {
					...persistedState,
					isConfigModalOpen: false,
					isChatSettingsOpen: false,
					chatExperience: "basic",
					chatSettingsTab: "text",
					viewTab: "video",
					toolConnections: {},
				};
			},
			// Only persist what's useful across reloads
			partialize: (state) => ({
				messages: state.messages,
				chatMode: state.chatMode,
				chatExperience: state.chatExperience,
				creditsRemaining: state.creditsRemaining,
				creditsPerMinute: state.creditsPerMinute,
				viewTab: state.viewTab,
				controlsMinimized: state.controlsMinimized,
				userSettings: state.userSettings,
				globalSettings: state.globalSettings,
				agentSettings: state.agentSettings,
				currentSessionId: state.currentSessionId,
				configModalTab: state.configModalTab,
				chatFolders: state.chatFolders,
				chatFolderAssignments: state.chatFolderAssignments,
				kbFolders: state.kbFolders,
				kbItemFolders: state.kbItemFolders,
				createdKnowledgeItems: state.createdKnowledgeItems,
				toolConnections: state.toolConnections,
			}),
		},
	),
);
