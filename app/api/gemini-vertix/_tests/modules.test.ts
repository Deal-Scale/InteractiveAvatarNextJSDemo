import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	CountTokensRequest,
	GenerateContentRequest,
	StreamingResponseChunk,
} from "../sdk";
import { countTokens } from "../modules/count-tokens";
import { generateContent } from "../modules/generate-content";
import { streamGenerateContent } from "../modules/stream-generate-content";

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

describe("Gemini Vertex modules", () => {
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

	it("delegates generateContent to the SDK and returns the response payload", async () => {
		const responsePayload = { candidates: [{ index: 0 }] };
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responsePayload), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await generateContent(baseRequest, {
			clientConfig: {
				accessToken: "ya29.test",
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.status).toBe(200);
			expect(result.data).toEqual(responsePayload);
		}
	});

	it("delegates countTokens to the SDK", async () => {
		const responsePayload = { totalTokens: 42 };
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(responsePayload), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const result = await countTokens(baseCountRequest, {
			clientConfig: {
				accessToken: "ya29.test",
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data).toEqual(responsePayload);
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
				accessToken: "ya29.test",
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

	it("normalises GeminiVertexAPIError instances into error payloads", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					error: {
						code: 400,
						message: "Invalid request",
						status: "INVALID_ARGUMENT",
					},
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		const result = await generateContent(baseRequest, {
			clientConfig: {
				accessToken: "ya29.test",
				fetch: fetchMock as unknown as typeof fetch,
			},
		});

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.status).toBe(400);
			expect(result.error).toMatchObject({
				code: 400,
				message: "Invalid request",
				status: "INVALID_ARGUMENT",
			});
		}
	});

	it("returns a 400 error payload when validation fails", async () => {
		const invalidPayload = { contents: null } as unknown;

		const result = await generateContent(invalidPayload, {
			clientConfig: {
				accessToken: "ya29.test",
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
