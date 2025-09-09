import { isStreamingRequest, type ChatCompletionRequest } from "./_requests";
import { jsonError } from "./_exceptions";

export const runtime = "edge"; // * Edge runtime for low-latency streaming

const POLLINATIONS_URL = "https://text.pollinations.ai/openai";

export async function POST(req: Request) {
	let body: ChatCompletionRequest | undefined;
	try {
		body = (await req.json()) as ChatCompletionRequest;
	} catch {
		return jsonError(400, "Invalid JSON body");
	}

	if (!body?.model || !Array.isArray(body?.messages)) {
		return jsonError(400, "Missing required fields: model, messages");
	}

	const streaming = isStreamingRequest(body);

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (streaming) headers["Accept"] = "text/event-stream";

	let upstream: Response;
	try {
		upstream = await fetch(POLLINATIONS_URL, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});
	} catch (e: unknown) {
		return jsonError(
			502,
			`Failed to reach Pollinations: ${(e as Error).message}`,
		);
	}

	// Non-streaming JSON response
	if (!streaming) {
		if (!upstream.ok) {
			const text = await upstream.text().catch(() => "");
			return jsonError(upstream.status || 502, text || "Upstream error");
		}
		// Pass-through JSON
		const data = await upstream.text(); // keep as text to avoid double-parse
		return new Response(data, {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Streaming SSE response
	// Some upstreams may return non-200 yet still stream payload; normalize to 200 for client consumption
	const streamHeaders: Record<string, string> = {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
	};

	// If upstream failed immediately, surface an error chunk
	if (!upstream.ok && !upstream.body) {
		const text = await upstream.text().catch(() => "");
		return jsonError(upstream.status || 502, text || "Upstream error");
	}

	// Directly pipe the upstream SSE body to the client
	return new Response(upstream.body, {
		status: 200,
		headers: streamHeaders,
	});
}
