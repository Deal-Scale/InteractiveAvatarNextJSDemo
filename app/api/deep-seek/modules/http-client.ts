import { URLSearchParams } from "node:url";

import type { HttpMethod } from "./operation-registry";
import { isPlainObject } from "./utils";

const JSON_CONTENT_TYPE = "application/json";

export interface HttpClientConfig {
	readonly baseUrl: string;
	readonly apiKey: string;
	readonly defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
	readonly method: HttpMethod;
	readonly path: string;
	readonly query?: Record<string, unknown>;
	readonly headers?: Record<string, string>;
	readonly body?: unknown;
	readonly signal?: AbortSignal;
}

export class HttpClient {
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly defaultHeaders: Record<string, string>;

	constructor(config: HttpClientConfig) {
		this.baseUrl = config.baseUrl;
		this.apiKey = config.apiKey;
		this.defaultHeaders = config.defaultHeaders ?? {};
	}

	async request<T = unknown>(options: RequestOptions): Promise<T> {
		const response = await this.requestRaw(options);
		return this.parseResponse<T>(response);
	}

	async requestRaw({
		method,
		path,
		query,
		headers,
		body,
		signal,
	}: RequestOptions): Promise<Response> {
		const url = this.composeUrl(path, query);
		const composedHeaders = this.composeHeaders(headers, body);
		const response = await fetch(url, {
			method: method.toUpperCase(),
			headers: composedHeaders,
			body: this.serializeBody(body, composedHeaders.get("content-type")),
			signal,
		});

		if (!response.ok) {
			const errorBody = await safeReadResponse(response.clone());
			throw new DeepSeekHttpError(
				response.status,
				response.statusText,
				errorBody,
				new Headers(response.headers),
			);
		}

		return response;
	}

	async parseResponse<T = unknown>(response: Response): Promise<T> {
		return (await safeReadResponse(response)) as T;
	}

	private composeUrl(path: string, query?: Record<string, unknown>): string {
		const url = new URL(
			path,
			this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`,
		);

		if (query && Object.keys(query).length > 0) {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(query)) {
				if (value === undefined || value === null) {
					continue;
				}

				if (Array.isArray(value)) {
					for (const item of value) {
						params.append(key, String(item));
					}
				} else {
					params.append(key, String(value));
				}
			}

			url.search = params.toString();
		}

		return url.toString();
	}

	private composeHeaders(
		headers: Record<string, string> = {},
		body?: unknown,
	): Headers {
		const composed = new Headers({
			Authorization: `Bearer ${this.apiKey}`,
			...this.defaultHeaders,
			...headers,
		});

		if (
			body !== undefined &&
			!(body instanceof FormData) &&
			!(body instanceof ArrayBuffer) &&
			!(body instanceof Blob) &&
			!(body instanceof URLSearchParams) &&
			!composed.has("content-type")
		) {
			composed.set("content-type", JSON_CONTENT_TYPE);
		}

		return composed;
	}

	private serializeBody(
		body: unknown,
		contentType: string | null | undefined,
	): BodyInit | undefined {
		if (body === undefined || body === null) {
			return undefined;
		}

		if (
			body instanceof FormData ||
			body instanceof Blob ||
			body instanceof ArrayBuffer ||
			body instanceof URLSearchParams ||
			typeof body === "string"
		) {
			return body as BodyInit;
		}

		if (
			contentType?.includes("application/x-www-form-urlencoded") &&
			isPlainObject(body)
		) {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries(body)) {
				if (value === undefined || value === null) {
					continue;
				}
				params.append(key, String(value));
			}

			return params;
		}

		if (contentType?.includes("application/json") || !contentType) {
			return JSON.stringify(body);
		}

		return body as BodyInit;
	}
}

async function safeReadResponse(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type");

	if (!contentType) {
		return undefined;
	}

	if (contentType.includes("application/json")) {
		return response.json();
	}

	if (contentType.includes("text/")) {
		return response.text();
	}

	return response.arrayBuffer();
}

export class DeepSeekHttpError extends Error {
	readonly status: number;
	readonly statusText: string;
	readonly body: unknown;
	readonly headers: Headers;

	constructor(
		status: number,
		statusText: string,
		body: unknown,
		headers: Headers = new Headers(),
	) {
		super(`DeepSeek request failed with status ${status} ${statusText}`);
		this.status = status;
		this.statusText = statusText;
		this.body = body;
		this.headers = headers;
	}
}
