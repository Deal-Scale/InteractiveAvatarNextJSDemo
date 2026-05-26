import type { HttpMethod } from "./modules/operation-registry";
import type { OpenAPIParameter } from "./modules/spec-loader";
import { OpenAIHttpError } from "./sdk/openai-client";

const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const HOP_BY_HOP_HEADERS = new Set([
	"connection",
	"keep-alive",
	"proxy-authenticate",
	"proxy-authorization",
	"te",
	"trailer",
	"transfer-encoding",
	"upgrade",
]);

export function buildQuery(
	searchParams: URLSearchParams,
): Record<string, unknown> {
	const query: Record<string, unknown> = {};
	const keys = new Set(searchParams.keys());

	for (const key of keys) {
		const values = searchParams.getAll(key);

		if (values.length === 0) {
			continue;
		}

		query[key] = values.length === 1 ? values[0] : values;
	}

	return query;
}

export function buildHeaderOverrides(
	parameters: readonly OpenAPIParameter[],
	incoming: Headers,
): Record<string, string> {
	const overrides: Record<string, string> = {};
	const parameterNames = new Map<string, string>();

	for (const parameter of parameters) {
		if (parameter.in !== "header") {
			continue;
		}

		parameterNames.set(parameter.name.toLowerCase(), parameter.name);
	}

	incoming.forEach((value, key) => {
		if (!value) {
			return;
		}

		const lowerKey = key.toLowerCase();

		if (parameterNames.has(lowerKey)) {
			overrides[parameterNames.get(lowerKey)!] = value;
			return;
		}

		if (lowerKey.startsWith("openai-") || lowerKey.startsWith("x-oai-")) {
			overrides[key] = value;
		}
	});

	return overrides;
}

export async function readRequestBody(
	method: HttpMethod,
	request: Request,
): Promise<unknown> {
	if (method === "get" || method === "head") {
		return undefined;
	}

	if (request.bodyUsed) {
		return undefined;
	}

	const contentType = request.headers.get("content-type");

	if (!contentType) {
		return request.arrayBuffer();
	}

	if (contentType.includes("application/json")) {
		return request.json();
	}

	if (contentType.includes("multipart/form-data")) {
		return request.formData();
	}

	if (contentType.includes("application/x-www-form-urlencoded")) {
		const text = await request.text();
		return Object.fromEntries(new URLSearchParams(text));
	}

	if (contentType.startsWith("text/")) {
		return request.text();
	}

	return request.arrayBuffer();
}

export function forwardResponse(upstream: Response): Response {
	const headers = new Headers();

	upstream.headers.forEach((value, key) => {
		if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
			return;
		}

		headers.set(key, value);
	});

	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers,
	});
}

export function buildErrorResponse(error: OpenAIHttpError): Response {
	const headers = new Headers();
	error.headers.forEach((value, key) => {
		if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
			return;
		}

		headers.set(key, value);
	});

	let body: BodyInit | null = null;

	if (error.body === undefined || error.body === null) {
		body = null;
	} else if (typeof error.body === "string") {
		body = error.body;
		if (!headers.has("content-type")) {
			headers.set("content-type", "text/plain; charset=utf-8");
		}
	} else if (error.body instanceof ArrayBuffer) {
		body = error.body;
	} else {
		body = JSON.stringify(error.body);
		if (!headers.has("content-type")) {
			headers.set("content-type", JSON_CONTENT_TYPE);
		}
	}

	return new Response(body, {
		status: error.status,
		statusText: error.statusText,
		headers,
	});
}

export function jsonErrorResponse(status: number, message: string): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { "content-type": JSON_CONTENT_TYPE },
	});
}
