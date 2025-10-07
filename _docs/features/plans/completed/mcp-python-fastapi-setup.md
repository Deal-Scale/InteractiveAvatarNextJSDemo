# Using the Next.js MCP Client with a Python FastMCP Server

This guide explains how to connect this app's MCP client (`lib/services/mcpClient.ts`) to your Python FastAPI + FastMCP server (e.g., `lightspeed_mcp`).

## Prerequisites
- Node.js 18+
- pnpm installed
- Python 3.9+
- A running FastAPI/FastMCP server that exposes an MCP Streamable HTTP endpoint (e.g., `http://localhost:8000/mcp`).

## 1) Start your Python MCP server
Follow your server repo instructions. Example (Docker):
```bash
# inside your Python server repo
docker build -t mcp-server -f app/mcp_server/docker/Dockerfile .
docker run -d -p 8000:8000 --name mcp-server mcp-server
```
Or via Python directly:
```bash
python model_context_protocol/server.py
# ensure it serves MCP over HTTP at /mcp, e.g. http://localhost:8000/mcp
```

## 2) Point the Next.js app to your MCP server
Create or update `.env.local` at the project root:
```bash
MCP_SERVER_URL=http://localhost:8000/mcp
```
Notes:
- If `MCP_SERVER_URL` is set, the client uses Streamable HTTP transport.
- If it is not set, it falls back to the stdio prompt‑kit registry using `npx -y shadcn@canary registry:mcp` with `REGISTRY_URL` defaulting to `https://www.prompt-kit.com/c/registry.json`.

Optional overrides for the fallback stdio mode:
```bash
MCP_STDIO_COMMAND=npx
MCP_STDIO_ARGS=-y shadcn@canary registry:mcp
REGISTRY_URL=https://www.prompt-kit.com/c/registry.json
```

## 3) Start the Next.js app
```bash
pnpm install
pnpm dev
```

## 4) Verify connectivity
Hit these test endpoints the app provides:
- GET `http://localhost:3000/api/mcp/tools` — lists tools
- GET `http://localhost:3000/api/mcp/resources` — lists resources
- GET `http://localhost:3000/api/mcp/prompts` — lists prompts

If your Python server is up and `MCP_SERVER_URL` is correct, you should see JSON with your server's registered tools/resources/prompts.

## 5) Where the client is implemented
- `lib/services/mcpClient.ts`
  - Uses `StreamableHTTPClientTransport` when `MCP_SERVER_URL` is present.
  - Otherwise uses `StdioClientTransport` that mirrors `.cursor/mcp.json`.
  - Exposes:
    - `listTools()`, `listResources()`, `listPrompts()`
    - `getPrompt(name, args)`
    - `readResource(uri)`
    - `callTool(name, args)`
    - `complete({ ref, argument, context })`

## 6) Calling tools/resources from your own code
Example (server-side in a Next.js Route Handler):
```ts
import { NextResponse } from "next/server";
import { mcpClient } from "@/lib/services/mcpClient";

export async function POST(req: Request) {
  const { name, args } = await req.json();
  const result = await mcpClient.callTool(name, args);
  return NextResponse.json(result);
}
```

## 7) CORS and headers
- These example routes run server-to-server (Next API → Python MCP server), so CORS is typically not needed.
- If you call the Python MCP endpoint directly from the browser, ensure your FastAPI CORS config allows required headers such as `Mcp-Session-Id`.

## 8) Troubleshooting
- Empty lists: Confirm the Python server has registered tools/resources/prompts and the MCP route is `/mcp`.
- Connection errors: Check `.env.local` `MCP_SERVER_URL` and that the server is reachable from the Next app's environment.
- Stdio fallback issues: Ensure `npx` is available. You can customize `MCP_STDIO_COMMAND` and `MCP_STDIO_ARGS` if needed.

## 9) Next steps
- Wire tool invocations into chat flow and render results alongside messages.
- Use `message.sources` to display source chips when MCP tools return URLs.
- Add POST endpoints for invoking specific tools or reading resources with parameters.
