import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	buildOperationRegistry,
	matchOperationByPath,
} from "../operation-registry";
import { DEFAULT_OPERATIONS } from "../operations";
import {
	AnthropicSDKClient,
	type AnthropicSDKClientConfig,
	AnthropicHttpError,
} from "../../sdk/anthropic-sdk-client";

const CREATE_MESSAGE_OPERATION = "createMessage";
const RETRIEVE_BATCH_OPERATION = "retrieveMessageBatch";

describe("Anthropic modular SDK", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("builds a registry containing documented operations", () => {
		const registry = buildOperationRegistry(DEFAULT_OPERATIONS);

		expect(registry.byId.has(CREATE_MESSAGE_OPERATION)).toBe(true);
		expect(registry.byId.has(RETRIEVE_BATCH_OPERATION)).toBe(true);
	});

	it("exposes modules grouped by tag", async () => {
		const client = createClient();
		const modules = await client.modules();

		expect(modules.messages).toBeDefined();
		expect(modules.messages.tag).toBe("Messages");
		expect(typeof modules.messages[CREATE_MESSAGE_OPERATION]).toBe("function");
	});

	it("throws when calling unknown operations", async () => {
		const client = createClient();

		await expect(client.call("unknownOperation" as never)).rejects.toThrow(
			/Unknown Anthropic operation/,
		);
	});

	it("matches operations by method and path", () => {
		const registry = buildOperationRegistry(DEFAULT_OPERATIONS);

		const messagesMatch = matchOperationByPath(registry, "post", "/messages");
		expect(messagesMatch?.operation.id).toBe(CREATE_MESSAGE_OPERATION);

		const batchMatch = matchOperationByPath(
			registry,
			"get",
			"/messages/batches/batch_123",
		);

		expect(batchMatch?.operation.id).toBe(RETRIEVE_BATCH_OPERATION);
		expect(batchMatch?.pathParams.batchId).toBe("batch_123");
	});

	it("resolves operations from the client by path", async () => {
		const client = createClient();

		const resolved = await client.resolveOperation(
			"get",
			"/messages/batches/batch_456",
		);

		expect(resolved?.operation.id).toBe(RETRIEVE_BATCH_OPERATION);
		expect(resolved?.pathParams.batchId).toBe("batch_456");
	});

	it("attaches Anthropic headers when performing requests", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = createClient({
			version: "2023-06-01",
			beta: "computer-use-2025",
			requestDefaults: {
				headers: { "anthropic-beta": "should-be-overridden" },
			},
		});

		await client.call(CREATE_MESSAGE_OPERATION, {
			body: { model: "claude-3-sonnet", messages: [], max_tokens: 1 },
		});

		expect(fetchMock).toHaveBeenCalledOnce();
		const [url, init] = fetchMock.mock.calls[0];

		expect(url).toBe("https://api.anthropic.com/v1/messages");
		expect(init?.method).toBe("POST");

		const headers = new Headers(init?.headers);
		expect(headers.get("x-api-key")).toBe("sk-test");
		expect(headers.get("anthropic-version")).toBe("2023-06-01");
		expect(headers.get("anthropic-beta")).toBe("computer-use-2025");
		expect(headers.get("content-type")).toBe("application/json");
	});

	it("wraps failed responses in AnthropicHttpError", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: { message: "nope" } }), {
				status: 401,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const client = createClient();

		await expect(
			client.call(CREATE_MESSAGE_OPERATION, {
				body: { model: "claude-3", messages: [], max_tokens: 1 },
			}),
		).rejects.toBeInstanceOf(AnthropicHttpError);
	});
});

function createClient(config: Partial<AnthropicSDKClientConfig> = {}) {
	return new AnthropicSDKClient({
		apiKey: "sk-test",
		version: "2023-05-30",
		...config,
	});
}
