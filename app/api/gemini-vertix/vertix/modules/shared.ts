import {
	createVertexProxyClient,
	VertexProxyAPIError,
	type VertexProxyClient,
	type VertexProxyClientConfig,
	type VertexProxyRequestOptions,
} from "../sdk";
import type {
	CountTokensRequest,
	GenerateContentRequest,
	StreamingResponseChunk,
	VertexErrorPayload,
} from "../sdk";
import {
	validateCountTokensRequest as baseValidateCountTokensRequest,
	validateGenerateContentRequest as baseValidateGenerateContentRequest,
} from "../../modules/shared";

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
		"NEXT_PUBLIC_GEMINI_VERTEX_PROXY_BASE_URL",
		"NEXT_PUBLIC_VERTEX_GEMINI_PROXY_BASE_URL",
		"NEXT_PUBLIC_GOOGLE_VERTEX_PROXY_BASE_URL",
		"GEMINI_VERTEX_PROXY_BASE_URL",
		"VERTEX_PROXY_BASE_URL",
	],
} as const;

export interface ModuleOptions extends VertexProxyRequestOptions {
	clientConfig?: Partial<VertexProxyClientConfig>;
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

class RequestValidationError extends Error {
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
		throw new RequestValidationError(
			`Missing Vertex proxy configuration: ${label}`,
			500,
		);
	}
	return value;
}

function mergeClientConfig(
	overrides?: Partial<VertexProxyClientConfig>,
): VertexProxyClientConfig {
	const project = overrides?.project ?? readEnv(ENV_KEYS.project);
	const location = overrides?.location ?? readEnv(ENV_KEYS.location);
	const model = overrides?.model ?? readEnv(ENV_KEYS.model);

	const config: VertexProxyClientConfig = {
		project: ensureValue(project, "project"),
		location: ensureValue(location, "location"),
		model: ensureValue(model, "model"),
	};

	const baseUrl = overrides?.baseUrl ?? readEnv(ENV_KEYS.baseUrl);
	if (baseUrl) {
		config.baseUrl = baseUrl;
	}

	if (overrides?.fetch) {
		config.fetch = overrides.fetch;
	}

	if (overrides?.defaultHeaders) {
		config.defaultHeaders = overrides.defaultHeaders;
	}

	return config;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
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

function isValidationError(
	error: unknown,
): error is Error & { status?: number } {
	return error instanceof Error && error.name === "ValidationError";
}

function validationStatus(error: Error & { status?: number }): number {
	return typeof error.status === "number" ? error.status : 400;
}

export function validateGenerateContentRequest(
	payload: unknown,
): GenerateContentRequest {
	return baseValidateGenerateContentRequest(payload);
}

export function validateCountTokensRequest(
	payload: unknown,
): CountTokensRequest {
	return baseValidateCountTokensRequest(payload);
}

export function normaliseError(error: unknown): ModuleError {
	if (isValidationError(error)) {
		const status = validationStatus(error);
		return {
			ok: false,
			status,
			error: {
				code: status,
				message: error.message,
			},
		};
	}
	if (error instanceof VertexProxyAPIError) {
		return {
			ok: false,
			status: error.status,
			error: extractVertexError(error.details, error.status, error.message),
		};
	}
	throw error;
}

export function createClient(
	options?: Partial<VertexProxyClientConfig>,
): VertexProxyClient {
	const config = mergeClientConfig(options);
	return createVertexProxyClient(config);
}

export function splitModuleOptions(options?: ModuleOptions): {
	client: VertexProxyClient;
	requestOptions: VertexProxyRequestOptions | undefined;
} {
	const clientOverrides = options?.clientConfig;
	const client = createClient(clientOverrides);
	const { clientConfig, ...requestOptions } = options ?? {};
	const request: VertexProxyRequestOptions | undefined = Object.keys(
		requestOptions,
	).length
		? (requestOptions as VertexProxyRequestOptions)
		: undefined;
	return { client, requestOptions: request };
}
