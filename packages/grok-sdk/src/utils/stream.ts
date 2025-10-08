export interface SmoothStreamOptions {
	readonly filterEmpty?: boolean;
}

export async function* smoothStream<T extends { text?: string }>(
	iterable: AsyncIterable<T>,
	options: SmoothStreamOptions = {},
): AsyncGenerator<T, void, void> {
	for await (const chunk of iterable) {
		if (
			options.filterEmpty &&
			chunk.text !== undefined &&
			chunk.text.length === 0
		) {
			continue;
		}
		yield chunk;
	}
}
