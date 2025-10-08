import { describe, expect, it, vi } from "vitest";

import { createMediaClient } from "@/app/api/grok/sdk/media";
import { HttpClient } from "grok-sdk/http";
import { createApiKeyProvider } from "@/app/api/grok/sdk/auth";

const mockFetch = vi.fn();

const httpClient = new HttpClient({
	baseUrl: "https://api.test",
	fetchImpl: mockFetch,
	apiKeyProvider: createApiKeyProvider({ apiKey: "test-key" }),
});

const mediaClient = createMediaClient({ httpClient });

describe("Media client", () => {
	it("requests image generation with polling token", async () => {
		mockFetch
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ jobId: "123" }), {
					status: 202,
					headers: { "content-type": "application/json" },
				}),
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({ status: "succeeded", images: ["data"] }),
					{
						status: 200,
						headers: { "content-type": "application/json" },
					},
				),
			);

		const image = await mediaClient.generateImage({
			model: "grok-image",
			prompt: "draw a cat",
			pollIntervalMs: 0,
		});

		expect(image.images).toEqual(["data"]);
	});

	it("transcribes audio files", async () => {
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ text: "hello" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);

		const file = new File(["audio"], "audio.wav");
		const transcript = await mediaClient.transcribe({
			model: "grok-transcribe",
			file,
		});

		expect(transcript.text).toBe("hello");
	});

	it("generates speech audio buffers", async () => {
		mockFetch.mockResolvedValueOnce(new Response(new Blob(["audio"])));

		const result = await mediaClient.generateSpeech({
			model: "grok-tts",
			text: "hello",
		});

		expect(result).toBeInstanceOf(ArrayBuffer);
	});
});
