import { mcpClient } from "../lib/services/mcp/client/mcpClient";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("MCP Server Connection", () => {
	beforeAll(async () => {
		console.log("Connecting to MCP server:", process.env.TEST_MCP_SERVER_URL);
		try {
			await mcpClient.connect();
			console.log("Successfully connected to MCP server");
		} catch (error) {
			console.error("Connection failed:", error);
			throw error;
		}
	}, 30000);

	afterAll(async () => {
		await mcpClient.close();
	});

	it("should successfully connect and list tools", async () => {
		const result = await mcpClient.listTools();
		expect(result).toHaveProperty("tools");
		expect(Array.isArray(result.tools)).toBe(true);
	}, 30000);
});
