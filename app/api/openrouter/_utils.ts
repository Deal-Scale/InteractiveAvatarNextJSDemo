export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export function parseAllowedOrigins(): string[] | "*" {
	const raw = process.env.CORS_ALLOW_ORIGINS?.trim();
	if (!raw || raw === "*") return "*";
	const parts = raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length ? parts : "*";
}

export function corsHeaders(origin?: string) {
	const allowList = parseAllowedOrigins();
	const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === "true";
	const h = new Headers();
	h.set("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");
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

export function buildForwardHeaders(req: Request): Headers {
	const headers = new Headers();
	const incomingAuth = req.headers.get("authorization");
	const envKey = process.env.OPENROUTER_API_KEY
		? `Bearer ${process.env.OPENROUTER_API_KEY}`
		: undefined;
	if (incomingAuth) headers.set("authorization", incomingAuth);
	else if (envKey) headers.set("authorization", envKey);

	const referer =
		req.headers.get("http-referer") || process.env.OPENROUTER_REFERER;
	const title = req.headers.get("x-title") || process.env.OPENROUTER_APP_TITLE;
	if (referer) headers.set("HTTP-Referer", referer);
	if (title) headers.set("X-Title", title);

	const ct = req.headers.get("content-type");
	if (ct) headers.set("content-type", ct);

	return headers;
}

export async function proxyTo(
	req: Request,
	subPath: string,
): Promise<Response> {
	const method = req.method.toUpperCase();
	const targetUrl = new URL(`${OPENROUTER_BASE}/${subPath.replace(/^\//, "")}`);
	const url = new URL(req.url);
	url.searchParams.forEach((v, k) => targetUrl.searchParams.set(k, v));

	const headers = buildForwardHeaders(req);
	const init: RequestInit = { method, headers, redirect: "manual" };
	if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
		init.body = await req.arrayBuffer();
	}
	const upstream = await fetch(targetUrl, init);

	const cors = corsHeaders(req.headers.get("origin") || undefined);
	const out = new Headers(cors);
	const ct = upstream.headers.get("content-type");
	if (ct) out.set("content-type", ct);
	return new Response(upstream.body, { status: upstream.status, headers: out });
}
