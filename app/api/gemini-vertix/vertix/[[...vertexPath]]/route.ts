import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
	DEFAULT_VERTEX_ENDPOINT,
	buildVertexTargetUrl,
	selectVertexEndpoint,
	type VertexEndpointConfig,
} from "../_utils";

type RouteContext = {
	params: {
		vertexPath?: string[];
	};
};

const FORBIDDEN_REQUEST_HEADERS = new Set([
	"connection",
	"content-length",
	"host",
	"origin",
	"referer",
	"x-forwarded-for",
	"x-forwarded-host",
	"x-forwarded-port",
	"x-forwarded-proto",
	"x-forwarded-scheme",
	"x-real-ip",
	"x-vertex-region",
	"x-vertex-endpoint",
]);

const DEFAULT_ENDPOINT_CONFIG: VertexEndpointConfig = {
	defaultEndpoint: process.env.VERTEX_API_BASE_URL ?? DEFAULT_VERTEX_ENDPOINT,
	defaultRegion:
		process.env.VERTEX_REGION ?? process.env.VERTEX_LOCATION ?? null,
};

function createVertexUrl(req: NextRequest, pathSegments: string[]): string {
	const requestUrl = new URL(req.url);
	const endpointOverride = req.headers.get("x-vertex-endpoint");
	const regionOverride = req.headers.get("x-vertex-region");

	const endpoint = selectVertexEndpoint(
		DEFAULT_ENDPOINT_CONFIG,
		regionOverride,
		endpointOverride,
	);

	return buildVertexTargetUrl(endpoint, pathSegments, requestUrl.search);
}

function buildForwardHeaders(req: NextRequest): Headers {
	const headers = new Headers();

	req.headers.forEach((value, key) => {
		if (FORBIDDEN_REQUEST_HEADERS.has(key.toLowerCase())) {
			return;
		}

		headers.set(key, value);
	});

	if (process.env.VERTEX_API_KEY && !headers.has("x-goog-api-key")) {
		headers.set("x-goog-api-key", process.env.VERTEX_API_KEY);
	}

	if (process.env.VERTEX_PROJECT_ID && !headers.has("x-goog-user-project")) {
		headers.set("x-goog-user-project", process.env.VERTEX_PROJECT_ID);
	}

	if (process.env.VERTEX_ACCESS_TOKEN && !headers.has("authorization")) {
		headers.set("authorization", `Bearer ${process.env.VERTEX_ACCESS_TOKEN}`);
	}

	if (!headers.has("accept")) {
		headers.set("accept", "application/json");
	}

	return headers;
}

async function proxyRequest(
	req: NextRequest,
	context: RouteContext,
): Promise<Response> {
	const pathSegments = context.params.vertexPath?.filter(Boolean) ?? [];

	if (!pathSegments.length) {
		return NextResponse.json(
			{ error: "Vertex API path is required." },
			{ status: 400 },
		);
	}

	let targetUrl: string;

	try {
		targetUrl = createVertexUrl(req, pathSegments);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: message }, { status: 400 });
	}

	const headers = buildForwardHeaders(req);

	const init: RequestInit = {
		method: req.method,
		headers,
		redirect: "manual",
	};

	if (req.body && !["GET", "HEAD"].includes(req.method.toUpperCase())) {
		init.body = req.body;
		// @ts-expect-error - duplex is required for streaming requests in Node.
		init.duplex = "half";
	}

	try {
		const vertexResponse = await fetch(targetUrl, init);
		const responseHeaders = new Headers();

		vertexResponse.headers.forEach((value, key) => {
			if (key.toLowerCase() === "content-length") {
				return;
			}

			responseHeaders.set(key, value);
		});

		return new NextResponse(vertexResponse.body, {
			status: vertexResponse.status,
			statusText: vertexResponse.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";

		return NextResponse.json(
			{
				error: "Failed to contact Vertex AI.",
				details: message,
			},
			{ status: 502 },
		);
	}
}

export const dynamic = "force-dynamic";

export function GET(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function POST(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function PUT(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function PATCH(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function DELETE(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function HEAD(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}

export function OPTIONS(req: NextRequest, context: RouteContext) {
	return proxyRequest(req, context);
}
