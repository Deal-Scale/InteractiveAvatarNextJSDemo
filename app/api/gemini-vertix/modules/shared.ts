import { createGeminiVertexClient, GeminiVertexAPIError } from "../sdk";
import type {
	Content,
	CountTokensRequest,
	GeminiVertexClient,
	GeminiVertexClientConfig,
	GenerateContentRequest,
	RequestOptions,
	StreamingResponseChunk,
	VertexErrorPayload,
} from "../sdk";

const ENV_KEYS = {
	project: [
		"GEMINI_VERTEX_PROJECT",
		"VERTEX_GEMINI_PROJECT",
		"GOOGLE_VERTEX_PROJECT",
	],
	location: [
		"GEMINI_VERTEX_LOCATION",
		"VERTEX_GEMINI_LOCATION",
		"GOOGLE_VERTEX_LOCATION",
	],
	model: ["GEMINI_VERTEX_MODEL", "VERTEX_GEMINI_MODEL", "GOOGLE_VERTEX_MODEL"],
	baseUrl: [
		"GEMINI_VERTEX_BASE_URL",
		"VERTEX_GEMINI_BASE_URL",
		"GOOGLE_VERTEX_BASE_URL",
	],
	accessToken: [
		"GEMINI_VERTEX_ACCESS_TOKEN",
		"VERTEX_GEMINI_ACCESS_TOKEN",
		"GOOGLE_VERTEX_ACCESS_TOKEN",
	],
} as const;

export interface ModuleOptions extends RequestOptions {
	clientConfig?: Partial<GeminiVertexClientConfig>;
}

export interface ModuleSuccess<T> {
	ok: true;
	status: number;
	data: T;
}

export interface ModuleStreamSuccess {
	ok: true;
	status: number;
	stream: AsyncIterable<StreamingResponseChunk>;
}

export interface ModuleError {
	ok: false;
	status: number;
	error: VertexErrorPayload;
}

class ValidationError extends Error {
	readonly status: number;

	constructor(message: string, status = 400) {
		super(message);
		this.name = "ValidationError";
		this.status = status;
	}
}

function readEnv(keys: readonly string[]): string | undefined {
	for (const key of keys) {
		const value = process.env[key];
		if (value) return value;
	}
	return undefined;
}

function ensureValue(value: string | undefined, label: string): string {
	if (!value) {
		throw new ValidationError(
			`Missing Gemini Vertex configuration: ${label}`,
			500,
		);
	}
	return value;
}

function mergeClientConfig(
	overrides?: Partial<GeminiVertexClientConfig>,
): GeminiVertexClientConfig {
	const project = overrides?.project ?? readEnv(ENV_KEYS.project);
	const location = overrides?.location ?? readEnv(ENV_KEYS.location);
	const model = overrides?.model ?? readEnv(ENV_KEYS.model);

	const config: GeminiVertexClientConfig = {
		project: ensureValue(project, "project"),
		location: ensureValue(location, "location"),
		model: ensureValue(model, "model"),
	};

	const accessToken = overrides?.accessToken ?? readEnv(ENV_KEYS.accessToken);
	if (accessToken) {
		config.accessToken = accessToken;
	}

	const baseUrl = overrides?.baseUrl ?? readEnv(ENV_KEYS.baseUrl);
	if (baseUrl) {
		config.baseUrl = baseUrl;
	}

	if (overrides?.fetch) {
		config.fetch = overrides.fetch;
	}

	return config;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function validateContent(
	content: unknown,
	index: number,
): asserts content is Content {
	if (!isRecord(content)) {
		throw new ValidationError(
			`contents[${index}] must be an object with a parts array`,
		);
	}
	if (!Array.isArray((content as Content).parts)) {
		throw new ValidationError(`contents[${index}].parts must be an array`);
	}
}

export function validateGenerateContentRequest(
	payload: unknown,
): GenerateContentRequest {
	if (!isRecord(payload)) {
		throw new ValidationError(
			"Request body must be an object with a contents array",
		);
	}
	if (!Array.isArray(payload.contents)) {
		throw new ValidationError("Request body must include a contents array");
	}
	payload.contents.forEach((content, index) => {
		validateContent(content, index);
	});
	return payload as GenerateContentRequest;
}

export function validateCountTokensRequest(
	payload: unknown,
): CountTokensRequest {
	if (!isRecord(payload)) {
		throw new ValidationError(
			"Request body must be an object with a contents array",
		);
	}
	if (!Array.isArray(payload.contents)) {
		throw new ValidationError("Request body must include a contents array");
	}
	payload.contents.forEach((content, index) => {
		validateContent(content, index);
	});
	return payload as CountTokensRequest;
}

function extractVertexError(
	details: unknown,
	fallback: number,
	message: string,
): VertexErrorPayload {
	if (isRecord(details) && isRecord(details.error)) {
		const error = details.error as VertexErrorPayload;
		return {
			code: error.code ?? fallback,
			message: error.message ?? message,
			status: error.status,
			details: error.details,
		};
	}
	if (Array.isArray(details)) {
		return {
			code: fallback,
			message,
			details: details as Record<string, unknown>[],
		};
	}
	if (isRecord(details)) {
		return {
			code: fallback,
			message,
			details: [details as Record<string, unknown>],
		};
	}
	return { code: fallback, message };
}

export function normaliseError(error: unknown): ModuleError {
	if (error instanceof ValidationError) {
		return {
			ok: false,
			status: error.status,
			error: {
				code: error.status,
				message: error.message,
			},
		};
	}
	if (error instanceof GeminiVertexAPIError) {
		return {
			ok: false,
			status: error.status,
			error: extractVertexError(error.details, error.status, error.message),
		};
	}
	throw error;
}

export function createClient(
	options?: Partial<GeminiVertexClientConfig>,
): GeminiVertexClient {
	const config = mergeClientConfig(options);
	return createGeminiVertexClient(config);
}

export function splitModuleOptions(options?: ModuleOptions): {
	client: GeminiVertexClient;
	requestOptions: RequestOptions | undefined;
} {
	const clientOverrides = options?.clientConfig;
	const client = createClient(clientOverrides);
	const { clientConfig, ...requestOptions } = options ?? {};
	const request: RequestOptions | undefined = Object.keys(requestOptions).length
		? (requestOptions as RequestOptions)
		: undefined;
	return { client, requestOptions: request };
}
