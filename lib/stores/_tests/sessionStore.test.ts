import { beforeEach, describe, expect, it } from "vitest";

import {
	type ChatSettingsTab,
	type ConfigModalTab,
	useSessionStore,
} from "../session";

describe("useSessionStore config modal controls", () => {
	beforeEach(() => {
		const { persist } = useSessionStore.getState() as unknown as {
			persist?: { clearStorage: () => void };
		};
		persist?.clearStorage?.();
		useSessionStore.setState((state) => ({
			...state,
			chatExperience: "basic",
			chatSettingsTab: "text",
			isChatSettingsOpen: false,
			isConfigModalOpen: false,
			configModalTab: "session",
		}));
	});

	it("opens the modal on the requested tab", () => {
		useSessionStore.getState().openConfigModal("agent");

		const state = useSessionStore.getState();
		expect(state.isConfigModalOpen).toBe(true);
		expect(state.configModalTab).toBe<ConfigModalTab>("agent");
	});

	it("defaults to the session tab when no tab is provided", () => {
		useSessionStore.getState().openConfigModal();

		const state = useSessionStore.getState();
		expect(state.configModalTab).toBe<ConfigModalTab>("session");
	});

	it("allows the tab to be updated explicitly", () => {
		useSessionStore.getState().setConfigModalTab("global");

		const state = useSessionStore.getState();
		expect(state.configModalTab).toBe<ConfigModalTab>("global");
	});

	it("opens chat settings on the requested tab", () => {
		useSessionStore.getState().openChatSettings("voice");

		const state = useSessionStore.getState();
		expect(state.isChatSettingsOpen).toBe(true);
		expect(state.chatSettingsTab).toBe<ChatSettingsTab>("voice");
	});
});
