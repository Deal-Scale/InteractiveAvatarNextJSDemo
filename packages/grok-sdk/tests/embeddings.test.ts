import { describe, expect, it, vi } from "vitest";

import { createEmbeddingsClient, cosineSimilarity } from "grok-sdk/embeddings";
import { HttpClient } from "grok-sdk/http";
import { createApiKeyProvider } from "grok-sdk/auth";

const mockFetch = vi.fn();

const httpClient = new HttpClient({
	baseUrl: "https://api.test",
	fetchImpl: mockFetch,
	apiKeyProvider: createApiKeyProvider({ apiKey: "test-key" }),
});

const embeddingsClient = createEmbeddingsClient({ httpClient });

describe("Embeddings client", () => {
	it("creates embeddings", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ vector: [0.1, 0.2, 0.3], id: "emb-1" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const embedding = await embeddingsClient.embed({
			model: "grok-embed",
			input: "hello",
		});

		expect(embedding.vector).toHaveLength(3);
	});

	it("batches embeddings with concurrency control", async () => {
		mockFetch.mockClear();
		mockFetch.mockImplementation(() =>
			Promise.resolve(
				new Response(JSON.stringify({ vector: [0.1], id: "emb" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
			),
		);

		const result = await embeddingsClient.embedMany({
			model: "grok-embed",
			inputs: ["a", "b", "c"],
			concurrency: 2,
		});

		expect(result.items).toHaveLength(3);
		expect(mockFetch).toHaveBeenCalledTimes(3);
	});
});

describe("cosineSimilarity", () => {
	it("computes similarity between vectors", () => {
		const score = cosineSimilarity([1, 0], [0.5, 0]);
		expect(score).toBeCloseTo(1);
	});
});
