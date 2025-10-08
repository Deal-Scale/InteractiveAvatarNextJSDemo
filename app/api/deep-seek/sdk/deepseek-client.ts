import { buildOperationModules } from "../modules/module-factory";
import {
	buildOperationRegistry,
	matchOperationByPath,
	type HttpMethod,
	type MatchedOperation,
	type OperationDefinition,
	type OperationRegistry,
} from "../modules/operation-registry";
import { DEFAULT_OPERATIONS } from "../modules/operations";
import {
	applyPathParams,
	extractHeaderParams,
	extractQueryParams,
} from "../modules/utils";
import {
	HttpClient,
	type RequestOptions,
	DeepSeekHttpError,
} from "../modules/http-client";

export interface DeepSeekClientConfig {
	readonly apiKey: string;
	readonly baseUrl?: string;
	readonly defaultHeaders?: Record<string, string>;
	readonly operations?: readonly OperationDefinition[];
	readonly requestDefaults?: {
		readonly headers?: Record<string, string>;
		readonly query?: Record<string, unknown>;
	};
}

export interface OperationCallOptions {
	readonly pathParams?: Record<string, unknown>;
	readonly query?: Record<string, unknown>;
	readonly headers?: Record<string, unknown>;
	readonly body?: unknown;
	readonly signal?: AbortSignal;
}

export class DeepSeekClient {
	private readonly httpClient: HttpClient;
	private readonly registryPromise: Promise<OperationRegistry>;
	private modulesCache: Record<
		string,
		import("../modules/module-factory").OperationModule
	> | null = null;
	private readonly requestDefaults: Required<
		NonNullable<DeepSeekClientConfig["requestDefaults"]>
	>;

	constructor(config: DeepSeekClientConfig) {
		if (!config.apiKey) {
			throw new Error("DeepSeekClient requires an apiKey");
		}

		this.httpClient = new HttpClient({
			apiKey: config.apiKey,
			baseUrl: config.baseUrl ?? "https://api.deepseek.com/v1",
			defaultHeaders: config.defaultHeaders,
		});

		const operations = config.operations ?? DEFAULT_OPERATIONS;
		this.registryPromise = Promise.resolve(buildOperationRegistry(operations));
		this.requestDefaults = {
			headers: config.requestDefaults?.headers ?? {},
			query: config.requestDefaults?.query ?? {},
		};
	}

	async call<T = unknown>(
		operationId: string,
		options: OperationCallOptions = {},
	): Promise<T> {
		const response = await this.callRaw(operationId, options);
		return this.httpClient.parseResponse<T>(response);
	}

	async callRaw(
		operationId: string,
		options: OperationCallOptions = {},
	): Promise<Response> {
		const operation = await this.getOperationOrThrow(operationId);
		const requestOptions = this.composeRequestOptions(operation, options);
		return this.httpClient.requestRaw(requestOptions);
	}

	async getOperation(
		operationId: string,
	): Promise<OperationDefinition | undefined> {
		const registry = await this.registryPromise;
		return registry.byId.get(operationId);
	}

	async resolveOperation(
		method: HttpMethod,
		path: string,
	): Promise<MatchedOperation | undefined> {
		const registry = await this.registryPromise;
		return matchOperationByPath(registry, method, path);
	}

	async modules(): Promise<
		Record<string, import("../modules/module-factory").OperationModule>
	> {
		if (this.modulesCache) {
			return this.modulesCache;
		}

		const registry = await this.registryPromise;
		this.modulesCache = buildOperationModules(registry, this);
		return this.modulesCache;
	}

	private async getOperationOrThrow(
		operationId: string,
	): Promise<OperationDefinition> {
		const registry = await this.registryPromise;
		const operation = registry.byId.get(operationId);

		if (!operation) {
			throw new Error(`Unknown DeepSeek operation: ${operationId}`);
		}

		return operation;
	}

	private composeRequestOptions(
		operation: OperationDefinition,
		options: OperationCallOptions,
	): RequestOptions {
		const path = applyPathParams(operation.path, options.pathParams ?? {});

		const query: Record<string, unknown> = {};
		mergeDefined(query, this.requestDefaults.query);
		mergeDefined(
			query,
			extractQueryParams(operation.parameters, options.query ?? {}),
		);
		mergeDefined(query, options.query ?? {});

		const headers: Record<string, string> = {};
		mergeDefined(headers, this.requestDefaults.headers);
		mergeDefined(
			headers,
			extractHeaderParams(operation.parameters, options.headers ?? {}),
		);
		mergeDefined(headers, stringifyHeaderValues(options.headers ?? {}));

		return {
			method: operation.method,
			path,
			query,
			headers,
			body: options.body,
			signal: options.signal,
		} satisfies RequestOptions;
	}
}

export { DeepSeekHttpError };

function mergeDefined<T extends Record<string, unknown>>(
	target: Record<string, unknown>,
	source: T,
): void {
	for (const [key, value] of Object.entries(source)) {
		if (value === undefined) {
			continue;
		}

		target[key] = value;
	}
}

function stringifyHeaderValues(
	headers: Record<string, unknown>,
): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of Object.entries(headers)) {
		if (value === undefined || value === null) {
			continue;
		}

		result[key] = String(value);
	}

	return result;
}
