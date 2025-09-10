// Install with: pnpm add @openrouter/ai-sdk-provider

// NOTE: These examples demonstrate client usage with the Vercel AI SDK provider for OpenRouter.
// Do NOT embed real API keys in client code for production apps.

import { openrouter, createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, streamText } from "ai";

// 1) Simple text generation with default provider instance
export async function simpleExample() {
	const { text } = await generateText({
		model: openrouter("openai/gpt-4o"),
		prompt: "Write a vegetarian lasagna recipe for 4 people.",
	});
	console.log(text);
}

// 2) Streaming text with extra body options
export async function streamingExample() {
	// Create a custom OpenRouter instance with your API key
	const openrouterInstance = createOpenRouter({
		apiKey: "your-api-key", // Replace with your actual API key
	});

	// Create a stream of text using Anthropic's Claude model with extra body options
	const stream = await streamText({
		model: openrouterInstance("anthropic/claude-3.7-sonnet:thinking"), // Specify the model
		messages: [
			{ role: "user", content: "Explain quantum computing in simple terms" },
		],
		providerOptions: {
			openrouter: {
				// Extra body options specific to OpenRouter
				reasoning: {
					max_tokens: 1000, // Limit the reasoning tokens
				},
			},
		},
	});

	// Process the stream
	for await (const chunk of stream.textStream) {
		process.stdout.write(chunk);
	}
}

// 3) Extra body via model settings
export async function extraBodyViaModelSettings() {
	const openrouterInstance = createOpenRouter({ apiKey: "your-api-key" });
	const model = openrouterInstance("anthropic/claude-3.7-sonnet:thinking", {
		extraBody: {
			reasoning: { max_tokens: 10 },
		},
	});
	await streamText({
		model,
		messages: [{ role: "user", content: "Hello" }],
	});
}

// 4) Extra body via model factory
export async function extraBodyViaModelFactory() {
	const openrouterInstance = createOpenRouter({
		apiKey: "your-api-key",
		extraBody: { reasoning: { max_tokens: 10 } },
	});
	const model = openrouterInstance("anthropic/claude-3.7-sonnet:thinking");
	await streamText({
		model,
		messages: [{ role: "user", content: "Hello" }],
	});
}

// 5) Anthropic prompt caching example
export async function promptCachingExample() {
	const openrouterInstance = createOpenRouter({ apiKey: "your-api-key" });
	const model = openrouterInstance("anthropic/<supported-caching-model>");
	await streamText({
		model,
		messages: [
			{
				role: "system",
				content:
					"You are a podcast summary assistant. You are detail-oriented and critical about the content.",
			},
			{
				role: "user",
				content: [
					{ type: "text", text: "Given the text body below:" },
					{
						type: "text",
						text: `<LARGE BODY OF TEXT>`,
						providerOptions: {
							openrouter: {
								cacheControl: { type: "ephemeral" },
							},
						},
					},
					{ type: "text", text: "List the speakers?" },
				],
			},
		],
	});
}

// 6) Usage accounting example
export async function usageExample() {
	const model = openrouter("openai/gpt-3.5-turbo", {
		usage: { include: true },
	});
	const result = await generateText({
		model,
		prompt: "Hello, how are you today?",
	});
	if (result.providerMetadata?.openrouter?.usage) {
		const usage = result.providerMetadata.openrouter.usage as {
			cost: number;
			totalTokens: number;
		};
		console.log("Cost:", usage.cost);
		console.log("Total Tokens:", usage.totalTokens);
	}
}

// You can import and call any of the above examples where appropriate.
// simpleExample();
// streamingExample();
// extraBodyViaModelSettings();
// extraBodyViaModelFactory();
// promptCachingExample();
// usageExample();
