import { describe, expect, it, vi } from "vitest";

import { HttpClient, HttpError } from "grok-sdk/http";
import { createApiKeyProvider } from "grok-sdk/auth";

const mockFetch = vi.fn();

const client = new HttpClient({
	baseUrl: "https://api.test",
	fetchImpl: mockFetch,
	apiKeyProvider: createApiKeyProvider({ apiKey: "test-key" }),
});

describe("HttpClient", () => {
	it("sends requests with authorization header and parses JSON responses", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const result = await client.request<{ ok: boolean }>({
			path: "/v1/test",
			method: "POST",
			body: { prompt: "hello" },
		});

		expect(mockFetch).toHaveBeenCalledWith("https://api.test/v1/test", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				authorization: "Bearer test-key",
			},
			body: JSON.stringify({ prompt: "hello" }),
		});

		expect(result).toEqual({ ok: true });
	});

	it("throws HttpError on non-2xx responses with parsed body", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: "bad request" }), {
				status: 400,
				headers: { "content-type": "application/json" },
				statusText: "Bad Request",
			}),
		);

		await expect(
			client.request({ path: "/v1/test", method: "GET" }),
		).rejects.toMatchObject({
			status: 400,
			body: { error: "bad request" },
			message: "Bad Request",
		} satisfies Partial<HttpError>);
	});
});
