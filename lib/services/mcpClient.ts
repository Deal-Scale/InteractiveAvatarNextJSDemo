import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Coerce loose argument maps into the string-only records expected by MCP SDK
function toStringRecord(args: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  
  for (const [k, v] of Object.entries(args)) {
    if (v === undefined) continue;
    if (v === null) {
      out[k] = "null";
      continue;
    }
    switch (typeof v) {
      case "string":
        out[k] = v;
        break;
      case "number":
      case "boolean":
        out[k] = String(v);
        break;
      default:
        try {
          out[k] = JSON.stringify(v);
        } catch {
          out[k] = String(v as any);
        }
    }
  }

  return out;
}

/**
 * MCP Client (server-side only)
 *
 * Connects to the prompt-kit registry MCP server via stdio, mirroring .cursor/mcp.json.
 * Requires Node.js >= 18.
 */
class MCPClientWrapper {
  private client: Client | null = null;
  private connecting: Promise<Client> | null = null;

  async connect(): Promise<Client> {
    if (this.client) return this.client;
    if (this.connecting) return this.connecting;

    const client = new Client({
      name: "interactive-avatar-nextjs",
      version: "1.0.0",
    });

    // Prefer connecting to a remote/local MCP server over Streamable HTTP if MCP_SERVER_URL is set.
    // Example: MCP_SERVER_URL=http://localhost:8000/mcp
    const serverUrl = process.env.MCP_SERVER_URL;
    const useHttp = !!serverUrl;

    let transport: StreamableHTTPClientTransport | StdioClientTransport;

    if (useHttp) {
      transport = new StreamableHTTPClientTransport(
        new URL(serverUrl as string),
      );
    } else {
      const args = process.env.MCP_STDIO_ARGS?.split(" ") ?? [
        "-y",
        "shadcn@canary",
        "registry:mcp",
      ];

      // Build string-only env object
      const baseEnv = process.env as Record<string, string | undefined>;
      const env: Record<string, string> = {};

      for (const [k, v] of Object.entries(baseEnv)) {
        if (typeof v === "string") env[k] = v;
      }
      env.REGISTRY_URL =
        env.REGISTRY_URL ?? "https://www.prompt-kit.com/c/registry.json";

      transport = new StdioClientTransport({
        command: process.env.MCP_STDIO_COMMAND || "npx",
        args,
        env,
      });
    }

    this.connecting = (async () => {
      await client.connect(transport);
      this.client = client;
      this.connecting = null;

      return client;
    })();

    return this.connecting;
  }

  async ensure(): Promise<Client> {
    return this.connect();
  }

  async listTools() {
    const c = await this.ensure();

    return c.listTools();
  }

  async listResources() {
    const c = await this.ensure();

    return c.listResources();
  }

  async listPrompts() {
    const c = await this.ensure();

    return c.listPrompts();
  }

  async getPrompt(name: string, args?: Record<string, unknown>) {
    const c = await this.ensure();
    const stringArgs = args ? toStringRecord(args) : {};

    return c.getPrompt({ name, arguments: stringArgs });
  }

  async readResource(uri: string) {
    const c = await this.ensure();

    return c.readResource({ uri });
  }

  async callTool(name: string, args?: Record<string, unknown>) {
    const c = await this.ensure();
    const stringArgs = args ? toStringRecord(args) : {};

    return c.callTool({ name, arguments: stringArgs });
  }

  async complete(input: {
    ref:
      | { type: "ref/resource"; uri: string }
      | { type: "ref/prompt"; name: string };
    argument: { name: string; value: string };
    context?: { arguments?: Record<string, string> };
  }) {
    const c = await this.ensure();

    return c.complete(input as any);
  }

  async close() {
    if (this.client) {
      try {
        await this.client.close();
      } finally {
        this.client = null;
      }
    }
  }
}

export const mcpClient = new MCPClientWrapper();
