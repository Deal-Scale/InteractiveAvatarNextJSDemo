import { describe, expect, it, vi } from "vitest";

import { createTextClient } from "@/app/api/grok/sdk/text";
import { HttpClient } from "grok-sdk/http";
import { createApiKeyProvider } from "@/app/api/grok/sdk/auth";

const mockFetch = vi.fn();

const httpClient = new HttpClient({
	baseUrl: "https://api.test",
	fetchImpl: mockFetch,
	apiKeyProvider: createApiKeyProvider({ apiKey: "test-key" }),
});

const textClient = createTextClient({ httpClient });

describe("Text client", () => {
	it("generates text responses", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ text: "hello world", usage: { tokens: 5 } }),
				{
					status: 200,
					headers: { "content-type": "application/json" },
				},
			),
		);

		const response = await textClient.generateText({
			model: "grok-1",
			prompt: "Say hi",
		});

		expect(response).toEqual({ text: "hello world", usage: { tokens: 5 } });
	});

	it("streams text tokens from server-sent events", async () => {
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode('data: {"text":"a"}\n\n'));
				controller.enqueue(new TextEncoder().encode('data: {"text":"b"}\n\n'));
				controller.close();
			},
		});

		mockFetch.mockResolvedValueOnce(
			new Response(stream, {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			}),
		);

		const chunks: string[] = [];
		for await (const value of textClient.streamText({
			model: "grok-1",
			prompt: "stream hi",
		})) {
			chunks.push(value.text);
		}

		expect(chunks).toEqual(["a", "b"]);
	});
});
