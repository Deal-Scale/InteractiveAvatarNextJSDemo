import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AnthropicAPIError, AnthropicClient } from "../client";
import {
	messageRequestSchema,
	MessageRequest,
	MessageResponse,
} from "../zod-schemas";

// Import JSON and assert types
const basicRequestData =
	require("../mock/messages-basic-request.json") as MessageRequest;
const basicResponseData =
	require("../mock/messages-basic-response.json") as MessageResponse;
const streamingChunksData = require("../mock/messages-streaming-chunks.json");
const toolUseResponseData = require("../mock/tool-use-response.json");
const rateLimitErrorData = require("../mock/error-rate-limit-response.json");

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
			new Response(JSON.stringify(basicResponseData), {
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

		const result = await client.createMessage(basicRequestData);

		expect(result).toEqual(basicResponseData);
		expect(fetchMock).toHaveBeenCalledOnce();

		const [url, init] = fetchMock.mock.calls[0];
		expect(String(url)).toBe("https://api.anthropic.com/v1/messages");
		expect(init?.method).toBe("POST");

		const headers = new Headers(init?.headers);
		expect(headers.get("x-api-key")).toBe("sk-test");
		expect(headers.get("anthropic-version")).toBe("2023-06-01");
		expect(headers.get("content-type")).toBe("application/json");

		const body = JSON.parse(String(init?.body));
		expect(body.model).toBe(basicRequestData.model);
		expect(body.metadata.conversation_id).toBe("conv_basic_001");
	});

	it("streams server-sent events", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				for (const chunk of streamingChunksData) {
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
		await client.streamMessage(basicRequestData, {
			async onChunk(chunk) {
				events.push(chunk);
			},
		});

		expect(events).toHaveLength(streamingChunksData.length);
		expect(events[0]).toEqual(streamingChunksData[0]);
		expect(events.at(-1)).toEqual(streamingChunksData.at(-1));
	});

	it("raises structured errors for non-2xx responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(rateLimitErrorData), {
				status: 429,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({ apiKey: "sk-test" });

		await expect(client.createMessage(basicRequestData)).rejects.toBeInstanceOf(
			AnthropicAPIError,
		);
	});

	it("supports tool use responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(toolUseResponseData), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = new AnthropicClient({ apiKey: "sk-test" });
		const result = await client.createMessage(basicRequestData);

		expect(result.content[0]?.type).toBe("tool_use");
		expect(result.content[0]?.name).toBe("fetch_runbook");
	});
});
