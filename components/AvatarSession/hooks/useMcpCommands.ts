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

import { formatAsCodeBlock, parseJsonArgs } from "../utils/format";

export function useMcpCommands(addAvatarMessage: (content: string) => void) {
  const handleMcpCommand = useMemoizedFn(async (raw: string) => {
    const parts = raw.trim().split(/\s+/).slice(1); // drop '/mcp'
    const sub = (parts[0] || "").toLowerCase();

    try {
      switch (sub) {
        case "tools": {
          const data = await fetchMcpTools();
          const list = (data?.tools || [])
            .map((t: any) => `• ${t.name}`)
            .join("\n");

          addAvatarMessage(list || "No tools available.");
          break;
        }
        case "prompts": {
          const data = await fetchMcpPrompts();
          const list = (data?.prompts || [])
            .map((p: any) => `• ${p.name}`)
            .join("\n");

          addAvatarMessage(list || "No prompts available.");
          break;
        }
        case "resources": {
          const data = await fetchMcpResources();
          const list = (data?.resources || [])
            .map((r: any) => `• ${r.uri}`)
            .join("\n");

          addAvatarMessage(list || "No resources available.");
          break;
        }
        case "tool": {
          const name = parts[1];
          const args = parseJsonArgs(parts.slice(2).join(" "));

          if (!name) {
            addAvatarMessage("Usage: /mcp tool <name> {jsonArgs}");
            break;
          }
          const data = await postMcpTool(name, args ?? {});

          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "resource": {
          const uri = parts[1];

          if (!uri) {
            addAvatarMessage("Usage: /mcp resource <uri>");
            break;
          }
          const data = await postMcpResource(uri);

          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "prompt": {
          const name = parts[1];
          const args = parseJsonArgs(parts.slice(2).join(" "));

          if (!name) {
            addAvatarMessage("Usage: /mcp prompt <name> {jsonArgs}");
            break;
          }
          const data = await postMcpPrompt(name, args ?? {});

          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "complete": {
          const payload = parseJsonArgs(parts.slice(1).join(" "));

          if (!payload) {
            addAvatarMessage(
              'Usage: /mcp complete {"ref":{...},"argument":{...},"context":{...}}',
            );
            break;
          }
          const data = await postMcpComplete(payload);

          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        default: {
          addAvatarMessage(
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
          );
        }
      }
    } catch (err) {
      console.error("[Chat] MCP command error", err);
      addAvatarMessage("MCP error: " + (err as Error)?.message);
    }
  });

  return handleMcpCommand;
}
