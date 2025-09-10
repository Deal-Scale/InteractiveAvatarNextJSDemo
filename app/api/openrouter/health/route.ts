import { corsHeaders, proxyTo } from "../_utils";

// Health check: verifies API key is configured and upstream is reachable
// by calling a secured endpoint. Models can be public, so we use /credits.
export async function GET(req: Request): Promise<Response> {
	const headers = corsHeaders(req.headers.get("origin") || undefined);
	try {
		if (!process.env.OPENROUTER_API_KEY) {
			headers.set("content-type", "application/json");
			return new Response(
				JSON.stringify({ error: "Missing OPENROUTER_API_KEY" }),
				{ status: 500, headers },
			);
		}
		const upstream = await proxyTo(req, "/credits");
		if (upstream.status >= 200 && upstream.status < 300) {
			return new Response(null, { status: 204, headers });
		}
		// Pass through upstream error but ensure CORS
		const ct = upstream.headers.get("content-type");
		if (ct) headers.set("content-type", ct);
		return new Response(upstream.body, { status: upstream.status, headers });
	} catch (e) {
		headers.set("content-type", "application/json");
		return new Response(JSON.stringify({ error: (e as Error).message }), {
			status: 502,
			headers,
		});
	}
}
