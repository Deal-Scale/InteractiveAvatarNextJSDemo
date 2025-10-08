import { OpenAIClient, OpenAIHttpError } from "../sdk/openai-client";
import type { HttpMethod } from "../modules/operation-registry";
import {
	buildErrorResponse,
	buildHeaderOverrides,
	buildQuery,
	forwardResponse,
	jsonErrorResponse,
	readRequestBody,
} from "../route-support";

type RouteContext = { params: { path?: string[] } };

let cachedClient: OpenAIClient | null = null;
let cachedSignature: string | null = null;

export const GET = createHandler("get");
export const POST = createHandler("post");
export const PUT = createHandler("put");
export const PATCH = createHandler("patch");
export const DELETE = createHandler("delete");
export const OPTIONS = createHandler("options");
export const HEAD = createHandler("head");
export const TRACE = createHandler("trace");

async function handleRequest(
	method: HttpMethod,
	request: Request,
	context: RouteContext,
): Promise<Response> {
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		return jsonErrorResponse(
			500,
			"OpenAI API key is not configured on the server.",
		);
	}

	const segments = context.params.path ?? [];
	const path = `/${segments.join("/")}`.replace(/\/+/g, "/");

	try {
		const client = await getClient(apiKey);
		const resolved = await client.resolveOperation(method, path);

		if (!resolved) {
			return jsonErrorResponse(
				404,
				`No OpenAI operation mapped for ${method.toUpperCase()} ${path}`,
			);
		}

		const url = new URL(request.url);
		const query = buildQuery(url.searchParams);
		const headers = buildHeaderOverrides(
			resolved.operation.parameters,
			request.headers,
		);

		let body: unknown;

		try {
			body = await readRequestBody(method, request);
		} catch (error) {
			console.error("Failed to read OpenAI request body", error);
			return jsonErrorResponse(400, "Invalid request body payload.");
		}

		try {
			const response = await client.callRaw(resolved.operation.id, {
				pathParams: resolved.pathParams,
				query,
				headers,
				body,
			});

			return forwardResponse(response);
		} catch (error) {
			if (error instanceof OpenAIHttpError) {
				return buildErrorResponse(error);
			}

			console.error("Unexpected error proxying OpenAI request", error);
			return jsonErrorResponse(500, "Unexpected OpenAI proxy error");
		}
	} catch (error) {
		if (error instanceof Response) {
			return error;
		}

		console.error("Failed to process OpenAI route request", error);
		return jsonErrorResponse(500, "Failed to process OpenAI request");
	}
}

function createHandler(method: HttpMethod) {
	return (request: Request, context: RouteContext): Promise<Response> =>
		handleRequest(method, request, context);
}

async function getClient(apiKey: string): Promise<OpenAIClient> {
	const baseUrl =
		process.env.OPENAI_API_BASE_URL ?? "https://api.openai.com/v1";
	const defaultHeaders: Record<string, string> = {};

	if (process.env.OPENAI_ORGANIZATION) {
		defaultHeaders["OpenAI-Organization"] = process.env.OPENAI_ORGANIZATION;
	}

	if (process.env.OPENAI_PROJECT) {
		defaultHeaders["OpenAI-Project"] = process.env.OPENAI_PROJECT;
	}

	if (process.env.OPENAI_BETA) {
		defaultHeaders["OpenAI-Beta"] = process.env.OPENAI_BETA;
	}

	if (process.env.OPENAI_USER) {
		defaultHeaders["OpenAI-User"] = process.env.OPENAI_USER;
	}

	const signature = JSON.stringify({ apiKey, baseUrl, defaultHeaders });

	if (!cachedClient || cachedSignature !== signature) {
		cachedClient = new OpenAIClient({
			apiKey,
			baseUrl,
			defaultHeaders: Object.keys(defaultHeaders).length
				? defaultHeaders
				: undefined,
		});
		cachedSignature = signature;
	}

	return cachedClient;
}
