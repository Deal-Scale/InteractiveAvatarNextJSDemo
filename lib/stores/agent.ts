import type { AgentConfig } from "@/lib/schemas/agent";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AgentStoreState {
	// Current working agent configuration (may be edited before starting)
	currentAgent: AgentConfig | null;

	// Last config used to successfully start a session (for quick restart)
	lastStartedConfig: AgentConfig | null;

	// Whether currentAgent has unsaved/unstaged edits relative to lastStartedConfig
	isDirty: boolean;

	// Starred/Favorite agent IDs
	starredAgentIds: string[];

	// Actions
	setAgent: (agent: AgentConfig) => void;
	updateAgent: (patch: Partial<AgentConfig>) => void;
	resetAgent: () => void;

	markClean: () => void;
	setLastStarted: (config: AgentConfig) => void;
	toggleStarredAgent: (id: string) => void;
}

export const useAgentStore = create<AgentStoreState>()(
	persist(
		(set, _get) => ({
			currentAgent: null,
			lastStartedConfig: null,
			isDirty: false,
			starredAgentIds: [],

			setAgent: (agent) => set({ currentAgent: agent, isDirty: true }),

			updateAgent: (patch) =>
				set((state) => {
					const next = state.currentAgent
						? { ...state.currentAgent, ...patch }
						: (patch as AgentConfig | null);

					return { currentAgent: next, isDirty: true };
				}),

			resetAgent: () =>
				set((state) => ({
					currentAgent: state.lastStartedConfig,
					isDirty: false,
				})),

			markClean: () => set({ isDirty: false }),

			setLastStarted: (config) =>
				set({ lastStartedConfig: config, isDirty: false }),

			toggleStarredAgent: (id) =>
				set((state) => {
					const exists = state.starredAgentIds.includes(id);
					const next = exists
						? state.starredAgentIds.filter((x) => x !== id)
						: [...state.starredAgentIds, id];
					return { starredAgentIds: next };
				}),
		}),
		{
			name: "agent-store",
			storage: createJSONStorage(() => localStorage),
			// Persist only what is helpful across reloads
			partialize: (state) => ({
				currentAgent: state.currentAgent,
				lastStartedConfig: state.lastStartedConfig,
				starredAgentIds: state.starredAgentIds,
			}),
		},
	),
);
