import { nanoid } from "nanoid";
import { useMemoizedFn } from "ahooks";
import {
	fetchMcpTools,
	fetchMcpPrompts,
	fetchMcpResources,
	postMcpTool,
	postMcpResource,
	postMcpPrompt,
	postMcpComplete,
} from "@/lib/services/mcp/query";
import { MessageSender, type Message } from "@/lib/types";

import { formatAsCodeBlock, parseJsonArgs } from "../utils/format";

const buildMessage = (content: string): Message => ({
	id: nanoid(),
	sender: MessageSender.AVATAR,
	content,
	provider: "mcp",
});

export function useMcpCommands() {
	const handleMcpCommand = useMemoizedFn(
		async (raw: string): Promise<Message[]> => {
			const parts = raw.trim().split(/\s+/).slice(1); // drop '/mcp'
			const sub = (parts[0] || "").toLowerCase();
			const responses: Message[] = [];

			try {
				switch (sub) {
					case "tools": {
						const data = await fetchMcpTools();
						const list = (data?.tools || [])
							.map((t: any) => `• ${t.name}`)
							.join("\n");

						responses.push(buildMessage(list || "No tools available."));
						break;
					}
					case "prompts": {
						const data = await fetchMcpPrompts();
						const list = (data?.prompts || [])
							.map((p: any) => `• ${p.name}`)
							.join("\n");

						responses.push(buildMessage(list || "No prompts available."));
						break;
					}
					case "resources": {
						const data = await fetchMcpResources();
						const list = (data?.resources || [])
							.map((r: any) => `• ${r.uri}`)
							.join("\n");

						responses.push(buildMessage(list || "No resources available."));
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

						responses.push(buildMessage(formatAsCodeBlock(data)));
						break;
					}
					case "resource": {
						const uri = parts[1];

						if (!uri) {
							responses.push(buildMessage("Usage: /mcp resource <uri>"));
							break;
						}
						const data = await postMcpResource(uri);

						responses.push(buildMessage(formatAsCodeBlock(data)));
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

						responses.push(buildMessage(formatAsCodeBlock(data)));
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

						responses.push(buildMessage(formatAsCodeBlock(data)));
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
								].join("\n"),
							),
						);
					}
				}
			} catch (err) {
				console.error("[Chat] MCP command error", err);
				responses.push(
					buildMessage(`MCP error: ${(err as Error)?.message ?? "unknown"}`),
				);
			}

			return responses;
		},
	);

	return handleMcpCommand;
}
