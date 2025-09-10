// Non-streaming chat completions
export async function chatOnce(prompt: string) {
	const res = await fetch("/api/openrouter/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// Optional if OPENROUTER_API_KEY set on server:
			// Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
		},
		body: JSON.stringify({
			model: "openrouter/auto",
			messages: [{ role: "user", content: prompt }],
		}),
	});
	if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
	const data = await res.json();
	return data;
}

// Streaming chat completions using EventSource
export function chatStream(prompt: string, onMessage: (obj: unknown) => void) {
	const params = new URLSearchParams();
	// This endpoint expects POST for streaming by default, but OpenRouter supports SSE via Accept header too.
	// Here we demonstrate GET + EventSource against a custom server path if available.
	// For simplicity, we keep POST fetch-based streaming elsewhere.
	return () => {
		/* no-op placeholder; prefer POST streaming via fetch + ReadableStream for this app */
	};
}

// List models
export async function listModels() {
	const res = await fetch("/api/openrouter/models");
	if (!res.ok) throw new Error(`List models failed: ${res.status}`);
	return res.json();
}
