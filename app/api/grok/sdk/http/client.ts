import type { RequestOptions } from "../contracts";

export interface ApiKeyProvider {
	(): Promise<string | undefined> | string | undefined;
}

export interface HttpClientOptions {
	readonly baseUrl: string;
	readonly fetchImpl?: typeof fetch;
	readonly apiKeyProvider?: ApiKeyProvider;
	readonly defaultHeaders?: Record<string, string>;
}

export interface HttpClientRequest<TBody = unknown> extends RequestOptions {
	readonly body?: TBody;
}

export class HttpError<TBody = unknown> extends Error {
	readonly status: number;
	readonly statusText: string;
	readonly body: TBody | undefined;

	constructor({
		status,
		statusText,
		body,
	}: { status: number; statusText: string; body?: TBody }) {
		super(statusText || `Request failed with status ${status}`);
		this.status = status;
		this.statusText = statusText;
		this.body = body;
	}
}

export class HttpClient {
	private readonly baseUrl: string;
	private readonly fetchImpl: typeof fetch;
	private readonly apiKeyProvider?: ApiKeyProvider;
	private readonly defaultHeaders: Record<string, string>;

	constructor(options: HttpClientOptions) {
		this.baseUrl = options.baseUrl.replace(/\/$/, "");
		this.fetchImpl = options.fetchImpl ?? fetch;
		this.apiKeyProvider = options.apiKeyProvider;
		this.defaultHeaders = options.defaultHeaders ?? {};
	}

	async request<TResponse>(options: HttpClientRequest): Promise<TResponse> {
		const url = this.createUrl(options.path, options.query);
		const headers: Record<string, string> = {
			"content-type": "application/json",
			...this.defaultHeaders,
			...options.headers,
		};

		const apiKey = await this.apiKeyProvider?.();
		if (apiKey) {
			headers.authorization = `Bearer ${apiKey}`;
		}

		const response = await this.fetchImpl(url, {
			method: options.method,
			headers,
			body:
				options.body !== undefined ? JSON.stringify(options.body) : undefined,
		});

		return this.parseResponse<TResponse>(response);
	}

	async raw(options: RequestOptions): Promise<Response> {
		const url = this.createUrl(options.path, options.query);
		const headers: Record<string, string> = {
			...this.defaultHeaders,
			...options.headers,
		};

		const apiKey = await this.apiKeyProvider?.();
		if (apiKey) {
			headers.authorization = `Bearer ${apiKey}`;
		}

		return this.fetchImpl(url, {
			method: options.method,
			headers,
			body: options.body as BodyInit | undefined,
		});
	}

	private createUrl(path: string, query?: RequestOptions["query"]): string {
		const normalizedPath = path.startsWith("/") ? path : `/${path}`;
		const url = new URL(`${this.baseUrl}${normalizedPath}`);

		if (query) {
			for (const [key, value] of Object.entries(query)) {
				if (value === undefined) continue;
				url.searchParams.set(key, String(value));
			}
		}

		return url.toString();
	}

	private async parseResponse<TResponse>(
		response: Response,
	): Promise<TResponse> {
		if (!response.ok) {
			const body = await this.safeParse(response);
			throw new HttpError({
				status: response.status,
				statusText: response.statusText,
				body,
			});
		}

		const contentType = response.headers.get("content-type") ?? "";
		if (contentType.includes("application/json")) {
			return (await response.json()) as TResponse;
		}

		return (await response.text()) as unknown as TResponse;
	}

	private async safeParse(response: Response): Promise<unknown> {
		const contentType = response.headers.get("content-type") ?? "";
		try {
			if (contentType.includes("application/json")) {
				return await response.json();
			}
			return await response.text();
		} catch (error) {
			return undefined;
		}
	}
}
