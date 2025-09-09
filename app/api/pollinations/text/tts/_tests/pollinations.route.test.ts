import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../route";

const BASE = "http://localhost/api/pollinations/text/tts";

function makeGet(url: string) {
	return new Request(url, { method: "GET" });
}

describe("Pollinations TTS route", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		global.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("returns 400 when prompt is missing", async () => {
		global.fetch = vi.fn();
		const req = makeGet(BASE);
		const res = await GET(req);
		expect(res.status).toBe(400);
		const json = await res.json();
		expect(json.error).toBeDefined();
	});

	it("proxies audio with audio/mpeg content-type", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(encoder.encode("FAKEAUDIO"));
				controller.close();
			},
		});

		global.fetch = vi.fn().mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "Content-Type": "audio/mpeg" },
			}),
		);

		const req = makeGet(`${BASE}?prompt=Hello%20world&voice=nova`);
		const res = await GET(req);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toContain("audio/mpeg");
	});

	it("bubbles upstream error for non-200", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue(new Response("bad upstream", { status: 502 }));
		const req = makeGet(`${BASE}?prompt=Hello`);
		const res = await GET(req);
		expect(res.status).toBe(502);
		const body = await res.text();
		expect(body).toContain("bad upstream");
	});
});
