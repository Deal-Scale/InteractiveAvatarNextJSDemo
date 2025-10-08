import { beforeEach, describe, expect, it } from "vitest";
import { useChatProviderStore } from "../chatProvider";

describe("chat provider store", () => {
	beforeEach(() => {
		useChatProviderStore.setState({ mode: "pollinations" });
	});

	it("allows switching to claude", () => {
		useChatProviderStore.getState().setMode("claude");
		expect(useChatProviderStore.getState().mode).toBe("claude");
	});

	it("allows switching to openai", () => {
		useChatProviderStore.getState().setMode("openai");
		expect(useChatProviderStore.getState().mode).toBe("openai");
	});

	it("allows switching to deepseek", () => {
		useChatProviderStore.getState().setMode("deepseek");
		expect(useChatProviderStore.getState().mode).toBe("deepseek");
	});
});
