export interface LanguageModelInput {
	prompt: string;
	model?: string;
	metadata?: Record<string, unknown>;
}

export interface LanguageModelOutput {
	text: string;
	reasoning?: string;
	metadata?: Record<string, unknown>;
}

export interface LanguageModelV2Middleware {
	(context: {
		input: LanguageModelInput;
		next: (input: LanguageModelInput) => Promise<LanguageModelOutput>;
	}): Promise<LanguageModelOutput>;
}

export interface WrapLanguageModelOptions {
	readonly model: (
		input: LanguageModelInput,
	) => Promise<LanguageModelOutput> | LanguageModelOutput;
	readonly middleware?: LanguageModelV2Middleware[];
}

export function wrapLanguageModel(options: WrapLanguageModelOptions) {
	const { model, middleware = [] } = options;

	return async (input: LanguageModelInput): Promise<LanguageModelOutput> => {
		const base = async (finalInput: LanguageModelInput) =>
			Promise.resolve(model(finalInput));

		const chain = middleware.reduceRight<
			(current: LanguageModelInput) => Promise<LanguageModelOutput>
		>((next, fn) => {
			return async (current) => fn({ input: current, next });
		}, base);

		return chain(input);
	};
}

export interface DefaultSettingsOptions {
	readonly defaultModel: string;
}

export function defaultSettingsMiddleware(
	options: DefaultSettingsOptions,
): LanguageModelV2Middleware {
	return async ({ input, next }) => {
		if (!input.model) {
			input = { ...input, model: options.defaultModel };
		}
		return next(input);
	};
}

export function extractReasoningMiddleware(): LanguageModelV2Middleware {
	return async ({ input, next }) => {
		const result = await next(input);
		if (
			!result.reasoning &&
			result.metadata &&
			typeof result.metadata.reasoning === "string"
		) {
			return { ...result, reasoning: result.metadata.reasoning as string };
		}
		return result;
	};
}

export interface SimulateStreamingOptions {
	readonly chunkSize?: number;
}

export function simulateStreamingMiddleware(
	options: SimulateStreamingOptions = {},
) {
	const chunkSize = Math.max(1, options.chunkSize ?? 4);

	return {
		async *stream(result: { text: string }) {
			const text = result.text ?? "";
			for (let i = 0; i < text.length; i += chunkSize) {
				yield { text: text.slice(i, i + chunkSize) };
			}
		},
	};
}
