// Index for OpenRouter proxy

function parseAllowedOrigins(): string[] | "*" {
	const raw = process.env.CORS_ALLOW_ORIGINS?.trim();
	if (!raw || raw === "*") return "*";
	const parts = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length ? parts : "*";
}

function corsHeaders(origin?: string) {
	const allowList = parseAllowedOrigins();
	const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === "true";
	const h = new Headers();
	h.set("Access-Control-Allow-Methods", "GET,OPTIONS");
	h.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, HTTP-Referer, X-Title",
	);
	h.set("Access-Control-Max-Age", "86400");
	if (allowList === "*") h.set("Access-Control-Allow-Origin", "*");
	else if (origin && allowList.includes(origin)) {
		h.set("Access-Control-Allow-Origin", origin);
		h.set("Vary", "Origin");
	}
	if (allowCredentials) h.set("Access-Control-Allow-Credentials", "true");
	return h;
}

export async function OPTIONS(req: Request): Promise<Response> {
	const headers = corsHeaders(req.headers.get("origin") || undefined);
	return new Response(null, { status: 204, headers });
}

export async function GET(req: Request): Promise<Response> {
	const headers = corsHeaders(req.headers.get("origin") || undefined);
	headers.set("content-type", "application/json");
	return new Response(
		JSON.stringify({
			message: "OpenRouter proxy ready",
			base: "/api/openrouter/*",
			docs: "/app/api/openrouter/_docs/README.md",
			examples: {
				curl: "/app/api/openrouter/_examples/curl.md",
				typescript: "/app/api/openrouter/_examples/typescript.ts",
			},
		}),
		{ status: 200, headers },
	);
}
