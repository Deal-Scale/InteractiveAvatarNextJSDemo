import type { StreamingResponseChunk } from "../sdk";
import { streamGenerateContent } from "../modules/stream-generate-content";

function invalidJsonResponse(): Response {
	return new Response(
		JSON.stringify({ code: 400, message: "Invalid JSON body" }),
		{
			status: 400,
			headers: { "Content-Type": "application/json" },
		},
	);
}

function toNdjsonStream(
	iterable: AsyncIterable<StreamingResponseChunk>,
): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	const iterator = iterable[Symbol.asyncIterator]();
	return new ReadableStream<Uint8Array>({
		async pull(controller) {
			const { value, done } = await iterator.next();
			if (done) {
				controller.close();
				return;
			}
			controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
		},
		async cancel(reason) {
			if (iterator.return) {
				await iterator.return(reason);
			}
		},
	});
}

export async function POST(request: Request): Promise<Response> {
	let payload: unknown;
	try {
		payload = await request.json();
	} catch (error) {
		console.error("Failed to parse streamGenerateContent request", error);
		return invalidJsonResponse();
	}

	const result = await streamGenerateContent(payload);

	if (!result.ok) {
		return new Response(JSON.stringify(result.error), {
			status: result.status,
			headers: { "Content-Type": "application/json" },
		});
	}

	return new Response(toNdjsonStream(result.stream), {
		status: result.status,
		headers: { "Content-Type": "application/x-ndjson" },
	});
}
