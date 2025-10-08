import type {
	ImageGenerationRequest,
	ImageGenerationResponse,
	SpeechRequest,
	TranscriptionRequest,
	TranscriptionResponse,
} from "../contracts";
import { HttpClient } from "../http";

export interface MediaClientOptions {
	readonly httpClient: HttpClient;
}

export function createMediaClient(options: MediaClientOptions) {
	const { httpClient } = options;

	return {
		generateImage: async (
			request: ImageGenerationRequest,
		): Promise<ImageGenerationResponse> => {
			const pollInterval = request.pollIntervalMs ?? 1_000;
			let response = await httpClient.raw({
				path: "/v1/images/generate",
				method: "POST",
				body: JSON.stringify(request),
				headers: { "content-type": "application/json" },
			});

			let payload = await response.json();
			while (response.status === 202) {
				await delay(pollInterval);
				response = await httpClient.raw({
					path: `/v1/images/jobs/${payload.jobId}`,
					method: "GET",
				});
				payload = await response.json();
			}

			return payload as ImageGenerationResponse;
		},

		transcribe: async (
			request: TranscriptionRequest,
		): Promise<TranscriptionResponse> => {
			const form = new FormData();
			form.set("model", request.model);
			form.set("file", request.file);
			if (request.language) {
				form.set("language", request.language);
			}

			const response = await httpClient.raw({
				path: "/v1/audio/transcriptions",
				method: "POST",
				body: form,
			});

			return response.json();
		},

		generateSpeech: async (request: SpeechRequest): Promise<ArrayBuffer> => {
			const response = await httpClient.raw({
				path: "/v1/audio/speech",
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(request),
			});

			return response.arrayBuffer();
		},
	};
}

async function delay(ms: number): Promise<void> {
	if (ms <= 0) return;
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
