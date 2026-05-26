import type {
	OperationDefinition,
	OperationRegistry,
} from "./operation-registry";
import type { DeepSeekClient } from "../sdk/deepseek-client";

export type OperationInvoker = (
	options?: import("../sdk/deepseek-client").OperationCallOptions,
) => Promise<unknown>;

export type OperationModule = Record<string, OperationInvoker> & {
	readonly tag: string;
	readonly operations: readonly OperationDefinition[];
};

export function buildOperationModules(
	registry: OperationRegistry,
	client: DeepSeekClient,
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
	const sanitized = tag.trim().toLowerCase();

	if (sanitized.length === 0) {
		return "untitled";
	}

	const firstToken = sanitized.split(/\s+/)[0] ?? sanitized;
	const cleaned = firstToken.replace(/[^a-z0-9]/g, "");

	if (cleaned.length === 0) {
		return "untitled";
	}

	if (/^\d/.test(cleaned)) {
		return `_${cleaned}`;
	}

	return cleaned;
}
