import { afterEach, describe, expect, it, vi } from "vitest";

const jsonHeaders = { "Content-Type": "application/json" };

afterEach(() => {
	vi.restoreAllMocks();
});

describe("Gemini Vertex API routes", () => {
	it("returns JSON for generateContent successes", async () => {
		const module = await import("../modules/generate-content");
		vi.spyOn(module, "generateContent").mockResolvedValue({
			ok: true,
			status: 201,
			data: { candidates: [{ index: 0 }] },
		});
		const { POST } = await import("../generate-content/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: JSON.stringify({ contents: [] }),
		});

		const response = await POST(request);

		expect(response.status).toBe(201);
		expect(response.headers.get("content-type")).toContain("application/json");
		expect(await response.json()).toEqual({ candidates: [{ index: 0 }] });
	});

	it("surfaces module errors from generateContent", async () => {
		const module = await import("../modules/generate-content");
		vi.spyOn(module, "generateContent").mockResolvedValue({
			ok: false,
			status: 422,
			error: { code: 422, message: "Invalid" },
		});
		const { POST } = await import("../generate-content/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: JSON.stringify({ contents: [] }),
		});

		const response = await POST(request);

		expect(response.status).toBe(422);
		expect(await response.json()).toEqual({ code: 422, message: "Invalid" });
	});

	it("returns 400 when generateContent receives invalid JSON", async () => {
		const module = await import("../modules/generate-content");
		vi.spyOn(module, "generateContent").mockResolvedValue({
			ok: true,
			status: 200,
			data: {},
		});
		const { POST } = await import("../generate-content/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: "invalid",
		});

		const response = await POST(request);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			code: 400,
			message: "Invalid JSON body",
		});
	});

	it("returns JSON for countTokens successes", async () => {
		const module = await import("../modules/count-tokens");
		vi.spyOn(module, "countTokens").mockResolvedValue({
			ok: true,
			status: 200,
			data: { totalTokens: 99 },
		});
		const { POST } = await import("../count-tokens/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: JSON.stringify({ contents: [] }),
		});

		const response = await POST(request);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ totalTokens: 99 });
	});

	it("streams NDJSON for streamGenerateContent successes", async () => {
		const module = await import("../modules/stream-generate-content");
		async function* chunks() {
			yield { candidates: [{ index: 0 }] };
			yield { candidates: [{ index: 1 }] };
		}
		vi.spyOn(module, "streamGenerateContent").mockResolvedValue({
			ok: true,
			status: 200,
			stream: chunks(),
		});
		const { POST } = await import("../stream-generate-content/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: JSON.stringify({ contents: [] }),
		});

		const response = await POST(request);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain(
			"application/x-ndjson",
		);
		const text = await response.text();
		expect(text).toBe(
			'{"candidates":[{"index":0}]}\n{"candidates":[{"index":1}]}\n',
		);
	});

	it("returns JSON errors for streamGenerateContent failures", async () => {
		const module = await import("../modules/stream-generate-content");
		vi.spyOn(module, "streamGenerateContent").mockResolvedValue({
			ok: false,
			status: 401,
			error: { code: 401, message: "Unauthorised" },
		});
		const { POST } = await import("../stream-generate-content/route");

		const request = new Request("http://localhost", {
			method: "POST",
			headers: jsonHeaders,
			body: JSON.stringify({ contents: [] }),
		});

		const response = await POST(request);

		expect(response.status).toBe(401);
		expect(await response.json()).toEqual({
			code: 401,
			message: "Unauthorised",
		});
	});
});
