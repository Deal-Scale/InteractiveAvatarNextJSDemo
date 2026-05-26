import type {
	OpenAPIOperation,
	OpenAPIParameter,
	OpenAPISpec,
} from "./spec-loader";

export type HttpMethod =
	| "get"
	| "put"
	| "post"
	| "delete"
	| "options"
	| "head"
	| "patch"
	| "trace";

export interface OperationDefinition {
	readonly id: string;
	readonly method: HttpMethod;
	readonly path: string;
	readonly parameters: readonly OpenAPIParameter[];
	readonly requestBody?: OpenAPIOperation["requestBody"];
	readonly tags: readonly string[];
}

export interface OperationRegistry {
	readonly byId: Map<string, OperationDefinition>;
	readonly byTag: Map<string, readonly OperationDefinition[]>;
	readonly matchers: readonly OperationMatcher[];
}

export interface MatchedOperation {
	readonly operation: OperationDefinition;
	readonly pathParams: Record<string, string>;
}

interface OperationMatcher {
	readonly definition: OperationDefinition;
	readonly segments: readonly PathSegment[];
}

type PathSegment =
	| { readonly type: "literal"; readonly value: string }
	| { readonly type: "parameter"; readonly name: string };

export function buildOperationRegistry(spec: OpenAPISpec): OperationRegistry {
	const byId = new Map<string, OperationDefinition>();
	const byTag = new Map<string, OperationDefinition[]>();
	const matchers: OperationMatcher[] = [];

	for (const [path, operations] of Object.entries(spec.paths ?? {})) {
		for (const [method, operation] of Object.entries(operations)) {
			if (!isHttpMethod(method)) {
				continue;
			}

			const operationId = operation.operationId;

			if (!operationId) {
				continue;
			}

			const parameters = operation.parameters ?? [];
			const tags = operation.tags ?? ["uncategorized"];
			const definition: OperationDefinition = {
				id: operationId,
				method,
				path,
				parameters,
				requestBody: operation.requestBody,
				tags,
			};

			byId.set(operationId, definition);
			matchers.push(createMatcher(definition));

			for (const tag of tags) {
				const existing = byTag.get(tag) ?? [];
				byTag.set(tag, [...existing, definition]);
			}
		}
	}

	return {
		byId,
		byTag: new Map(
			[...byTag.entries()].map(([tag, items]) => [tag, [...items]]),
		),
		matchers,
	};
}

export function isHttpMethod(value: string): value is HttpMethod {
	return (
		value === "get" ||
		value === "put" ||
		value === "post" ||
		value === "delete" ||
		value === "options" ||
		value === "head" ||
		value === "patch" ||
		value === "trace"
	);
}

export function matchOperationByPath(
	registry: OperationRegistry,
	method: HttpMethod,
	path: string,
): MatchedOperation | undefined {
	const normalized = normalizePath(path);
	const targetSegments = normalized === "" ? [] : normalized.split("/");

	for (const matcher of registry.matchers) {
		if (matcher.definition.method !== method) {
			continue;
		}

		if (matcher.segments.length !== targetSegments.length) {
			continue;
		}

		const pathParams: Record<string, string> = {};
		let matched = true;

		for (let index = 0; index < matcher.segments.length; index += 1) {
			const segment = matcher.segments[index];
			const candidate = targetSegments[index];

			if (segment.type === "literal") {
				if (segment.value !== candidate) {
					matched = false;
					break;
				}

				continue;
			}

			try {
				pathParams[segment.name] = decodeURIComponent(candidate);
			} catch {
				pathParams[segment.name] = candidate;
			}
		}

		if (matched) {
			return { operation: matcher.definition, pathParams };
		}
	}

	return undefined;
}

function createMatcher(definition: OperationDefinition): OperationMatcher {
	const segments = splitPath(definition.path).map<PathSegment>((segment) => {
		const parameterMatch = segment.match(/^\{(.+?)\}$/);

		if (parameterMatch) {
			return { type: "parameter", name: parameterMatch[1] };
		}

		return { type: "literal", value: segment };
	});

	return {
		definition,
		segments,
	};
}

function splitPath(path: string): string[] {
	const trimmed = normalizePath(path);

	if (trimmed === "") {
		return [];
	}

	return trimmed.split("/");
}

function normalizePath(path: string): string {
	return path.replace(/^\/+/, "").replace(/\/+$/, "");
}
