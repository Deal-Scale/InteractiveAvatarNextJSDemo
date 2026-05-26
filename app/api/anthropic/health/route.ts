const MISSING_MESSAGE =
	"Anthropic API key is not configured. Set ANTHROPIC_API_KEY on the server.";

export async function GET(): Promise<Response> {
	if (!process.env.ANTHROPIC_API_KEY?.trim()) {
		return new Response(MISSING_MESSAGE, {
			status: 500,
			headers: { "content-type": "text/plain" },
		});
	}

	return new Response(null, {
		status: 204,
		headers: { "cache-control": "no-store" },
	});
}
