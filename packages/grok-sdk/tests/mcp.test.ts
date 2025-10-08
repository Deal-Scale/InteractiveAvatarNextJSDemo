import { describe, expect, it, vi } from "vitest";

import {
	experimental_createMCPClient,
	Experimental_StdioMCPTransport,
} from "grok-sdk/mcp";

describe("MCP client", () => {
	it("sends requests using transport", async () => {
		const transport = {
			send: vi.fn().mockResolvedValue({ result: "ok" }),
			close: vi.fn(),
		} satisfies Experimental_StdioMCPTransport;

		const client = experimental_createMCPClient({ transport });
		const response = await client.send({ type: "ping" });

		expect(response).toEqual({ result: "ok" });
		expect(transport.send).toHaveBeenCalledWith({ type: "ping" });
	});
});
