import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/services/mcp/query", () => ({
	postMcpTool: vi.fn(),
	postMcpResource: vi.fn(),
}));

import {
	collectTaskMcpReferences,
	executeTaskMcpReferences,
} from "../mcpRuntime";
import { useSessionStore } from "@/lib/stores/session";
import { postMcpTool } from "@/lib/services/mcp/query";

const mockedPostMcpTool = vi.mocked(postMcpTool);

describe("collectTaskMcpReferences", () => {
	beforeEach(() => {
		useSessionStore.setState({
			toolConnections: {
				gdrive: {
					id: "tool-conn-gdrive",
					name: "Google Drive",
					connectedAt: Date.now(),
					authType: "oauth",
					config: {},
				},
			},
		});
		mockedPostMcpTool.mockReset();
	});

	afterEach(() => {
		mockedPostMcpTool.mockReset();
	});

	it("collects workflow tools and resources without duplicates", () => {
		const references = collectTaskMcpReferences({
			id: "task-1",
			title: "Run workflow",
			description:
				'Use [MCP:sms.send({"message":"hello"})] and [MCPRESOURCE:/docs/pricing-guide].',
			status: "TODO",
			mcpWorkflow: {
				id: "wf-1",
				title: "Reference test",
				prompts: [],
				functions: [
					{
						name: "sms.send",
						description: "Send SMS",
						signature: "sms.send(args)",
						exampleArgs: { message: "hello" },
					},
				],
				resources: [
					{
						uri: "/docs/pricing-guide",
						type: "markdown",
						description: "Pricing guide",
					},
				],
			},
		});

		expect(references).toEqual([
			{
				kind: "tool",
				name: "sms.send",
				input: { message: "hello" },
			},
			{
				kind: "resource",
				name: "/docs/pricing-guide",
			},
		]);
	});

	it("deduplicates repeated inline references", () => {
		const references = collectTaskMcpReferences({
			id: "task-2",
			title: "Run workflow",
			description:
				'[MCP:voice.call({"script":"hello"})] [MCP:voice.call({"script":"hello"})]',
			status: "TODO",
			mcpWorkflow: {
				id: "wf-2",
				title: "Duplicate test",
				prompts: [],
				functions: [],
				resources: [],
			},
		});

		expect(references).toEqual([
			{
				kind: "tool",
				name: "voice.call",
				input: { script: "hello" },
			},
		]);
	});

	it("infers workflow references from plain task text", () => {
		const references = collectTaskMcpReferences({
			id: "task-3",
			title: "Send a follow-up using the SMS workflow",
			description: "Use the pricing guide resource to confirm the response.",
			status: "TODO",
			mcpWorkflow: {
				id: "wf-3",
				title: "Sales follow-up",
				prompts: [],
				functions: [
					{
						name: "sms.send",
						description: "Send SMS follow-up",
						signature: "sms.send({ message })",
						exampleArgs: { message: "hello" },
					},
				],
				resources: [
					{
						uri: "/knowledge/pricing-guide",
						type: "markdown",
						description: "Pricing guide resource",
					},
				],
			},
		});

		expect(references).toEqual([
			{
				kind: "tool",
				name: "sms.send",
				input: { message: "hello" },
			},
			{
				kind: "resource",
				name: "/knowledge/pricing-guide",
			},
		]);
	});

	it("infers app catalog references from plain task text", () => {
		const references = collectTaskMcpReferences({
			id: "task-4",
			title: "Use the Sales Assistant with Google Drive",
			description:
				"Attach the Sales Assistant agent and the Google Drive connector.",
			status: "TODO",
			mcpWorkflow: {
				id: "wf-4",
				title: "App catalog test",
				prompts: [],
				functions: [],
				resources: [],
			},
		});

		expect(references).toEqual([
			{
				kind: "resource",
				name: "Sales Assistant",
				source: "app",
				connected: true,
			},
			{
				kind: "tool",
				name: "Google Drive",
				source: "app",
				toolName: "gdrive",
				connected: true,
			},
		]);
	});

	it("marks disconnected app tools without executing them", () => {
		useSessionStore.setState({ toolConnections: {} });

		const references = collectTaskMcpReferences({
			id: "task-5",
			title: "Use Google Drive for synced docs",
			description: "Use the synced docs from Google Drive.",
			status: "TODO",
			mcpWorkflow: {
				id: "wf-5",
				title: "Disconnected tool test",
				prompts: [],
				functions: [],
				resources: [],
			},
		});

		expect(references).toEqual([
			{
				kind: "tool",
				name: "Google Drive",
				source: "app",
				toolName: "gdrive",
				connected: false,
			},
		]);
	});

	it("executes connected app tools and skips disconnected ones", async () => {
		mockedPostMcpTool.mockResolvedValueOnce({ ok: true });

		const result = await executeTaskMcpReferences({
			id: "task-6",
			title: "Use Google Drive and Sales Assistant",
			description: "Review connected connectors during execution.",
			status: "TODO",
			mcpWorkflow: {
				id: "wf-6",
				title: "Connected tool execution test",
				prompts: [],
				functions: [],
				resources: [],
			},
		});

		expect(mockedPostMcpTool).toHaveBeenCalledWith("gdrive", {});
		expect(result.toolResults).toEqual([
			expect.objectContaining({
				name: "Google Drive",
				ok: true,
			}),
		]);
		expect(result.appResourceResults).toEqual([
			expect.objectContaining({
				kind: "app-resource",
				name: "Sales Assistant",
				connected: true,
			}),
		]);
	});
});
