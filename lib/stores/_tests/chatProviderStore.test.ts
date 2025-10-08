import { beforeEach, describe, expect, it } from "vitest";
import { useChatProviderStore } from "../chatProvider";

describe("chat provider store", () => {
	beforeEach(() => {
		useChatProviderStore.setState({
			textMode: "pollinations",
			voiceMode: "heygen",
		});
	});

	it("allows switching to claude", () => {
		useChatProviderStore.getState().setTextMode("claude");
		expect(useChatProviderStore.getState().textMode).toBe("claude");
	});

	it("allows switching to openai", () => {
		useChatProviderStore.getState().setTextMode("openai");
		expect(useChatProviderStore.getState().textMode).toBe("openai");
	});

	it("allows switching to deepseek", () => {
		useChatProviderStore.getState().setTextMode("deepseek");
		expect(useChatProviderStore.getState().textMode).toBe("deepseek");
	});

	it("allows switching voice provider", () => {
		useChatProviderStore.getState().setVoiceMode("heygen");
		expect(useChatProviderStore.getState().voiceMode).toBe("heygen");
	});
});
