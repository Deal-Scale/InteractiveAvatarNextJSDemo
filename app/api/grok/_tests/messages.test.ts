import { describe, expect, it } from "vitest";

import {
	ModelMessage,
	UIMessage,
	validateUIMessages,
	safeValidateUIMessages,
} from "@/app/api/grok/sdk/messages";

describe("message validation", () => {
	it("validates UI messages", () => {
		const messages: UIMessage[] = [
			{ id: "1", role: "user", content: "hi" },
			{ id: "2", role: "assistant", content: "hello" },
		];

		expect(() => validateUIMessages(messages)).not.toThrow();
	});

	it("returns safe result tuple", () => {
		const result = safeValidateUIMessages([
			{ id: "1", role: "user", content: "hi" },
		]);

		expect(result.success).toBe(true);
	});

	it("rejects invalid role", () => {
		const messages = [
			{ id: "1", role: "system", content: "hi" },
		] as unknown as UIMessage[];

		const result = safeValidateUIMessages(messages);
		expect(result.success).toBe(false);
	});
});

describe("ModelMessage", () => {
	it("supports tool calls", () => {
		const message: ModelMessage = {
			role: "assistant",
			content: "done",
			toolCalls: [{ id: "call-1", name: "search", arguments: { query: "hi" } }],
		};

		expect(message.toolCalls?.[0].arguments).toEqual({ query: "hi" });
	});
});
