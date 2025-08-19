import { useQuery } from "@tanstack/react-query";
import { useStandardMutation } from "@/lib/query/mutations";
import { queryKeys } from "@/lib/query/keys";

// Low-level fetchers (can be used with QueryClient.fetchQuery in non-hook code)
export async function fetchMcpTools() {
	const res = await fetch("/api/mcp/tools");
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function fetchMcpPrompts() {
	const res = await fetch("/api/mcp/prompts");
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function fetchMcpResources() {
	const res = await fetch("/api/mcp/resources");
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function postMcpTool(name: string, args: Record<string, unknown>) {
	const res = await fetch(`/api/mcp/tool/${encodeURIComponent(name)}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ args }),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function postMcpResource(uri: string) {
	const res = await fetch(`/api/mcp/resource`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ uri }),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function postMcpPrompt(
	name: string,
	args: Record<string, unknown>,
) {
	const res = await fetch(`/api/mcp/prompt`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, args }),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}
export async function postMcpComplete(payload: any) {
	const res = await fetch(`/api/mcp/complete`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

// Hooks
export function useMcpToolsQuery() {
	return useQuery({
		queryKey: queryKeys.mcp.tools,
		queryFn: fetchMcpTools,
		staleTime: 2 * 60_000,
	});
}
export function useMcpPromptsQuery() {
	return useQuery({
		queryKey: queryKeys.mcp.prompts,
		queryFn: fetchMcpPrompts,
		staleTime: 2 * 60_000,
	});
}
export function useMcpResourcesQuery() {
	return useQuery({
		queryKey: queryKeys.mcp.resources,
		queryFn: fetchMcpResources,
		staleTime: 2 * 60_000,
	});
}

export function useMcpToolMutation() {
	return useStandardMutation(
		(vars: { name: string; args: Record<string, unknown> }) =>
			postMcpTool(vars.name, vars.args),
	);
}
export function useMcpResourceMutation() {
	return useStandardMutation((vars: { uri: string }) =>
		postMcpResource(vars.uri),
	);
}
export function useMcpPromptMutation() {
	return useStandardMutation(
		(vars: { name: string; args: Record<string, unknown> }) =>
			postMcpPrompt(vars.name, vars.args),
	);
}
export function useMcpCompleteMutation() {
	return useStandardMutation((payload: any) => postMcpComplete(payload));
}
