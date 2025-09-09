export const runtime = "edge";

// GET /api/pollinations/text/tts?prompt=...&voice=nova
// Proxies to: https://text.pollinations.ai/{encodedPrompt}?model=openai-audio&voice={voice}
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const prompt = searchParams.get("prompt") || "";
		const voice = searchParams.get("voice") || "alloy";

		if (!prompt) {
			return new Response(
				JSON.stringify({ error: { message: "Missing prompt" } }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const encoded = encodeURIComponent(prompt);
		const upstreamUrl = `https://text.pollinations.ai/${encoded}?model=openai-audio&voice=${encodeURIComponent(
			voice,
		)}`;

		const upstream = await fetch(upstreamUrl, {
			method: "GET",
		});

		if (!upstream.ok || !upstream.body) {
			const text = await upstream.text().catch(() => "");
			return new Response(
				JSON.stringify({ error: { message: text || "Upstream TTS error" } }),
				{
					status: upstream.status || 502,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Stream audio back to client
		const contentType = upstream.headers.get("Content-Type") || "audio/mpeg";
		return new Response(upstream.body, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "no-cache",
			},
		});
	} catch (e: unknown) {
		return new Response(
			JSON.stringify({ error: { message: (e as Error).message } }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
