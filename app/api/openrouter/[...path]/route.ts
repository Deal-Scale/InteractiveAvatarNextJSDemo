// ! OpenRouter API proxy (catch-all)
// * Proxies requests from /api/openrouter/* to https://openrouter.ai/api/v1/*
// * Adds CORS, preflight, and standard OpenRouter headers.

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

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
	h.set("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");
	h.set(
		"Access-Control-Allow-Headers",
		"Content-Type, Authorization, HTTP-Referer, X-Title",
	);
	h.set("Access-Control-Max-Age", "86400");
	if (allowList === "*") {
		h.set("Access-Control-Allow-Origin", "*");
	} else if (origin && allowList.includes(origin)) {
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

function buildTargetUrl(req: Request): string {
	const url = new URL(req.url);
	const subPath = url.pathname.replace(/^.*\/api\/openrouter\/?/, "");
	const target = new URL(`${OPENROUTER_BASE}/${subPath}`);
	url.searchParams.forEach((v, k) => {
		target.searchParams.set(k, v);
	});
	return target.toString();
}

function buildForwardHeaders(req: Request): Headers {
	const headers = new Headers();
	// Authorization priority: incoming header > env
	const incomingAuth = req.headers.get("authorization");
	const envKey = process.env.OPENROUTER_API_KEY
		? `Bearer ${process.env.OPENROUTER_API_KEY}`
		: undefined;
	if (incomingAuth) headers.set("authorization", incomingAuth);
	else if (envKey) headers.set("authorization", envKey);

	// Recommended OpenRouter headers
	const referer =
		req.headers.get("http-referer") || process.env.OPENROUTER_REFERER;
	const title = req.headers.get("x-title") || process.env.OPENROUTER_APP_TITLE;
	if (referer) headers.set("HTTP-Referer", referer);
	if (title) headers.set("X-Title", title);

	// Content type
	const ct = req.headers.get("content-type");
	if (ct) headers.set("content-type", ct);

	return headers;
}

async function proxy(req: Request): Promise<Response> {
	const targetUrl = buildTargetUrl(req);
	const method = req.method.toUpperCase();
	const headers = buildForwardHeaders(req);
	const init: RequestInit = { method, headers, redirect: "manual" };

	if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
		init.body = await req.arrayBuffer();
	}

	const upstream = await fetch(targetUrl, init);
	const cors = corsHeaders(req.headers.get("origin") || undefined);

	// Mirror content-type for SSE or JSON
	const outHeaders = new Headers(cors);
	const upstreamCT = upstream.headers.get("content-type");
	if (upstreamCT) outHeaders.set("content-type", upstreamCT);

	// Stream the body through
	return new Response(upstream.body, {
		status: upstream.status,
		headers: outHeaders,
	});
}

export async function GET(req: Request): Promise<Response> {
	return proxy(req);
}
export async function POST(req: Request): Promise<Response> {
	return proxy(req);
}
export async function DELETE(req: Request): Promise<Response> {
	return proxy(req);
}
export async function PATCH(req: Request): Promise<Response> {
	return proxy(req);
}
