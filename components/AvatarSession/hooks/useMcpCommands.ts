import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";
import {
	type AppCapabilityName,
	buildAppCapabilityReasoning,
	buildAppCapabilityToolParts,
	executeAppCapability,
	type WorkspaceTab,
} from "@/lib/app-capabilities";
import {
	fetchMcpPrompts,
	fetchMcpResources,
	fetchMcpTools,
	postMcpComplete,
	postMcpPrompt,
	postMcpResource,
	postMcpTool,
} from "@/lib/services/mcp/query";
import { type Message, MessageSender } from "@/lib/types";

import { formatAsCodeBlock, parseJsonArgs } from "../utils/format";

const buildMessage = (
	content: string,
	patch: Partial<Message> = {},
): Message => ({
	id: nanoid(),
	sender: MessageSender.AVATAR,
	content,
	provider: "mcp",
	...patch,
});

function buildAppToolMessage(action: {
	tool: AppCapabilityName;
	args?: Record<string, unknown>;
}) {
	const result = executeAppCapability(action);
	const toolParts = buildAppCapabilityToolParts([action], [result]);
	return buildMessage(result.message, {
		toolParts,
		reasoning: buildAppCapabilityReasoning([action], [result]),
		reasoningMarkdown: true,
		reasoningOpen: true,
	});
}

function buildMcpToolMessage(args: {
	content: string;
	type: string;
	input?: Record<string, unknown>;
	output?: Record<string, unknown>;
}) {
	return buildMessage(args.content, {
		toolParts: [
			{
				type: args.type,
				state: "output-available",
				toolCallId: `mcp-${nanoid(8)}`,
				input: args.input,
				output: args.output,
			},
		],
		reasoning: [
			"### MCP tool trace",
			"",
			"- Parsed the slash command and JSON arguments.",
			"- Invoked the requested MCP endpoint.",
			"- Rendered the returned data in the chat response.",
		].join("\n"),
		reasoningMarkdown: true,
	});
}

function buildMcpErrorMessage(raw: string, error: unknown) {
	const message = (error as Error)?.message ?? "unknown";
	return buildMessage(`MCP error: ${message}`, {
		toolParts: [
			{
				type: "mcp.command",
				state: "output-error",
				toolCallId: `mcp-${nanoid(8)}`,
				input: { command: raw },
				errorText: message,
			},
		],
		reasoning: [
			"### MCP tool trace",
			"",
			"- Parsed the slash command.",
			"- Attempted to invoke the requested MCP action.",
			"- The call failed and the error is shown in the tool details.",
		].join("\n"),
		reasoningMarkdown: true,
		reasoningOpen: true,
	});
}

function parseAppArgs(raw: string) {
	return parseJsonArgs(raw) ?? {};
}

export function useMcpCommands() {
	const handleMcpCommand = useMemoizedFn(
		async (raw: string): Promise<Message[]> => {
			const parts = raw.trim().split(/\s+/).slice(1); // drop '/mcp'
			const sub = (parts[0] || "").toLowerCase();
			const responses: Message[] = [];

			try {
				switch (sub) {
					case "app": {
						const appSub = (parts[1] || "").toLowerCase();
						if (appSub === "tools" || appSub === "capabilities") {
							responses.push(
								buildMessage(
									[
										"App MCP capabilities:",
										"- /mcp app tab brain|data|actions|video",
										'- /mcp app task {"title":"Follow up","description":"Details","dueDate":"2026-05-25"}',
										'- /mcp app tool switch_workspace_tab {"tab":"data"}',
										'- /mcp app tool create_kanban_task {"title":"Task"}',
									].join("\n"),
								),
							);
							break;
						}

						if (appSub === "tab") {
							const tab = parts[2] as WorkspaceTab | undefined;
							responses.push(
								buildAppToolMessage({
									tool: "switch_workspace_tab",
									args: { tab },
								}),
							);
							break;
						}

						if (appSub === "task") {
							const args = parseAppArgs(parts.slice(2).join(" "));
							responses.push(
								buildAppToolMessage({
									tool: "create_kanban_task",
									args,
								}),
							);
							break;
						}

						if (appSub === "tool") {
							const tool = parts[2] as AppCapabilityName | undefined;
							const args = parseAppArgs(parts.slice(3).join(" "));
							if (
								tool !== "switch_workspace_tab" &&
								tool !== "create_kanban_task"
							) {
								responses.push(
									buildMessage(
										"Usage: /mcp app tool <switch_workspace_tab|create_kanban_task> {jsonArgs}",
									),
								);
								break;
							}
							responses.push(buildAppToolMessage({ tool, args }));
							break;
						}

						responses.push(
							buildMessage(
								"Usage: /mcp app tools | /mcp app tab <tab> | /mcp app task {jsonArgs}",
							),
						);
						break;
					}
					case "tools": {
						const data = await fetchMcpTools();
						const list = (data?.tools || [])
							.map((t: any) => `• ${t.name}`)
							.join("\n");

						responses.push(
							buildMcpToolMessage({
								content: list || "No tools available.",
								type: "mcp.tools.list",
								output: data,
							}),
						);
						break;
					}
					case "prompts": {
						const data = await fetchMcpPrompts();
						const list = (data?.prompts || [])
							.map((p: any) => `• ${p.name}`)
							.join("\n");

						responses.push(
							buildMcpToolMessage({
								content: list || "No prompts available.",
								type: "mcp.prompts.list",
								output: data,
							}),
						);
						break;
					}
					case "resources": {
						const data = await fetchMcpResources();
						const list = (data?.resources || [])
							.map((r: any) => `• ${r.uri}`)
							.join("\n");

						responses.push(
							buildMcpToolMessage({
								content: list || "No resources available.",
								type: "mcp.resources.list",
								output: data,
							}),
						);
						break;
					}
					case "tool": {
						const name = parts[1];
						const args = parseJsonArgs(parts.slice(2).join(" "));

						if (!name) {
							responses.push(
								buildMessage("Usage: /mcp tool <name> {jsonArgs}"),
							);
							break;
						}
						const data = await postMcpTool(name, args ?? {});

						responses.push(
							buildMcpToolMessage({
								content: formatAsCodeBlock(data),
								type: `mcp.tool.${name}`,
								input: args ?? {},
								output: data,
							}),
						);
						break;
					}
					case "resource": {
						const uri = parts[1];

						if (!uri) {
							responses.push(buildMessage("Usage: /mcp resource <uri>"));
							break;
						}
						const data = await postMcpResource(uri);

						responses.push(
							buildMcpToolMessage({
								content: formatAsCodeBlock(data),
								type: "mcp.resource.read",
								input: { uri },
								output: data,
							}),
						);
						break;
					}
					case "prompt": {
						const name = parts[1];
						const args = parseJsonArgs(parts.slice(2).join(" "));

						if (!name) {
							responses.push(
								buildMessage("Usage: /mcp prompt <name> {jsonArgs}"),
							);
							break;
						}
						const data = await postMcpPrompt(name, args ?? {});

						responses.push(
							buildMcpToolMessage({
								content: formatAsCodeBlock(data),
								type: `mcp.prompt.${name}`,
								input: args ?? {},
								output: data,
							}),
						);
						break;
					}
					case "complete": {
						const payload = parseJsonArgs(parts.slice(1).join(" "));

						if (!payload) {
							responses.push(
								buildMessage(
									'Usage: /mcp complete {"ref":{...},"argument":{...},"context":{...}}',
								),
							);
							break;
						}
						const data = await postMcpComplete(payload);

						responses.push(
							buildMcpToolMessage({
								content: formatAsCodeBlock(data),
								type: "mcp.complete",
								input: payload,
								output: data,
							}),
						);
						break;
					}
					default: {
						responses.push(
							buildMessage(
								[
									"MCP commands:",
									"• /mcp tools",
									"• /mcp prompts",
									"• /mcp resources",
									"• /mcp tool <name> {jsonArgs}",
									"• /mcp resource <uri>",
									"• /mcp prompt <name> {jsonArgs}",
									"• /mcp complete {json}",
									"• /mcp app tools",
									"• /mcp app tab brain|data|actions|video",
									'• /mcp app task {"title":"Task"}',
								].join("\n"),
							),
						);
					}
				}
			} catch (err) {
				console.error("[Chat] MCP command error", err);
				responses.push(buildMcpErrorMessage(raw, err));
			}

			return responses;
		},
	);

	return handleMcpCommand;
}
