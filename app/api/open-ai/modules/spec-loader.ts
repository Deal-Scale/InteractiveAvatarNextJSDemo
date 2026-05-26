import { readFile } from "node:fs/promises";
import path from "node:path";

import YAML from "yaml";

export interface OpenAPISpec {
	readonly paths: Record<string, Record<string, OpenAPIOperation>>;
}

export interface OpenAPIOperation {
	readonly operationId?: string;
	readonly parameters?: readonly OpenAPIParameter[];
	readonly requestBody?: OpenAPIRequestBody;
	readonly tags?: readonly string[];
}

export interface OpenAPIParameter {
	readonly name: string;
	readonly in: "query" | "header" | "path" | "cookie";
	readonly required?: boolean;
}

export interface OpenAPIRequestBody {
	readonly required?: boolean;
	readonly content?: Record<string, unknown>;
}

let cachedSpec: OpenAPISpec | null = null;

export async function loadOpenAISpec(
	specPath = path.join(
		process.cwd(),
		"app",
		"api",
		"open-ai",
		"openapi.documented.yml",
	),
): Promise<OpenAPISpec> {
	if (cachedSpec) {
		return cachedSpec;
	}

	const file = await readFile(specPath, "utf8");
	const parsed = YAML.parse(file) as OpenAPISpec;

	if (!parsed?.paths) {
		throw new Error("Invalid OpenAPI specification: missing paths definition");
	}

	cachedSpec = parsed;
	return parsed;
}

export function resetOpenAISpecCache(): void {
	cachedSpec = null;
}
