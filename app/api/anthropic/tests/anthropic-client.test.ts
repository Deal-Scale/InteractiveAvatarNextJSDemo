import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import basicRequest from "../../../../mocks/anthropic/messages-basic-request.json";
import basicResponse from "../../../../mocks/anthropic/messages-basic-response.json";
import streamingChunks from "../../../../mocks/anthropic/messages-streaming-chunks.json";
import toolUseResponse from "../../../../mocks/anthropic/tool-use-response.json";
import rateLimitError from "../../../../mocks/anthropic/error-rate-limit-response.json";

import { AnthropicAPIError, AnthropicClient } from "../client";
import { messageRequestSchema } from "../zod-schemas";

describe("AnthropicClient", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("requires an API key", () => {
		expect(() => new AnthropicClient({ apiKey: "" })).toThrow(
			/apiKey is required/,
		);
	});

	it("sends messages with Anthropic defaults", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(basicResponse), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({
			apiKey: "sk-test",
			version: "2023-06-01",
			beta: "computer-use-2025",
		});

		const result = await client.createMessage(basicRequest);

		expect(result).toEqual(basicResponse);
		expect(fetchMock).toHaveBeenCalledOnce();

		const [url, init] = fetchMock.mock.calls[0];
		expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
		expect(init?.method).toBe("POST");

		const headers = new Headers(init?.headers);
		expect(headers.get("x-api-key")).toBe("sk-test");
		expect(headers.get("anthropic-version")).toBe("2023-06-01");
		expect(headers.get("anthropic-beta")).toBe("computer-use-2025");
		expect(headers.get("content-type")).toBe("application/json");

		const body = JSON.parse(String(init?.body));
		expect(body.model).toBe(basicRequest.model);
		expect(body.metadata.conversation_id).toBe("conv_basic_001");
	});

	it("streams server-sent events", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				for (const chunk of streamingChunks) {
					const payload = `data: ${JSON.stringify(chunk)}\n\n`;
					controller.enqueue(encoder.encode(payload));
				}
				controller.close();
			},
		});

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "content-type": "text/event-stream" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({ apiKey: "sk-test" });

		const events: Array<Record<string, unknown>> = [];
		await client.streamMessage(basicRequest, {
			async onChunk(chunk) {
				events.push(chunk);
			},
		});

		expect(events).toHaveLength(streamingChunks.length);
		expect(events[0]).toEqual(streamingChunks[0]);
		expect(events.at(-1)).toEqual(streamingChunks.at(-1));
	});

	it("validates message schemas", () => {
		expect(() =>
			messageRequestSchema.parse({
				model: "",
				messages: [],
				max_tokens: 0,
			}),
		).toThrow();
	});

	it("raises structured errors for non-2xx responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(rateLimitError), {
				status: 429,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({ apiKey: "sk-test" });

		await expect(client.createMessage(basicRequest)).rejects.toBeInstanceOf(
			AnthropicAPIError,
		);
	});

	it("supports tool use responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(toolUseResponse), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({ apiKey: "sk-test" });
		const result = await client.createMessage(basicRequest);

		expect(result.content[0]?.type).toBe("tool_use");
		expect(result.content[0]?.name).toBe("fetch_runbook");
	});
});
