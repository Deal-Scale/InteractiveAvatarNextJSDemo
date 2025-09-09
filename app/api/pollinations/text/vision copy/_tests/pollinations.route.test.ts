import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";

// For function calling we recommend using the chat-completion proxy route.
const URL = "http://localhost/api/pollinations/text/chat-completion";

function makeRequest(body: unknown) {
	return new Request(URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("Function Calling (chat-completion) route", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		global.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("returns 400 on invalid JSON body", async () => {
		global.fetch = vi.fn();
		const req = makeRequest({ foo: "bar" });
		const res = await POST(req);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBeDefined();
	});

	it("proxies success JSON with tools payload", async () => {
		const upstreamJson = {
			id: "x",
			choices: [{ message: { role: "assistant", content: "ok" } }],
		};
		global.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(upstreamJson), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const body = {
			model: "openai",
			messages: [{ role: "user", content: "What is the weather in Boston?" }],
			tools: [
				{
					type: "function",
					function: {
						name: "get_current_weather",
						description: "Get weather",
						parameters: {
							type: "object",
							properties: { location: { type: "string" } },
							required: ["location"],
						},
					},
				},
			],
			tool_choice: "auto",
		};
		const req = makeRequest(body);
		const res = await POST(req);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("ok");
	});

	it("bubbles upstream error", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue(new Response("bad upstream", { status: 502 }));
		const req = makeRequest({ model: "openai", messages: [] });
		const res = await POST(req);
		expect(res.status).toBe(502);
		const body = await res.text();
		expect(body).toContain("bad upstream");
	});
});
