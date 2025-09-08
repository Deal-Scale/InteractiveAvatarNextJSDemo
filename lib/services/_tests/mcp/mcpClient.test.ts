import { afterEach, describe, expect, it, vi } from "vitest";

// Mocks for MCP SDK
let lastTransportType: "http" | "stdio" | null = null;
let lastHttpUrl: string | null = null;

vi.mock("@modelcontextprotocol/sdk/client/streamableHttp.js", () => {
	class StreamableHTTPClientTransport {
		url: URL;
		constructor(url: URL) {
			this.url = url;
			lastTransportType = "http";
			lastHttpUrl = url.toString();
		}
	}

	return { StreamableHTTPClientTransport };
});

vi.mock("@modelcontextprotocol/sdk/client/stdio.js", () => {
	class StdioClientTransport {
		opts: Record<string, unknown>;
		constructor(opts: Record<string, unknown>) {
			this.opts = opts;
			lastTransportType = "stdio";
		}
	}

	return { StdioClientTransport };
});

// Capture the constructed client instance methods
interface Tool {
	name: string;
}
interface Resource {
	uri: string;
}
interface Prompt {
	name: string;
}
interface Message {
	content: string;
}

// Properly typed clientApi with all type parameters
const clientApi = {
	connect: vi.fn<[], Promise<void>>(() => Promise.resolve()),
	listTools: vi.fn<[], Promise<{ tools: Tool[] }>>(() =>
		Promise.resolve({ tools: [{ name: "mock-tool" }] }),
	),
	listResources: vi.fn<[], Promise<{ resources: Resource[] }>>(() =>
		Promise.resolve({ resources: [{ uri: "resource://mock" }] }),
	),
	listPrompts: vi.fn<[], Promise<{ prompts: Prompt[] }>>(() =>
		Promise.resolve({ prompts: [{ name: "mock-prompt" }] }),
	),
	getPrompt: vi.fn<[{ name: string }], Promise<{ messages: Message[] }>>(() =>
		Promise.resolve({ messages: [{ content: "" }] }),
	),
	readResource: vi.fn<[{ uri: string }], Promise<{ contents: unknown[] }>>(() =>
		Promise.resolve({ contents: [] }),
	),
	callTool: vi.fn<
		[{ name: string; arguments: Record<string, unknown> }],
		Promise<{ content: unknown[] }>
	>(() => Promise.resolve({ content: [] })),
	complete: vi.fn<[unknown], Promise<{ isCompleted: boolean }>>(() =>
		Promise.resolve({ isCompleted: true }),
	),
	close: vi.fn<[], Promise<void>>(() => Promise.resolve()),
};

vi.mock("@modelcontextprotocol/sdk/client/index.js", () => {
	class Client {
		name: string;
		version: string;
		constructor(opts: { name: string; version: string }) {
			this.name = opts.name;
			this.version = opts.version;
			// reset clientApi spies per construction
			Object.values(clientApi).forEach((fn) => {
				if (typeof (fn as any)?.mockReset === "function")
					(fn as any).mockReset();
			});
			clientApi.connect.mockResolvedValue(undefined);
		}
		connect = clientApi.connect;
		listTools = clientApi.listTools;
		listResources = clientApi.listResources;
		listPrompts = clientApi.listPrompts;
		getPrompt = clientApi.getPrompt;
		readResource = clientApi.readResource;
		callTool = clientApi.callTool;
		complete = clientApi.complete;
		close = clientApi.close;
	}

	return { Client };
});

// Helper to import fresh module with current env
async function importFreshClient() {
	// Clear module cache
	const modPath = "@/lib/services/mcpClient";
	delete require.cache[require.resolve(modPath)];

	// Return fresh module
	return await import(modPath);
}

// Ensure we reset state between tests
afterEach(async () => {
	delete process.env.MCP_SERVER_URL;
	delete process.env.MCP_STDIO_ARGS;
	delete process.env.MCP_STDIO_COMMAND;
	delete process.env.REGISTRY_URL;
	lastTransportType = null;
	lastHttpUrl = null;
	// Close any existing client
	const { mcpClient } = await importFreshClient();

	await mcpClient.close();
});

describe("mcpClient transport selection", () => {
	it("uses HTTP transport when MCP_SERVER_URL is set", async () => {
		process.env.MCP_SERVER_URL = "http://localhost:8000/mcp";
		const { mcpClient } = await importFreshClient();

		await mcpClient.connect(); // Ensure connection is established
		const res = await mcpClient.listTools();

		expect(res.tools[0].name).toBe("mock-tool");
		expect(lastTransportType).toBe("http");
		expect(lastHttpUrl).toBe("http://localhost:8000/mcp");
	});

	it("falls back to stdio when MCP_SERVER_URL is not set", async () => {
		const { mcpClient } = await importFreshClient();

		const res = await mcpClient.listResources();

		expect(res.resources[0].uri).toBe("resource://mock");
		expect(lastTransportType).toBe("stdio");
	});
});

describe("mcpClient method passthroughs", () => {
	it("calls tools with provided args", async () => {
		process.env.MCP_SERVER_URL = "http://localhost:8000/mcp";
		const { mcpClient } = await importFreshClient();

		await mcpClient.callTool("do_it", { a: 1 });
		expect(clientApi.callTool).toHaveBeenCalledWith({
			name: "do_it",
			arguments: { a: 1 },
		});
	});

	it("reads resource with given uri", async () => {
		const { mcpClient } = await importFreshClient();

		await mcpClient.readResource("resource://x");
		expect(clientApi.readResource).toHaveBeenCalledWith({
			uri: "resource://x",
		});
	});

	it("completes with context arguments as strings record", async () => {
		const { mcpClient } = await importFreshClient();

		await mcpClient.complete({
			ref: { type: "ref/prompt", name: "p" },
			argument: { name: "arg", value: "va" },
			context: { arguments: { x: "y" } },
		});
		expect(clientApi.complete).toHaveBeenCalled();
	});
});
