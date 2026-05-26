import type {
	OperationDefinition,
	OperationRegistry,
} from "./operation-registry";
import type { OpenAIClient } from "../sdk/openai-client";

export type OperationInvoker = (
	options?: import("../sdk/openai-client").OperationCallOptions,
) => Promise<unknown>;

export type OperationModule = Record<string, OperationInvoker> & {
	readonly tag: string;
	readonly operations: readonly OperationDefinition[];
};

export function buildOperationModules(
	registry: OperationRegistry,
	client: OpenAIClient,
): Record<string, OperationModule> {
	const modules: Record<string, OperationModule> = {};

	for (const [tag, operations] of registry.byTag.entries()) {
		const invokers: Record<string, OperationInvoker> = {};

		for (const operation of operations) {
			invokers[operation.id] = (options) => client.call(operation.id, options);
		}

		const normalizedKey = normalizeTag(tag);

		modules[normalizedKey] = Object.assign(invokers, {
			operations,
			tag,
		});
	}

	return modules;
}

function normalizeTag(tag: string): string {
	const sanitized = tag.trim();

	if (sanitized.length === 0) {
		return "untitled";
	}

	return sanitized
		.toLowerCase()
		.replace(/[^a-z0-9]+(.)?/g, (_, chr: string | undefined) =>
			chr ? chr.toUpperCase() : "",
		)
		.replace(/^(\d)/, "_$1");
}
