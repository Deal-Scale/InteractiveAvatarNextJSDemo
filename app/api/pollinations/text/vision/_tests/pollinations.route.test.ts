import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";

const URL = "http://localhost/api/pollinations/text/chat-completion";

function makeRequest(body: unknown) {
	return new Request(URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("Pollinations chat-completion route", () => {
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
		// Malformed request: no model/messages
		global.fetch = vi.fn();
		const req = makeRequest({ foo: "bar" });
		const res = await POST(req);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBeDefined();
	});

	it("proxies non-streaming success JSON", async () => {
		const upstreamJson = {
			id: "x",
			choices: [{ message: { role: "assistant", content: "hi" } }],
		};
		global.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(upstreamJson), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const req = makeRequest({
			model: "openai",
			messages: [{ role: "user", content: "hello" }],
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("assistant");
	});

	it("bubbles upstream error (non-streaming)", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue(new Response("bad upstream", { status: 502 }));
		const req = makeRequest({
			model: "openai",
			messages: [{ role: "user", content: "hello" }],
		});
		const res = await POST(req);
		expect(res.status).toBe(502);
		const body = await res.text();
		expect(body).toContain("bad upstream");
	});

	it("pipes streaming body when stream=true", async () => {
		// Create a mock readable stream resembling SSE
		const encoder = new TextEncoder();
		const sseData =
			'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n' +
			"data: [DONE]\n\n";
		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(encoder.encode(sseData));
				controller.close();
			},
		});

		global.fetch = vi.fn().mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "Content-Type": "text/event-stream" },
			}),
		);

		const req = makeRequest({
			model: "openai",
			messages: [{ role: "user", content: "stream" }],
			stream: true,
		});
		const res = await POST(req);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain("text/event-stream");

		// Read a bit from the stream to confirm piping
		const reader = (res.body as ReadableStream<Uint8Array>).getReader();
		const { value, done } = await reader.read();
		expect(done).toBe(false);
		const chunk = new TextDecoder().decode(value!);
		expect(chunk).toContain("data:");
	});
});
