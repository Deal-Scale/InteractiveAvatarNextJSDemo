import type {
	EmbeddingBatchResponse,
	EmbeddingRequest,
	EmbeddingResponse,
} from "../contracts";
import { HttpClient } from "../http";

export interface EmbeddingsClientOptions {
	readonly httpClient: HttpClient;
}

export interface EmbedManyOptions extends EmbeddingRequest {
	readonly inputs: string[];
	readonly concurrency?: number;
}

export function createEmbeddingsClient(options: EmbeddingsClientOptions) {
	const { httpClient } = options;

	return {
		embed: (request: EmbeddingRequest) =>
			httpClient.request<EmbeddingResponse>({
				path: "/v1/embeddings",
				method: "POST",
				body: request,
			}),

		embedMany: async (
			options: EmbedManyOptions,
		): Promise<EmbeddingBatchResponse> => {
			const inputs = options.inputs;
			const concurrency = options.concurrency ?? 4;
			const results: EmbeddingResponse[] = [];
			const errors: Error[] = [];

			let index = 0;
			const worker = async () => {
				while (index < inputs.length) {
					const current = index++;
					try {
						const response = await httpClient.request<EmbeddingResponse>({
							path: "/v1/embeddings",
							method: "POST",
							body: {
								model: options.model,
								input: inputs[current],
							},
						});
						results[current] = response;
					} catch (error) {
						errors[current] = error as Error;
					}
				}
			};

			const workers = Array.from(
				{ length: Math.min(concurrency, inputs.length) },
				() => worker(),
			);
			await Promise.all(workers);

			return {
				items: results,
				errors: errors.filter(Boolean),
			};
		},
	};
}

export function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error("Vectors must be the same length");
	}

	let dot = 0;
	let normA = 0;
	let normB = 0;

	for (let i = 0; i < a.length; i += 1) {
		dot += a[i] * b[i];
		normA += a[i] * a[i];
		normB += b[i] * b[i];
	}

	if (normA === 0 || normB === 0) {
		return 0;
	}

	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
