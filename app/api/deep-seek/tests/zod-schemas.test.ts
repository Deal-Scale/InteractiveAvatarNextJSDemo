import { describe, expect, it } from "vitest";

import {
	BalanceResponseSchema,
	ChatCompletionRequestSchema,
	ChatCompletionResponseSchema,
	EmbeddingRequestSchema,
	EmbeddingResponseSchema,
	ListModelsResponseSchema,
	SpeechSynthesisRequestSchema,
} from "../zod-schemas";

describe("DeepSeek Zod schemas", () => {
	it("validates chat completion payloads", () => {
		const requestResult = ChatCompletionRequestSchema.safeParse({
			model: "deepseek-chat",
			messages: [
				{ role: "user", content: "Hello" },
				{
					role: "assistant",
					content: [{ type: "text", text: "```python\n" }],
					prefix: true,
				},
				{
					role: "tool",
					tool_call_id: "call_123",
					content: '{"temperature":24}',
				},
			],
			temperature: 0.3,
			stream: false,
			stream_options: { include_usage: true },
			tools: [
				{
					type: "function",
					function: {
						name: "get_weather",
						description: "Retrieve the weather for a given location",
						strict: true,
						parameters: {
							type: "object",
							properties: {
								location: {
									type: "string",
									description: "City name",
								},
							},
							required: ["location"],
							additionalProperties: false,
						},
					},
				},
			],
			tool_choice: {
				type: "function",
				function: { name: "get_weather" },
			},
			response_format: {
				type: "json_schema",
				json_schema: {
					name: "WeatherResponse",
					schema: {
						type: "object",
						properties: {
							condition: { type: "string" },
						},
						required: ["condition"],
						additionalProperties: false,
					},
				},
			},
		});

		if (!requestResult.success) {
			console.error(requestResult.error.flatten());
		}

		expect(requestResult.success).toBe(true);

		const request = requestResult.data!;

		expect(request.model).toBe("deepseek-chat");

		const response = ChatCompletionResponseSchema.parse({
			id: "chatcmpl-123",
			object: "chat.completion",
			model: "deepseek-chat",
			created: 1700000000,
			system_fingerprint: "fp_abc123",
			choices: [
				{
					index: 0,
					message: {
						role: "assistant",
						content: "Hello!",
						reasoning_content: [{ type: "text", text: "thinking" }],
						tool_calls: [
							{
								id: "call_123",
								type: "function",
								function: {
									name: "get_weather",
									arguments: '{"location":"Hangzhou"}',
								},
							},
						],
					},
					logprobs: {
						content: [
							{
								token: "Hello",
								logprob: -0.1,
								top_logprobs: [
									{
										token: "Hello",
										logprob: -0.1,
									},
								],
							},
						],
					},
					finish_reason: "stop",
				},
			],
			usage: {
				prompt_tokens: 10,
				completion_tokens: 12,
				total_tokens: 22,
				prompt_cache_hit_tokens: 4,
				prompt_cache_miss_tokens: 6,
			},
		});

		expect(response.choices[0]?.message.content).toBe("Hello!");
		expect(response.system_fingerprint).toBe("fp_abc123");
	});

	it("validates embedding payloads", () => {
		const request = EmbeddingRequestSchema.parse({
			model: "deepseek-embedding",
			input: "Hello world",
			encoding_format: "float",
		});

		expect(request.model).toBe("deepseek-embedding");

		const response = EmbeddingResponseSchema.parse({
			object: "list",
			data: [
				{
					index: 0,
					embedding: [0.1, 0.2, 0.3],
					object: "embedding",
				},
			],
			usage: { prompt_tokens: 3, total_tokens: 3 },
		});

		expect(response.data[0]?.embedding).toHaveLength(3);
	});

	it("validates speech synthesis payloads", () => {
		const request = SpeechSynthesisRequestSchema.parse({
			model: "deepseek-tts",
			voice: "alloy",
			input: "Hello there",
			format: "mp3",
		});

		expect(request.voice).toBe("alloy");
	});

	it("validates model listings", () => {
		const response = ListModelsResponseSchema.parse({
			object: "list",
			data: [
				{
					id: "deepseek-chat",
					object: "model",
					created: 1700000000,
					owned_by: "deepseek",
				},
			],
		});

		expect(response.data[0]?.id).toBe("deepseek-chat");
	});

	it("validates user balance responses", () => {
		const response = BalanceResponseSchema.parse({
			is_available: true,
			balance_infos: [
				{
					currency: "CNY",
					balance: "100.00",
					balance_name: "general",
				},
			],
		});

		expect(response.balance_infos[0]?.currency).toBe("CNY");
	});
});
