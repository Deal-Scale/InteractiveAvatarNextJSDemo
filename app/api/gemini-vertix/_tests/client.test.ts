import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createGeminiVertexClient, GeminiVertexAPIError } from "../sdk";
import type { GenerateContentRequest } from "../sdk";

const baseConfig = {
	project: "demo-project",
	location: "us-central1",
	model: "gemini-1.5-pro",
	accessToken: "ya29.mock-token",
};

describe("createGeminiVertexClient", () => {
	const body: GenerateContentRequest = {
		contents: [{ parts: [{ text: "Hello" }] }],
	};

	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("sends generateContent requests to the Vertex endpoint", async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ candidates: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const client = createGeminiVertexClient({
			...baseConfig,
			fetch: fetchMock as unknown as typeof fetch,
		});

		await client.generateContent(body, {
			headers: { "X-Custom": "demo" },
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(
			"https://us-central1-aiplatform.googleapis.com/v1/projects/demo-project/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent",
		);

		expect(init.method).toBe("POST");
		expect(init.body).toBe(JSON.stringify(body));
		const headers = new Headers(init.headers);
		expect(headers.get("Authorization")).toBe("Bearer ya29.mock-token");
		expect(headers.get("Content-Type")).toBe("application/json");
		expect(headers.get("Accept")).toBe("application/json");
		expect(headers.get("X-Custom")).toBe("demo");
	});

	it("allows per-request overrides for model routing and authorization", async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ candidates: [] }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);

		const client = createGeminiVertexClient({
			...baseConfig,
			fetch: fetchMock as unknown as typeof fetch,
		});

		await client.generateContent(body, {
			project: "override-project",
			location: "europe-west1",
			model: "gemini-1.5-flash",
			accessToken: "ya29.override",
		});

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe(
			"https://europe-west1-aiplatform.googleapis.com/v1/projects/override-project/locations/europe-west1/publishers/google/models/gemini-1.5-flash:generateContent",
		);
		const headers = new Headers(init.headers);
		expect(headers.get("Authorization")).toBe("Bearer ya29.override");
	});

	it("streams newline delimited JSON chunks", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(
					encoder.encode(
						`${JSON.stringify({
							candidates: [
								{
									content: { parts: [{ text: "Hi" }] },
								},
							],
						})}\n`,
					),
				);
				controller.enqueue(
					encoder.encode(
						`${JSON.stringify({ usageMetadata: { totalTokens: 4 } })}\n`,
					),
				);
				controller.close();
			},
		});

		fetchMock.mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "Content-Type": "application/x-ndjson" },
			}),
		);

		const client = createGeminiVertexClient({
			...baseConfig,
			fetch: fetchMock as unknown as typeof fetch,
		});

		const chunks: unknown[] = [];
		for await (const chunk of client.streamGenerateContent(body)) {
			chunks.push(chunk);
		}

		expect(chunks).toHaveLength(2);
		expect(chunks[0]).toMatchObject({
			candidates: [{ content: { parts: [{ text: "Hi" }] } }],
		});
		expect(chunks[1]).toMatchObject({ usageMetadata: { totalTokens: 4 } });
	});

	it("parses streaming chunks prefixed with data markers and ignores keepalive signals", async () => {
		const encoder = new TextEncoder();
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(
					encoder.encode('data: {"candidates":[{"index":0}]}\n'),
				);
				controller.enqueue(encoder.encode("\n"));
				controller.enqueue(encoder.encode("event: ping\n"));
				controller.enqueue(encoder.encode("data: [DONE]\n"));
				controller.close();
			},
		});

		fetchMock.mockResolvedValue(
			new Response(stream, {
				status: 200,
				headers: { "Content-Type": "application/x-ndjson" },
			}),
		);

		const client = createGeminiVertexClient({
			...baseConfig,
			fetch: fetchMock as unknown as typeof fetch,
		});

		const chunks: unknown[] = [];
		for await (const chunk of client.streamGenerateContent(body)) {
			chunks.push(chunk);
		}

		expect(chunks).toHaveLength(1);
		expect(chunks[0]).toMatchObject({ candidates: [{ index: 0 }] });
	});

	it("throws a GeminiVertexAPIError on error responses", async () => {
		fetchMock.mockResolvedValue(
			new Response(
				JSON.stringify({
					error: {
						code: 400,
						message: "Invalid model",
						status: "INVALID_ARGUMENT",
					},
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		const client = createGeminiVertexClient({
			...baseConfig,
			fetch: fetchMock as unknown as typeof fetch,
		});

		const error = await client
			.countTokens(body)
			.catch((err) => err as GeminiVertexAPIError);
		expect(error).toBeInstanceOf(GeminiVertexAPIError);
		expect(error.status).toBe(400);
		expect(error.message).toBe("Invalid model");
	});
});
