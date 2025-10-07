import { beforeEach, describe, expect, it } from "vitest";

import { useSessionStore, type ConfigModalTab } from "../session";

describe("useSessionStore config modal controls", () => {
	beforeEach(() => {
		const { persist } = useSessionStore.getState() as unknown as {
			persist?: { clearStorage: () => void };
		};
		persist?.clearStorage?.();
		useSessionStore.setState((state) => ({
			...state,
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
});
