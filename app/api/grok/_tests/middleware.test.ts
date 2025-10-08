import { describe, expect, it } from "vitest";

import {
	extractReasoningMiddleware,
	simulateStreamingMiddleware,
	defaultSettingsMiddleware,
	wrapLanguageModel,
	LanguageModelV2Middleware,
} from "@/app/api/grok/sdk/middleware";

const baseModel = async (input: { prompt: string }) => ({
	text: `${input.prompt}!`,
});

describe("middleware", () => {
	it("wraps language models with middleware pipeline", async () => {
		const middleware: LanguageModelV2Middleware[] = [
			defaultSettingsMiddleware({ defaultModel: "grok-1" }),
			extractReasoningMiddleware(),
		];

		const wrapped = wrapLanguageModel({
			model: baseModel,
			middleware,
		});

		const result = await wrapped({ prompt: "hi" });
		expect(result.text).toBe("hi!");
	});

	it("simulates streaming middleware", async () => {
		const middleware = simulateStreamingMiddleware({ chunkSize: 2 });
		const chunks: string[] = [];
		for await (const chunk of middleware.stream({
			text: "abcd",
		})) {
			chunks.push(chunk.text);
		}

		expect(chunks).toEqual(["ab", "cd"]);
	});
});
