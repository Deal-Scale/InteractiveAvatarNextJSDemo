import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../route";

const URL = "http://localhost/api/pollinations/text/stt";

function makeRequest(body: unknown) {
	return new Request(URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}

describe("Pollinations STT route", () => {
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

	it("proxies non-streaming success JSON", async () => {
		const upstreamJson = {
			id: "x",
			choices: [{ message: { role: "assistant", content: "transcribed" } }],
		};
		global.fetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(upstreamJson), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const body = {
			model: "openai-audio",
			messages: [
				{
					role: "user",
					content: [
						{ type: "text", text: "Transcribe this:" },
						{
							type: "input_audio",
							input_audio: { data: "BASE64", format: "wav" },
						},
					],
				},
			],
		};
		const req = makeRequest(body);
		const res = await POST(req);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain("transcribed");
	});

	it("bubbles upstream error", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue(new Response("bad upstream", { status: 502 }));
		const req = makeRequest({ model: "openai-audio", messages: [] });
		const res = await POST(req);
		expect(res.status).toBe(502);
		const body = await res.text();
		expect(body).toContain("bad upstream");
	});
});
