import { KB_CONNECTORS } from "@/components/KnowledgeBase/connectors";
import { useTaskStore } from "@/components/kanban/utils/store";
import { buildKnowledgeTree, flattenKnowledgeTree } from "@/lib/knowledge-tree";
import { useAgentStore } from "@/lib/stores/agent";
import { useAssetsStore } from "@/lib/stores/assets";
import type { ComposerAsset } from "@/lib/stores/composer";
import { useComposerStore } from "@/lib/stores/composer";
import { useSessionStore } from "@/lib/stores/session";
import type { MessageToolPart } from "@/lib/types";
import { switchWorkspaceView } from "@/lib/workspace-view";

export type WorkspaceTab = "video" | "brain" | "data" | "actions";
export type ChatResourceType = "asset" | "knowledge" | "agent" | "tool";

export type AppCapabilityName =
	| "switch_workspace_tab"
	| "create_kanban_task"
	| "search_chat_resources"
	| "add_chat_resource"
	| "reference_chat_resource";

export type AppCapabilityAction = {
	tool: AppCapabilityName;
	args?: Record<string, unknown>;
};

export type AppCapabilityResult = {
	tool: AppCapabilityName;
	ok: boolean;
	message: string;
	data?: Record<string, unknown>;
};

const APP_ACTION_BLOCK_RE =
	/```(?:app-action|app_action|app-actions|app_actions)\s*([\s\S]*?)```/gi;
const FENCED_CODE_BLOCK_RE = /```([a-zA-Z_-]+)?\s*([\s\S]*?)```/g;

export const APP_CAPABILITIES_SYSTEM_PROMPT = [
	"App capabilities are available through structured app-action blocks.",
	"When the user asks to switch workspace tabs, navigate Brain/Data/Actions, create Kanban tasks, search app resources, or add/reference resources in chat, include a fenced app-action block and a short user-facing response.",
	"Use only these tools:",
	'1. switch_workspace_tab: {"tool":"switch_workspace_tab","args":{"tab":"brain|data|actions|video"}}',
	'2. create_kanban_task: {"tool":"create_kanban_task","args":{"title":"Task title","description":"Task details","dueDate":"YYYY-MM-DD","assignedToTeamMember":"optional","priority":"low|medium|high"}}',
	'3. search_chat_resources: {"tool":"search_chat_resources","args":{"resourceType":"asset|knowledge|agent|tool|all","query":"search text","limit":5}}',
	'4. add_chat_resource: {"tool":"add_chat_resource","args":{"resourceType":"asset|knowledge|agent|tool","id":"resource id"}}',
	'5. reference_chat_resource: {"tool":"reference_chat_resource","args":{"resourceType":"asset|knowledge|agent|tool","query":"resource name"}}',
	"Use search_chat_resources first when the user gives an ambiguous resource name.",
	"When the user asks to search and attach or reference a resource, return a multi-action block that searches first and then attaches/references the matched resource.",
	"Use add_chat_resource or reference_chat_resource directly when the requested resource is clear.",
	"Multiple actions may be returned as a JSON array inside one app-action block.",
].join("\n");

function isWorkspaceTab(value: unknown): value is WorkspaceTab {
	return (
		value === "video" ||
		value === "brain" ||
		value === "data" ||
		value === "actions"
	);
}

function defaultDueDate() {
	return new Date().toISOString().slice(0, 10);
}

function isAppCapabilityName(value: unknown): value is AppCapabilityName {
	return (
		value === "switch_workspace_tab" ||
		value === "create_kanban_task" ||
		value === "search_chat_resources" ||
		value === "add_chat_resource" ||
		value === "reference_chat_resource"
	);
}

function isChatResourceType(value: unknown): value is ChatResourceType {
	return (
		value === "asset" ||
		value === "knowledge" ||
		value === "agent" ||
		value === "tool"
	);
}

function normalizeAction(value: unknown): AppCapabilityAction[] {
	if (Array.isArray(value)) {
		return value.flatMap(normalizeAction);
	}

	if (!value || typeof value !== "object") return [];

	const candidate = value as {
		tool?: unknown;
		name?: unknown;
		args?: unknown;
		arguments?: unknown;
	};
	const tool = candidate.tool ?? candidate.name;

	if (!isAppCapabilityName(tool)) {
		return [];
	}

	const args = candidate.args ?? candidate.arguments;
	return [
		{
			tool,
			args:
				args && typeof args === "object"
					? (args as Record<string, unknown>)
					: {},
		},
	];
}

function normalizeKeyText(value: unknown) {
	return typeof value === "string"
		? value.trim().toLowerCase().replace(/\s+/g, " ")
		: "";
}

function getActionKey(action: AppCapabilityAction) {
	if (action.tool === "create_kanban_task") {
		return `${action.tool}:${normalizeKeyText(action.args?.title)}`;
	}

	if (action.tool === "switch_workspace_tab") {
		return `${action.tool}:${normalizeKeyText(action.args?.tab)}`;
	}

	if (
		action.tool === "search_chat_resources" ||
		action.tool === "add_chat_resource" ||
		action.tool === "reference_chat_resource"
	) {
		const ids = Array.isArray(action.args?.ids)
			? action.args.ids.map(normalizeKeyText).join(",")
			: normalizeKeyText(action.args?.id);
		return [
			action.tool,
			normalizeKeyText(
				action.args?.resourceType ?? action.args?.type ?? action.args?.kind,
			),
			ids || normalizeKeyText(action.args?.query ?? action.args?.name),
		].join(":");
	}

	return `${action.tool}:${JSON.stringify(action.args ?? {})}`;
}

export function dedupeAppCapabilityActions(actions: AppCapabilityAction[]) {
	const seen = new Set<string>();
	const unique: AppCapabilityAction[] = [];

	for (const action of actions) {
		const key = getActionKey(action);
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(action);
	}

	return unique;
}

function parseActionJson(raw: string): AppCapabilityAction[] {
	try {
		return normalizeAction(JSON.parse(raw));
	} catch {
		return [];
	}
}

function findFencedCodeRanges(content: string) {
	return Array.from(content.matchAll(FENCED_CODE_BLOCK_RE), (match) => ({
		start: match.index ?? 0,
		end: (match.index ?? 0) + match[0].length,
		label: (match[1] ?? "").toLowerCase(),
		raw: match[2]?.trim() ?? "",
	}));
}

function isInRange(
	index: number,
	ranges: Array<{ start: number; end: number }>,
) {
	return ranges.some((range) => index >= range.start && index < range.end);
}

function findJsonActionRanges(
	content: string,
	ignoredRanges: Array<{ start: number; end: number }> = [],
) {
	const ranges: Array<{
		start: number;
		end: number;
		raw: string;
		actions: AppCapabilityAction[];
	}> = [];

	for (let i = 0; i < content.length; i += 1) {
		const opener = content[i];
		if ((opener !== "{" && opener !== "[") || isInRange(i, ignoredRanges)) {
			continue;
		}

		const closer = opener === "{" ? "}" : "]";
		const stack = [closer];
		let inString = false;
		let escaped = false;

		for (let j = i + 1; j < content.length; j += 1) {
			const char = content[j];

			if (inString) {
				if (escaped) {
					escaped = false;
				} else if (char === "\\") {
					escaped = true;
				} else if (char === '"') {
					inString = false;
				}
				continue;
			}

			if (char === '"') {
				inString = true;
				continue;
			}

			if (char === "{" || char === "[") {
				stack.push(char === "{" ? "}" : "]");
				continue;
			}

			if (char === "}" || char === "]") {
				if (char !== stack.at(-1)) break;
				stack.pop();
				if (stack.length === 0) {
					const raw = content.slice(i, j + 1);
					const actions = parseActionJson(raw);
					if (actions.length > 0) {
						ranges.push({ start: i, end: j + 1, raw, actions });
					}
					i = j;
					break;
				}
			}
		}
	}

	return ranges;
}

export function parseAppCapabilityActions(
	content: string,
): AppCapabilityAction[] {
	const actions: AppCapabilityAction[] = [];

	for (const match of content.matchAll(APP_ACTION_BLOCK_RE)) {
		const raw = match[1]?.trim();
		if (!raw) continue;
		actions.push(...parseActionJson(raw));
	}

	const fencedRanges = findFencedCodeRanges(content);
	const appActionRanges = fencedRanges.filter((range) =>
		["app-action", "app_action", "app-actions", "app_actions"].includes(
			range.label,
		),
	);

	for (const range of fencedRanges) {
		if (
			["app-action", "app_action", "app-actions", "app_actions"].includes(
				range.label,
			)
		) {
			continue;
		}
		actions.push(...parseActionJson(range.raw));
	}

	for (const range of findJsonActionRanges(content, fencedRanges)) {
		if (isInRange(range.start, appActionRanges)) continue;
		actions.push(...range.actions);
	}

	return dedupeAppCapabilityActions(actions);
}

export function stripAppCapabilityBlocks(content: string) {
	const fencedRanges = findFencedCodeRanges(content).filter((range) => {
		if (
			["app-action", "app_action", "app-actions", "app_actions"].includes(
				range.label,
			)
		) {
			return true;
		}
		return parseActionJson(range.raw).length > 0;
	});
	const bareRanges = findJsonActionRanges(content, fencedRanges);
	const ranges = [...fencedRanges, ...bareRanges].sort(
		(a, b) => b.start - a.start,
	);

	let stripped = content;
	for (const range of ranges) {
		stripped = `${stripped.slice(0, range.start)}${stripped.slice(range.end)}`;
	}

	return stripped.trim();
}

export type ChatResource = ComposerAsset & {
	kind: ChatResourceType;
	searchText: string;
	toolName?: string;
	isConnected?: boolean;
	connectionName?: string;
};

const DEFAULT_AGENT_RESOURCES: ChatResource[] = [
	{
		id: "agent-1",
		name: "Sales Assistant",
		kind: "agent",
		mimeType: "application/x-agent",
		description:
			"Qualifies leads, drafts outreach, and coordinates follow-up tasks through MCP actions.",
		searchText:
			"sales assistant revenue qualifies leads drafts outreach follow up tasks",
	},
	{
		id: "agent-2",
		name: "Support Bot",
		kind: "agent",
		mimeType: "application/x-agent",
		description:
			"Answers product questions, searches knowledge bases, and escalates unresolved issues.",
		searchText:
			"support bot customer success product questions knowledge bases escalation",
	},
	{
		id: "agent-3",
		name: "Content Analyst",
		kind: "agent",
		mimeType: "application/x-agent",
		description:
			"Reviews messages, extracts structured insights, and turns findings into dashboard-ready notes.",
		searchText:
			"content analyst research messages structured insights dashboard notes",
	},
];

function normalizeSearchText(value: unknown) {
	return typeof value === "string"
		? value.trim().toLowerCase().replace(/\s+/g, " ")
		: "";
}

function uniqueResources(resources: ChatResource[]) {
	const seen = new Set<string>();
	const out: ChatResource[] = [];

	for (const resource of resources) {
		const key = `${resource.kind}:${resource.id}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(resource);
	}

	return out;
}

function buildKnowledgeResources(): ChatResource[] {
	const session = useSessionStore.getState();
	const items = flattenKnowledgeTree(
		buildKnowledgeTree(session.createdKnowledgeItems),
	);
	const folderResources = session.kbFolders.map((folder) => ({
		id: folder.id.startsWith("kb-folder-")
			? folder.id
			: `kb-folder-${folder.id}`,
		name: folder.name,
		kind: "knowledge" as const,
		mimeType: "application/x-knowledge-folder",
		description: folder.parentId
			? "Knowledge base subfolder"
			: "Knowledge base folder",
		searchText: normalizeSearchText(
			`${folder.id} ${folder.name} knowledge base folder`,
		),
	}));
	const itemResources = items.map((item) => ({
		id: item.id.startsWith("kb-") ? item.id : `kb-${item.id}`,
		name: item.name,
		kind: "knowledge" as const,
		mimeType: "application/x-knowledge",
		description: "Knowledge base item",
		searchText: normalizeSearchText(
			`${item.id} ${item.name} knowledge base document item`,
		),
	}));

	return uniqueResources([...folderResources, ...itemResources]);
}

function buildAgentResources(): ChatResource[] {
	const agentStore = useAgentStore.getState();
	const sessionAgent = useSessionStore.getState().agentSettings;
	const configuredAgents = [
		agentStore.currentAgent,
		agentStore.lastStartedConfig,
		sessionAgent,
	].filter(Boolean);

	const configuredResources = configuredAgents.map((agent) => ({
		id: agent?.id?.startsWith("agent-") ? agent.id : `agent-${agent?.id}`,
		name: agent?.name || "Configured Agent",
		kind: "agent" as const,
		mimeType: "application/x-agent",
		thumbnailUrl: (agent as { avatarUrl?: string } | null)?.avatarUrl,
		description:
			agent?.systemPrompt ||
			agent?.sessionType ||
			"Configured agent with saved chat, voice, video, and MCP settings.",
		searchText: normalizeSearchText(
			[
				agent?.id,
				agent?.name,
				agent?.sessionType,
				agent?.model,
				agent?.knowledgeBaseId,
				agent?.systemPrompt,
				...(agent?.mcpServers ?? []),
				...(agent?.interactionModes ?? []),
			].join(" "),
		),
	}));

	return uniqueResources([...configuredResources, ...DEFAULT_AGENT_RESOURCES]);
}

function buildAssetResources(): ChatResource[] {
	return useAssetsStore.getState().assets.map((asset) => ({
		id: asset.id,
		name: asset.name,
		url: asset.url,
		thumbnailUrl: asset.thumbnailUrl,
		mimeType: asset.mimeType,
		kind: "asset" as const,
		description: asset.mimeType || "Asset",
		searchText: normalizeSearchText(
			`${asset.id} ${asset.name} ${asset.mimeType ?? ""} ${asset.url ?? ""}`,
		),
	}));
}

function buildToolResources(): ChatResource[] {
	const toolConnections = useSessionStore.getState().toolConnections;
	return KB_CONNECTORS.map((connector) => ({
		id: `tool-${connector.key}`,
		name: connector.name,
		kind: "tool" as const,
		toolName: connector.key,
		isConnected: Boolean(toolConnections[connector.key]),
		connectionName: toolConnections[connector.key]?.name,
		mimeType: "application/x-tool",
		description: connector.description,
		searchText: normalizeSearchText(
			`${connector.key} ${connector.name} ${connector.description} ${connector.auth.type}`,
		),
	}));
}

export function getChatResourceCatalog(
	resourceType?: ChatResourceType | "all",
) {
	const resources = [
		...buildAssetResources(),
		...buildKnowledgeResources(),
		...buildAgentResources(),
		...buildToolResources(),
	];

	if (!resourceType || resourceType === "all")
		return uniqueResources(resources);
	return uniqueResources(
		resources.filter((resource) => resource.kind === resourceType),
	);
}

function getRequestedResourceType(args?: Record<string, unknown>) {
	const candidate = args?.resourceType ?? args?.type ?? args?.kind;
	if (candidate === "all") return "all" as const;
	return isChatResourceType(candidate) ? candidate : undefined;
}

function scoreResource(
	resource: ChatResource,
	query: string,
	resourceType?: ChatResourceType | "all",
) {
	const needle = normalizeSearchText(query);
	if (!needle) return 1;

	const name = normalizeSearchText(resource.name);
	const id = normalizeSearchText(resource.id);
	const text = resource.searchText || normalizeSearchText(resource.description);
	const terms = needle.split(" ").filter(Boolean);

	if (resourceType === "asset" && terms.length > 1) {
		if (id === needle || name === needle) return 200;
		if (name.startsWith(needle) || id.startsWith(needle)) return 180;
		const everyTermInName = terms.every((term) => name.includes(term));
		const everyTermInId = terms.every((term) => id.includes(term));
		if (everyTermInName || everyTermInId) return 160;
		return 0;
	}

	if (id === needle || name === needle) return 200;
	if (name.startsWith(needle) || id.startsWith(needle)) return 180;
	if (terms.length > 1) {
		const everyTermInName = terms.every((term) => name.includes(term));
		const everyTermInId = terms.every((term) => id.includes(term));
		if (everyTermInName || everyTermInId) return 160;
	}
	if (id.includes(needle)) return 80;
	if (name.includes(needle)) return 70;
	if (text.includes(needle)) return 40;

	if (terms.length === 0) return 1;
	const matches = terms.filter(
		(term) => text.includes(term) || name.includes(term),
	);
	if (matches.length === terms.length && terms.length > 1) {
		return 140;
	}
	return matches.length > 0 ? matches.length * 10 : 0;
}

export function searchChatResources(args?: Record<string, unknown>) {
	const resourceType = getRequestedResourceType(args);
	const query = normalizeSearchText(args?.query ?? args?.name ?? args?.id);
	const limit =
		typeof args?.limit === "number" && Number.isFinite(args.limit)
			? Math.min(Math.max(Math.floor(args.limit), 1), 20)
			: 5;

	return getChatResourceCatalog(resourceType)
		.map((resource) => ({
			resource,
			score: scoreResource(resource, query, resourceType),
		}))
		.filter((entry) => !query || entry.score > 0)
		.sort(
			(a, b) =>
				b.score - a.score || a.resource.name.localeCompare(b.resource.name),
		)
		.filter((entry, index, entries) => {
			if (!query) return true;
			const topScore = entries[0]?.score ?? 0;
			if (topScore <= 0) return false;
			const cutoff = Math.max(20, Math.round(topScore * 0.65));
			return entry.score >= cutoff || index === 0;
		})
		.slice(0, limit)
		.map((entry) => entry.resource);
}

function findChatResourcesToAttach(args?: Record<string, unknown>) {
	const resourceType = getRequestedResourceType(args);
	const catalog = getChatResourceCatalog(resourceType);
	const ids = Array.isArray(args?.ids)
		? args.ids.map(normalizeSearchText).filter(Boolean)
		: [];
	const id = normalizeSearchText(args?.id);

	if (ids.length > 0 || id) {
		const requested = new Set([...ids, id].filter(Boolean));
		return catalog.filter((resource) =>
			requested.has(normalizeSearchText(resource.id)),
		);
	}

	const query = normalizeSearchText(args?.query ?? args?.name);
	if (!query) return [];

	const exactMatches = catalog.filter((resource) => {
		const normalizedName = normalizeSearchText(resource.name);
		const normalizedId = normalizeSearchText(resource.id);
		return normalizedName === query || normalizedId === query;
	});

	return exactMatches;
}

function toAttachment(resource: ChatResource): ComposerAsset {
	return {
		id: resource.id,
		name: resource.name,
		url: resource.url,
		thumbnailUrl: resource.thumbnailUrl,
		mimeType: resource.mimeType,
		kind: resource.kind,
		description: resource.description,
	};
}

function summarizeResource(resource: ChatResource) {
	return {
		id: resource.id,
		name: resource.name,
		type: resource.kind,
		description: resource.description,
	};
}

export function executeAppCapability(
	action: AppCapabilityAction,
): AppCapabilityResult {
	if (action.tool === "switch_workspace_tab") {
		const tab = action.args?.tab;
		if (!isWorkspaceTab(tab)) {
			return {
				tool: action.tool,
				ok: false,
				message: "Missing or invalid workspace tab.",
			};
		}

		switchWorkspaceView(tab);
		return {
			tool: action.tool,
			ok: true,
			message: `Switched workspace to ${tab}.`,
		};
	}

	if (action.tool === "search_chat_resources") {
		const matches = searchChatResources(action.args);
		const resourceType = getRequestedResourceType(action.args) ?? "all";
		const singleMatch = matches.length === 1 ? matches[0] : undefined;
		const { addAssetAttachment, setPendingResourceMatches } =
			useComposerStore.getState();

		if (singleMatch) {
			addAssetAttachment(toAttachment(singleMatch));
			setPendingResourceMatches([]);
		} else {
			setPendingResourceMatches(matches.map(toAttachment));
		}

		return {
			tool: action.tool,
			ok: true,
			message:
				matches.length > 0
					? singleMatch
						? `Found 1 ${resourceType} resource and attached it to the chat.`
						: `Found ${matches.length} ${resourceType} resources.`
					: `No ${resourceType} resources matched the search.`,
			data: {
				matches: matches.map(summarizeResource),
			},
		};
	}

	if (
		action.tool === "add_chat_resource" ||
		action.tool === "reference_chat_resource"
	) {
		const resources = findChatResourcesToAttach(action.args);
		if (resources.length === 0) {
			return {
				tool: action.tool,
				ok: false,
				message: "No matching chat resource was found.",
			};
		}

		const { addAssetAttachment, clearPendingResourceMatches } =
			useComposerStore.getState();
		for (const resource of resources) {
			addAssetAttachment(toAttachment(resource));
		}
		clearPendingResourceMatches();

		return {
			tool: action.tool,
			ok: true,
			message: `Added ${resources.length} resource${resources.length === 1 ? "" : "s"} to the chat composer.`,
			data: {
				attachments: resources.map(summarizeResource),
			},
		};
	}

	const title =
		typeof action.args?.title === "string" && action.args.title.trim()
			? action.args.title.trim()
			: "AI-created task";
	const description =
		typeof action.args?.description === "string"
			? action.args.description.trim()
			: "";
	const assignedToTeamMember =
		typeof action.args?.assignedToTeamMember === "string"
			? action.args.assignedToTeamMember.trim()
			: "";
	const dueDate =
		typeof action.args?.dueDate === "string" && action.args.dueDate.trim()
			? action.args.dueDate.trim()
			: defaultDueDate();

	useTaskStore
		.getState()
		.addTask(title, description, assignedToTeamMember, dueDate);
	switchWorkspaceView("actions");

	return {
		tool: action.tool,
		ok: true,
		message: `Created Kanban task "${title}" and opened Actions.`,
	};
}

export function executeAppCapabilities(
	actions: AppCapabilityAction[],
): AppCapabilityResult[] {
	return dedupeAppCapabilityActions(actions).map(executeAppCapability);
}

function getActionInput(action: AppCapabilityAction) {
	return {
		tool: action.tool,
		args: action.args ?? {},
	};
}

export function buildAppCapabilityToolParts(
	actions: AppCapabilityAction[],
	results: AppCapabilityResult[],
): MessageToolPart[] {
	return actions.map((action, index) => {
		const result = results[index];
		const callNumber = String(index + 1).padStart(3, "0");
		return {
			type: `mcp.app.${action.tool}`,
			state: result?.ok ? "output-available" : "output-error",
			toolCallId: `app-mcp-${callNumber}`,
			input: getActionInput(action),
			output: result
				? {
						ok: result.ok,
						message: result.message,
					}
				: undefined,
			errorText: result?.ok ? undefined : (result?.message ?? "Tool failed."),
		};
	});
}

export function buildAppCapabilityReasoning(
	actions: AppCapabilityAction[],
	results: AppCapabilityResult[],
) {
	if (actions.length === 0) return undefined;

	const toolLines = actions.map((action, index) => {
		const result = results[index];
		const status = result?.ok ? "completed" : "failed";
		return `- ${action.tool}: ${status} with \`${JSON.stringify(
			action.args ?? {},
		)}\``;
	});
	const resultLines = results.map(
		(result) => `- ${result.ok ? "OK" : "Error"}: ${result.message}`,
	);

	return [
		"### MCP app action trace",
		"",
		"- Parsed the response for supported app tool calls.",
		"- Validated each tool name and argument shape.",
		"- Executed app-safe UI actions only.",
		"",
		"### Tool calls",
		"",
		...toolLines,
		"",
		"### Results",
		"",
		...resultLines,
	].join("\n");
}
