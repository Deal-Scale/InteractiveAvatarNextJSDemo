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

	// Actions
	setAgent: (agent: AgentConfig) => void;
	updateAgent: (patch: Partial<AgentConfig>) => void;
	resetAgent: () => void;

	markClean: () => void;
	setLastStarted: (config: AgentConfig) => void;
}

export const useAgentStore = create<AgentStoreState>()(
	persist(
		(set, _get) => ({
			currentAgent: null,
			lastStartedConfig: null,
			isDirty: false,

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
		}),
		{
			name: "agent-store",
			storage: createJSONStorage(() => localStorage),
			// Persist only what is helpful across reloads
			partialize: (state) => ({
				currentAgent: state.currentAgent,
				lastStartedConfig: state.lastStartedConfig,
			}),
		},
	),
);
