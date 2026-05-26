import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
	CountTokensRequest,
	GenerateContentRequest,
	StreamingResponseChunk,
} from "../../sdk";
import { countTokens } from "../modules/count-tokens";
import { generateContent } from "../modules/generate-content";
import { streamGenerateContent } from "../modules/stream-generate-content";

declare const ReadableStream: typeof globalThis.ReadableStream;

describe("Vertex proxy modules", () => {
	const baseRequest: GenerateContentRequest = {
		contents: [
			{
				parts: [{ text: "Hello" }],
			},
		],
	};

	const baseCountRequest: CountTokensRequest = {
		contents: baseRequest.contents,
	};

	const envKeys = [
		"GEMINI_VERTEX_PROJECT",
		"GEMINI_VERTEX_LOCATION",
		"GEMINI_VERTEX_MODEL",
	];

	const originalEnv: Record<string, string | undefined> = {};

	beforeEach(() => {
		envKeys.forEach((key) => {
			originalEnv[key] = process.env[key];
		});
		process.env.GEMINI_VERTEX_PROJECT = "demo-project";
		process.env.GEMINI_VERTEX_LOCATION = "us-central1";
		process.env.GEMINI_VERTEX_MODEL = "gemini-1.5-pro";
	});

	afterEach(() => {
		envKeys.forEach((key) => {
			if (originalEnv[key] === undefined) {
				delete process.env[key];
			} else {
				process.env[key] = originalEnv[key];
			}
		});
		vi.restoreAllMocks();
	});

	it("delegates generateContent through the proxy client", async () => {
		const payload = { candidates: [{ index: 0 }] };
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(payload), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await generateContent(baseRequest, {
			clientConfig: {
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] ?? [];
		expect(url).toContain(
			"/api/gemini-vertix/vertix/v1/projects/demo-project/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent",
		);
		expect(init?.method).toBe("POST");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.status).toBe(200);
			expect(result.data).toEqual(payload);
		}
	});

	it("delegates countTokens requests", async () => {
		const payload = { totalTokens: 12 };
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(payload), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await countTokens(baseCountRequest, {
			clientConfig: {
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url] = fetchMock.mock.calls[0] ?? [];
		expect(url).toContain(":countTokens");
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toEqual(payload);
		}
	});

	it("returns a stream iterator for streamGenerateContent", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(
					encoder.encode(`${JSON.stringify({ candidates: [{ index: 0 }] })}\n`),
				);
				controller.close();
			},
		});

		const fetchMock = vi.fn().mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "Content-Type": "application/x-ndjson" },
			}),
		);

		const result = await streamGenerateContent(baseRequest, {
			clientConfig: {
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(result.ok).toBe(true);
		if (result.ok) {
			const chunks: StreamingResponseChunk[] = [];
			for await (const chunk of result.stream) {
				chunks.push(chunk);
			}
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(chunks).toHaveLength(1);
			expect(chunks[0]).toMatchObject({ candidates: [{ index: 0 }] });
		}
	});

	it("normalises VertexProxyAPIError instances", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					error: {
						code: 403,
						message: "Forbidden",
						status: "PERMISSION_DENIED",
					},
				}),
				{
					status: 403,
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		const result = await generateContent(baseRequest, {
			clientConfig: {
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(403);
			expect(result.error).toMatchObject({
				code: 403,
				message: "Forbidden",
				status: "PERMISSION_DENIED",
			});
		}
	});

	it("returns a 400 error when validation fails", async () => {
		const invalidPayload = { contents: null } as unknown;

		const result = await generateContent(invalidPayload, {
			clientConfig: {
				fetch: vi.fn(),
			},
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(400);
			expect(result.error.message).toContain("contents");
		}
	});
});
