import { useTaskStore } from "@/lib/stores/taskActions";
import type { MessageToolPart } from "@/lib/types";
import { switchWorkspaceView } from "./workspace-view";

export type WorkspaceTab = "video" | "brain" | "data" | "actions";

export type AppCapabilityName = "switch_workspace_tab" | "create_kanban_task";

export type AppCapabilityAction = {
	tool: AppCapabilityName;
	args?: Record<string, unknown>;
};

export type AppCapabilityResult = {
	tool: AppCapabilityName;
	ok: boolean;
	message: string;
};

const APP_ACTION_BLOCK_RE =
	/```(?:app-action|app_action|app-actions|app_actions)\s*([\s\S]*?)```/gi;
const FENCED_CODE_BLOCK_RE = /```([a-zA-Z_-]+)?\s*([\s\S]*?)```/g;

export const APP_CAPABILITIES_SYSTEM_PROMPT = [
	"App capabilities are available through structured app-action blocks.",
	"When the user asks to switch workspace tabs, navigate Brain/Data/Actions, or create Kanban tasks, include a fenced app-action block and a short user-facing response.",
	"Use only these tools:",
	'1. switch_workspace_tab: {"tool":"switch_workspace_tab","args":{"tab":"brain|data|actions|video"}}',
	'2. create_kanban_task: {"tool":"create_kanban_task","args":{"title":"Task title","description":"Task details","dueDate":"YYYY-MM-DD","assignedToTeamMember":"optional","priority":"low|medium|high"}}',
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

	if (tool !== "switch_workspace_tab" && tool !== "create_kanban_task") {
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
