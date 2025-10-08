import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DeepSeekClient } from "../sdk/deepseek-client";

const CREATE_CHAT_COMPLETION = "createChatCompletion";

async function createMockResponse(
	body: unknown,
	init?: ResponseInit,
): Promise<Response> {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "content-type": "application/json" },
		...init,
	});
}

describe("DeepSeek modular SDK", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("requires an API key", () => {
		expect(() => new DeepSeekClient({ apiKey: "" })).toThrow(
			/DeepSeekClient requires an apiKey/,
		);
	});

	it("exposes grouped operation modules", async () => {
		const client = new DeepSeekClient({ apiKey: "test" });
		const modules = await client.modules();

		expect(modules.chat).toBeDefined();
		expect(modules.chat.tag).toBe("Chat Completions");
		expect(typeof modules.chat[CREATE_CHAT_COMPLETION]).toBe("function");

		expect(modules.models).toBeDefined();
		expect(modules.models.operations.some((op) => op.id === "listModels")).toBe(
			true,
		);

		expect(modules.billing).toBeDefined();
		expect(
			modules.billing.operations.some((op) => op.id === "getUserBalance"),
		).toBe(true);

		expect(modules.beta).toBeDefined();
		expect(
			modules.beta.operations.some((op) => op.id === "createFimCompletion"),
		).toBe(true);
	});

	it("throws when invoking unknown operations", async () => {
		const client = new DeepSeekClient({ apiKey: "test" });

		await expect(client.call("doesNotExist" as never)).rejects.toThrow(
			/Unknown DeepSeek operation/,
		);
	});

	it("matches operations by HTTP method and path", async () => {
		const client = new DeepSeekClient({ apiKey: "test" });
		const match = await client.resolveOperation("get", "/models/deepseek-chat");

		expect(match?.operation.id).toBe("retrieveModel");
		expect(match?.pathParams).toEqual({ model: "deepseek-chat" });
	});

	it("resolves beta and anthropic compatibility routes", async () => {
		const client = new DeepSeekClient({ apiKey: "test" });

		const betaMatch = await client.resolveOperation(
			"post",
			"/beta/completions",
		);

		expect(betaMatch?.operation.id).toBe("createFimCompletion");

		const anthropicMatch = await client.resolveOperation(
			"post",
			"/anthropic/messages",
		);

		expect(anthropicMatch?.operation.id).toBe("createAnthropicMessage");
	});

	it("performs HTTP requests with merged defaults", async () => {
		const fetchMock = vi
			.fn()
			.mockImplementation((input: RequestInfo | URL, init?: RequestInit) =>
				createMockResponse({ id: "resp_123", input, init }),
			);
		vi.stubGlobal("fetch", fetchMock);

		const client = new DeepSeekClient({
			apiKey: "sk-test",
			baseUrl: "https://gateway.deepseek.example/v1",
			requestDefaults: {
				headers: { "x-default": "alpha" },
				query: { safe: true },
			},
		});

		const result = await client.call<{ id: string }>(CREATE_CHAT_COMPLETION, {
			body: { model: "deepseek-chat", messages: [] },
			headers: { "x-request": "beta" },
			query: { safe: false, temperature: 0.6 },
		});

		expect(result.id).toBe("resp_123");
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const [url, init] = fetchMock.mock.calls[0];
		expect(String(url)).toBe(
			"https://gateway.deepseek.example/v1/chat/completions?safe=false&temperature=0.6",
		);
		expect(init?.method).toBe("POST");

		const headers = new Headers(init?.headers);
		expect(headers.get("authorization")).toBe("Bearer sk-test");
		expect(headers.get("x-default")).toBe("alpha");
		expect(headers.get("x-request")).toBe("beta");

		const parsedBody = JSON.parse(String(init?.body));
		expect(parsedBody.model).toBe("deepseek-chat");
	});
});
