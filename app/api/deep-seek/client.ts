import { DeepSeekClient } from "./sdk";

let cachedClient: DeepSeekClient | null = null;

export function getDeepSeekClient(): DeepSeekClient {
	if (cachedClient) {
		return cachedClient;
	}

	const apiKey = process.env.DEEPSEEK_API_KEY;

	if (!apiKey) {
		throw new Error("DEEPSEEK_API_KEY is not configured");
	}

	cachedClient = new DeepSeekClient({
		apiKey,
		baseUrl: process.env.DEEPSEEK_API_BASE ?? "https://api.deepseek.com/v1",
	});

	return cachedClient;
}
