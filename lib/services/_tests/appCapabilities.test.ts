import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTaskStore } from "@/lib/stores/taskActions";
import {
	APP_CAPABILITIES_SYSTEM_PROMPT,
	executeAppCapabilities,
	parseAppCapabilityActions,
	stripAppCapabilityBlocks,
} from "@/lib/app-capabilities";
import { PollinationsAdapter } from "@/lib/providers/PollinationsAdapter";
import { useComposerStore } from "@/lib/stores/composer";
import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";
import { COMPACT_BOTTOM_CHAT_HEIGHT_FRAC } from "../../workspace-view";

describe("app MCP capabilities", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		useSessionStore.setState((state) => ({
			...state,
			viewTab: "video",
			controlsMinimized: false,
			chatExperience: "basic",
		}));
		usePlacementStore.setState((state) => ({
			...state,
			dockMode: "right",
			bottomHeightFrac: 0,
			sidebarCollapsed: false,
		}));
		useTaskStore.setState((state) => ({
			...state,
			tasks: [],
			draggedTask: null,
		}));
		useComposerStore.setState({
			assetAttachments: [],
			pendingResourceMatches: [],
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("parses and executes tab switching app-action blocks", () => {
		const content = [
			"I'll open Data.",
			"```app-action",
			'{"tool":"switch_workspace_tab","args":{"tab":"data"}}',
			"```",
		].join("\n");

		const actions = parseAppCapabilityActions(content);
		const results = executeAppCapabilities(actions);

		expect(actions).toEqual([
			{ tool: "switch_workspace_tab", args: { tab: "data" } },
		]);
		expect(results[0]?.ok).toBe(true);
		expect(useSessionStore.getState().viewTab).toBe("data");
		expect(useSessionStore.getState().controlsMinimized).toBe(true);
		expect(usePlacementStore.getState()).toMatchObject({
			dockMode: "bottom",
			bottomHeightFrac: COMPACT_BOTTOM_CHAT_HEIGHT_FRAC,
			sidebarCollapsed: true,
		});
		expect(stripAppCapabilityBlocks(content)).toBe("I'll open Data.");
	});

	it("creates Kanban tasks and opens the Actions tab", () => {
		const actions = parseAppCapabilityActions(
			[
				"```app-action",
				JSON.stringify({
					tool: "create_kanban_task",
					args: {
						title: "Follow up with lead",
						description: "Send a pricing recap and book a call.",
						dueDate: "2026-05-25",
						assignedToTeamMember: "Ty",
					},
				}),
				"```",
			].join("\n"),
		);

		const results = executeAppCapabilities(actions);
		const state = useTaskStore.getState();

		expect(results[0]?.ok).toBe(true);
		expect(useSessionStore.getState().viewTab).toBe("actions");
		expect(state.tasks).toHaveLength(1);
		expect(state.tasks[0]).toMatchObject({
			title: "Follow up with lead",
			description: "Send a pricing recap and book a call.",
			dueDate: "2026-05-25",
			assignedToTeamMember: "Ty",
			status: "TODO",
		});
	});

	it("executes plain JSON action arrays returned as markdown content", () => {
		const content = [
			JSON.stringify(
				[
					{
						tool: "create_kanban_task",
						args: {
							title: "Follow up on MCP testing",
							description: "Follow up on MCP testing progress and results.",
							dueDate: "2026-05-25",
							priority: "medium",
						},
					},
					{
						tool: "switch_workspace_tab",
						args: {
							tab: "actions",
						},
					},
				],
				null,
				2,
			),
			"Created the Kanban task and opened the Actions workspace.",
		].join("\n\n");

		const actions = parseAppCapabilityActions(content);
		const results = executeAppCapabilities(actions);

		expect(actions).toHaveLength(2);
		expect(results.map((result) => result.ok)).toEqual([true, true]);
		expect(useSessionStore.getState().viewTab).toBe("actions");
		expect(useTaskStore.getState().tasks[0]).toMatchObject({
			title: "Follow up on MCP testing",
			description: "Follow up on MCP testing progress and results.",
			dueDate: "2026-05-25",
			status: "TODO",
		});
		expect(stripAppCapabilityBlocks(content)).toBe(
			"Created the Kanban task and opened the Actions workspace.",
		);
	});

	it("dedupes repeated create-task actions for the same task title", () => {
		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "create_kanban_task",
					args: {
						title: "Review Brain graph",
						description:
							"Review the Brain graph for accuracy, completeness, and next actions.",
						dueDate: "2026-05-25",
					},
				},
				{
					tool: "create_kanban_task",
					args: {
						title: "Review Brain graph",
					},
				},
				{
					tool: "switch_workspace_tab",
					args: {
						tab: "brain",
					},
				},
			]),
		);

		const results = executeAppCapabilities(actions);

		expect(actions).toHaveLength(2);
		expect(results.map((result) => result.ok)).toEqual([true, true]);
		expect(useTaskStore.getState().tasks).toHaveLength(1);
		expect(useTaskStore.getState().tasks[0]).toMatchObject({
			title: "Review Brain graph",
			description:
				"Review the Brain graph for accuracy, completeness, and next actions.",
			dueDate: "2026-05-25",
		});
		expect(useSessionStore.getState().viewTab).toBe("brain");
	});

	it("executes normal fenced json action arrays", () => {
		const content = [
			"```json",
			JSON.stringify([
				{
					tool: "switch_workspace_tab",
					args: { tab: "brain" },
				},
			]),
			"```",
			"Opening Brain.",
		].join("\n");

		const actions = parseAppCapabilityActions(content);
		const results = executeAppCapabilities(actions);

		expect(actions).toEqual([
			{ tool: "switch_workspace_tab", args: { tab: "brain" } },
		]);
		expect(results[0]?.ok).toBe(true);
		expect(useSessionStore.getState().viewTab).toBe("brain");
		expect(stripAppCapabilityBlocks(content)).toBe("Opening Brain.");
	});

	it("switches to avatar video state when opening the video tab", () => {
		const results = executeAppCapabilities([
			{ tool: "switch_workspace_tab", args: { tab: "video" } },
		]);

		expect(results[0]?.ok).toBe(true);
		expect(useSessionStore.getState()).toMatchObject({
			viewTab: "video",
			chatExperience: "avatar",
			controlsMinimized: true,
		});
		expect(usePlacementStore.getState()).toMatchObject({
			dockMode: "bottom",
			bottomHeightFrac: COMPACT_BOTTOM_CHAT_HEIGHT_FRAC,
			sidebarCollapsed: true,
		});
	});

	it("searches knowledge bases, agents, and assets for chat resources", () => {
		useSessionStore.setState((state) => ({
			...state,
			createdKnowledgeItems: [{ id: "kb-pricing", name: "Pricing Guide" }],
		}));

		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "search_chat_resources",
					args: { resourceType: "knowledge", query: "pricing" },
				},
				{
					tool: "search_chat_resources",
					args: { resourceType: "agent", query: "support" },
				},
				{
					tool: "search_chat_resources",
					args: { resourceType: "asset", query: "demo" },
				},
			]),
		);

		const results = executeAppCapabilities(actions);

		expect(results.map((result) => result.ok)).toEqual([true, true, true]);
		expect(results[0]?.data?.matches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "kb-pricing",
					name: "Pricing Guide",
					type: "knowledge",
				}),
			]),
		);
		expect(results[1]?.data?.matches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "agent-2",
					name: "Support Bot",
					type: "agent",
				}),
			]),
		);
		expect(results[2]?.data?.matches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "asset-1",
					name: "Demo Image",
					type: "asset",
				}),
			]),
		);
		expect(useComposerStore.getState().pendingResourceMatches).toEqual([]);
	});

	it("keeps exact asset searches focused on the matching asset", () => {
		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "search_chat_resources",
					args: {
						resourceType: "asset",
						query: "demo image",
						limit: 5,
					},
				},
			]),
		);

		const results = executeAppCapabilities(actions);

		expect(results[0]?.ok).toBe(true);
		expect(results[0]?.data?.matches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "asset-1",
					name: "Demo Image",
					type: "asset",
				}),
			]),
		);
		expect(results[0]?.data?.matches).toHaveLength(1);
		expect(useComposerStore.getState().assetAttachments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "asset-1",
					name: "Demo Image",
					kind: "asset",
				}),
			]),
		);
		expect(useComposerStore.getState().pendingResourceMatches).toEqual([]);
	});

	it("auto-attaches a single best search match to the chat composer", () => {
		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "search_chat_resources",
					args: {
						resourceType: "agent",
						query: "Sales assistant",
						limit: 5,
					},
				},
			]),
		);

		const results = executeAppCapabilities(actions);
		const attachments = useComposerStore.getState().assetAttachments;

		expect(results[0]?.ok).toBe(true);
		expect(results[0]?.message).toContain("attached it to the chat");
		expect(attachments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "agent-1",
					name: "Sales Assistant",
					kind: "agent",
				}),
			]),
		);
		expect(useComposerStore.getState().pendingResourceMatches).toEqual([]);
	});

	it("supports search followed by attach in a single multi-action block", () => {
		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "search_chat_resources",
					args: {
						resourceType: "agent",
						query: "Sales assistant",
						limit: 5,
					},
				},
				{
					tool: "add_chat_resource",
					args: {
						resourceType: "agent",
						id: "agent-1",
					},
				},
			]),
		);

		const results = executeAppCapabilities(actions);
		const attachments = useComposerStore.getState().assetAttachments;

		expect(actions).toHaveLength(2);
		expect(results.map((result) => result.ok)).toEqual([true, true]);
		expect(results[0]?.data?.matches).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "agent-1",
					name: "Sales Assistant",
					type: "agent",
				}),
			]),
		);
		expect(attachments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "agent-1",
					name: "Sales Assistant",
					kind: "agent",
				}),
			]),
		);
		expect(useComposerStore.getState().pendingResourceMatches).toEqual([]);
	});

	it("adds and references chat resources as composer attachments", () => {
		useSessionStore.setState((state) => ({
			...state,
			kbFolders: [{ id: "kb-folder-sales", name: "Sales" }],
		}));

		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "add_chat_resource",
					args: { resourceType: "knowledge", query: "Sales" },
				},
				{
					tool: "reference_chat_resource",
					args: { resourceType: "agent", id: "agent-1" },
				},
				{
					tool: "add_chat_resource",
					args: { resourceType: "asset", id: "asset-1" },
				},
			]),
		);

		const results = executeAppCapabilities(actions);
		const attachments = useComposerStore.getState().assetAttachments;

		expect(results.map((result) => result.ok)).toEqual([true, true, true]);
		expect(attachments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: "kb-folder-sales",
					name: "Sales",
					kind: "knowledge",
				}),
				expect.objectContaining({
					id: "agent-1",
					name: "Sales Assistant",
					kind: "agent",
				}),
				expect.objectContaining({
					id: "asset-1",
					name: "Demo Image",
					kind: "asset",
				}),
			]),
		);
	});

	it("does not guess a resource when add-chat-resource query is not an exact match", () => {
		const actions = parseAppCapabilityActions(
			JSON.stringify([
				{
					tool: "add_chat_resource",
					args: {
						resourceType: "knowledge",
						query: "pricing guide knowledge base",
					},
				},
			]),
		);

		const results = executeAppCapabilities(actions);

		expect(results[0]?.ok).toBe(false);
		expect(results[0]?.message).toBe("No matching chat resource was found.");
		expect(useComposerStore.getState().assetAttachments).toHaveLength(0);
		expect(useComposerStore.getState().pendingResourceMatches).toEqual([]);
	});

	it("passes app capability instructions through Pollinations and executes returned actions", async () => {
		const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
			const body = JSON.parse(String(init?.body));
			expect(body.messages[0]).toMatchObject({
				role: "system",
			});
			expect(body.messages[0].content).toContain(
				APP_CAPABILITIES_SYSTEM_PROMPT,
			);
			expect(body.messages.at(-1)).toMatchObject({
				role: "user",
				content: "open the brain tab",
			});

			return new Response(
				JSON.stringify({
					choices: [
						{
							message: {
								content: [
									"Opening Brain.",
									"```app-action",
									'{"tool":"switch_workspace_tab","args":{"tab":"brain"}}',
									"```",
								].join("\n"),
							},
						},
					],
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		});
		vi.stubGlobal("fetch", fetchMock);

		const response = await PollinationsAdapter.sendMessage({
			history: [],
			input: "open the brain tab",
			options: {
				systemPrompt: APP_CAPABILITIES_SYSTEM_PROMPT,
			},
		});

		const actions = parseAppCapabilityActions(response.content);
		const results = executeAppCapabilities(actions);

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/pollinations/text/chat-completion",
			expect.objectContaining({ method: "POST" }),
		);
		expect(results[0]?.message).toBe("Switched workspace to brain.");
		expect(useSessionStore.getState().viewTab).toBe("brain");
	});
});
