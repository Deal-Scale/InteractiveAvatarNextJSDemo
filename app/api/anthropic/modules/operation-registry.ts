export type HttpMethod =
	| "get"
	| "put"
	| "post"
	| "delete"
	| "options"
	| "head"
	| "patch"
	| "trace";

export interface OperationParameter {
	readonly in: "path" | "query" | "header";
	readonly name: string;
	readonly required?: boolean;
}

export interface OperationDefinition {
	readonly id: string;
	readonly method: HttpMethod;
	readonly path: string;
	readonly tag: string;
	readonly summary: string;
	readonly parameters: readonly OperationParameter[];
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

export function buildOperationRegistry(
	operations: readonly OperationDefinition[],
): OperationRegistry {
	const byId = new Map<string, OperationDefinition>();
	const byTag = new Map<string, OperationDefinition[]>();
	const matchers: OperationMatcher[] = [];

	for (const operation of operations) {
		byId.set(operation.id, operation);
		matchers.push(createMatcher(operation));

		const existing = byTag.get(operation.tag) ?? [];
		byTag.set(operation.tag, [...existing, operation]);
	}

	return {
		byId,
		byTag: new Map([...byTag.entries()].map(([tag, defs]) => [tag, [...defs]])),
		matchers,
	};
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
