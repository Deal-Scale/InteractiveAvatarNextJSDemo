export const runtime = "edge";

// POST /api/pollinations/text/stt
// Expects an OpenAI-compatible JSON payload that includes base64 audio via input_audio
// Forwards to: https://text.pollinations.ai/openai with model "openai-audio"
export async function POST(req: Request) {
	let body: any;
	try {
		body = await req.json();
	} catch {
		return new Response(
			JSON.stringify({ error: { message: "Invalid JSON body" } }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}

	// Ensure correct model is used
	if (!body || !Array.isArray(body.messages)) {
		return new Response(
			JSON.stringify({ error: { message: "Missing messages[] in body" } }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
	body.model = "openai-audio"; // enforce audio model

	try {
		const upstream = await fetch("https://text.pollinations.ai/openai", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});

		const text = await upstream.text();
		return new Response(text, {
			status: upstream.status,
			headers: {
				"Content-Type":
					upstream.headers.get("Content-Type") || "application/json",
			},
		});
	} catch (e: unknown) {
		return new Response(
			JSON.stringify({ error: { message: (e as Error).message } }),
			{
				status: 502,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
