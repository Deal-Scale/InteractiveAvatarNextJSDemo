"use client";

import { getChatResourceCatalog } from "@/lib/app-capabilities";
import { postMcpResource, postMcpTool } from "@/lib/services/mcp/query";

import type { KanbanTask, MCPFunction, MCPResource } from "./types";

export type TaskMcpReference = {
	kind: "tool" | "resource";
	name: string;
	input?: Record<string, unknown>;
	source?: "app";
	toolName?: string;
	connected?: boolean;
};

export type TaskMcpExecutionResult = {
	references: TaskMcpReference[];
	toolResults: Array<{
		name: string;
		ok: boolean;
		output?: unknown;
		error?: string;
	}>;
	resourceResults: Array<{
		uri: string;
		ok: boolean;
		output?: unknown;
		error?: string;
	}>;
	appResourceResults: Array<
		| {
				kind: "app-tool";
				name: string;
				connected: boolean;
		  }
		| {
				kind: "app-resource";
				name: string;
				connected: boolean;
		  }
	>;
	summary: string;
};

const MCP_TOOL_REF_RE = /\[MCP:([^\(\]\s]+)\s*(?:\(([\s\S]*?)\))?\]/gi;
const MCP_RESOURCE_REF_RE =
	/\[(?:MCPRESOURCE|MCP_RESOURCE|RESOURCE|MCP:resource)\s*:\s*([^\]]+)\]/gi;

function normalizeRef(value: string) {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeWords(value: string) {
	return normalizeRef(value).replace(/[^a-z0-9._/-]+/g, " ");
}

function uniqueBy<T>(items: T[], keyFn: (item: T) => string) {
	const seen = new Set<string>();
	return items.filter((item) => {
		const key = keyFn(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function parseInlineJson(input?: string) {
	if (!input) return undefined;
	try {
		const parsed = JSON.parse(input);
		return parsed && typeof parsed === "object"
			? (parsed as Record<string, unknown>)
			: undefined;
	} catch {
		return undefined;
	}
}

function tokenize(value: string) {
	return normalizeWords(value)
		.split(/\s+/)
		.map((term) => term.trim())
		.filter(Boolean);
}

function containsAllTerms(text: string, query: string) {
	const haystack = ` ${normalizeWords(text)} `;
	const terms = tokenize(query);
	if (terms.length === 0) return false;
	return terms.every((term) => haystack.includes(` ${term} `));
}

function collectTaskSearchText(task: KanbanTask) {
	return [
		task.title,
		task.description ?? "",
		task.outputMarkdown ?? "",
		task.aiStreamText ?? "",
		task.mcpWorkflow?.title ?? "",
		...(task.mcpWorkflow?.prompts ?? []).flatMap((prompt) => [
			prompt.text,
			prompt.description,
		]),
	].join("\n");
}

function collectTextReferences(task: KanbanTask) {
	const textParts = collectTaskSearchText(task);

	const references: TaskMcpReference[] = [];

	for (const match of textParts.matchAll(MCP_TOOL_REF_RE)) {
		const name = match[1]?.trim();
		if (!name) continue;
		references.push({
			kind: "tool",
			name,
			input: parseInlineJson(match[2]),
		});
	}

	for (const match of textParts.matchAll(MCP_RESOURCE_REF_RE)) {
		const uri = match[1]?.trim();
		if (!uri) continue;
		references.push({
			kind: "resource",
			name: uri,
		});
	}

	return references;
}

function collectInferredReferences(task: KanbanTask) {
	const textParts = collectTaskSearchText(task);
	const workflowTools = task.mcpWorkflow?.functions ?? [];
	const workflowResources = task.mcpWorkflow?.resources ?? [];
	const inferred: TaskMcpReference[] = [];

	for (const fn of workflowTools) {
		const candidates = [
			fn.name,
			fn.description,
			fn.signature,
			...(fn.exampleArgs ? Object.keys(fn.exampleArgs) : []),
		].filter(Boolean) as string[];

		if (
			candidates.some((candidate) => containsAllTerms(textParts, candidate))
		) {
			inferred.push({
				kind: "tool",
				name: fn.name,
				input: fn.exampleArgs,
			});
		}
	}

	for (const resource of workflowResources) {
		const candidates = [
			resource.uri,
			resource.type,
			resource.description,
		].filter(Boolean) as string[];
		if (
			candidates.some((candidate) => containsAllTerms(textParts, candidate))
		) {
			inferred.push({
				kind: "resource",
				name: resource.uri,
			});
		}
	}

	return inferred;
}

function collectAppCatalogReferences(task: KanbanTask) {
	const textParts = collectTaskSearchText(task);
	const catalog = getChatResourceCatalog("all");
	const inferred: TaskMcpReference[] = [];

	for (const resource of catalog) {
		const candidates = [resource.name, resource.id].filter(Boolean) as string[];
		if (
			!candidates.some((candidate) => containsAllTerms(textParts, candidate))
		) {
			continue;
		}

		if (resource.kind === "tool") {
			inferred.push({
				kind: "tool",
				name: resource.name,
				source: "app",
				toolName: resource.toolName ?? resource.id.replace(/^tool-/, ""),
				connected: Boolean(resource.isConnected),
			});
			continue;
		}

		inferred.push({
			kind: "resource",
			name: resource.name,
			source: "app",
			connected: Boolean(resource.isConnected ?? true),
		});
	}

	return inferred;
}

export function collectTaskMcpReferences(task: KanbanTask) {
	const workflowTools = (task.mcpWorkflow?.functions ?? []).map(
		(fn: MCPFunction) => ({
			kind: "tool" as const,
			name: fn.name,
			input: fn.exampleArgs,
		}),
	);
	const workflowResources = (task.mcpWorkflow?.resources ?? []).map(
		(resource: MCPResource) => ({
			kind: "resource" as const,
			name: resource.uri,
		}),
	);
	const inlineRefs = collectTextReferences(task);
	const inferredRefs = collectInferredReferences(task);
	const appCatalogRefs = collectAppCatalogReferences(task);

	return uniqueBy(
		[
			...workflowTools,
			...workflowResources,
			...inlineRefs,
			...inferredRefs,
			...appCatalogRefs,
		].filter((ref) => normalizeRef(ref.name).length > 0),
		(ref) => `${ref.kind}:${normalizeRef(ref.name)}`,
	);
}

export async function executeTaskMcpReferences(
	task: KanbanTask,
): Promise<TaskMcpExecutionResult> {
	const references = collectTaskMcpReferences(task);
	const toolRefs = references.filter(
		(ref): ref is TaskMcpReference & { kind: "tool" } => ref.kind === "tool",
	);
	const resourceRefs = references.filter(
		(ref): ref is TaskMcpReference & { kind: "resource" } =>
			ref.kind === "resource",
	);
	const toolResults: TaskMcpExecutionResult["toolResults"] = [];
	const resourceResults: TaskMcpExecutionResult["resourceResults"] = [];
	const appResourceResults: TaskMcpExecutionResult["appResourceResults"] = [];

	for (const ref of toolRefs) {
		if (ref.source === "app" && !ref.connected) {
			appResourceResults.push({
				kind: "app-tool",
				name: ref.name,
				connected: false,
			});
			continue;
		}
		try {
			const output = await postMcpTool(
				ref.toolName ?? ref.name,
				ref.input ?? {},
			);
			toolResults.push({ name: ref.name, ok: true, output });
		} catch (error) {
			toolResults.push({
				name: ref.name,
				ok: false,
				error: (error as Error)?.message ?? "Unknown tool error",
			});
		}
	}

	for (const ref of resourceRefs) {
		if (ref.source === "app") {
			appResourceResults.push({
				kind: ref.kind === "resource" ? "app-resource" : "app-tool",
				name: ref.name,
				connected: Boolean(ref.connected ?? true),
			});
			continue;
		}
		try {
			const output = await postMcpResource(ref.name);
			resourceResults.push({ uri: ref.name, ok: true, output });
		} catch (error) {
			resourceResults.push({
				uri: ref.name,
				ok: false,
				error: (error as Error)?.message ?? "Unknown resource error",
			});
		}
	}

	const lines = [
		...toolResults.map(
			(result) =>
				`- Tool ${result.ok ? "loaded" : "failed"}: ${result.name}${
					result.ok ? "" : ` (${result.error})`
				}`,
		),
		...resourceResults.map(
			(result) =>
				`- Resource ${result.ok ? "loaded" : "failed"}: ${result.uri}${
					result.ok ? "" : ` (${result.error})`
				}`,
		),
		...appResourceResults.map(
			(result) =>
				`- App ${result.kind === "app-tool" ? "tool" : "resource"} referenced: ${result.name}${result.connected === false ? " (not connected)" : ""}`,
		),
	];

	return {
		references,
		toolResults,
		resourceResults,
		appResourceResults,
		summary:
			lines.length > 0
				? [
						"Referenced MCP items were resolved while the task was running.",
						...lines,
					].join("\n")
				: "No MCP references were found on this task.",
	};
}
