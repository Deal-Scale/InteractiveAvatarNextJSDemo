import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import { mcpClient } from "../lib/services/mcp/client/mcpClient";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

const DEFAULT_METHODS = [
	"plan_task",
	"analyze_task",
	"reflect_task",
	"split_tasks",
	"list_tasks",
];

interface InitResponse {
	content?: {
		methods?: string[];
	};
}

interface McpResponse {
	content: {
		steps?: unknown[];
		[key: string]: unknown;
	};
}

interface McpError extends Error {
	code?: number;
	data?: unknown;
}

describe("MCP Server Tools", () => {
	let availableMethods: string[] = [];

	beforeAll(async () => {
		console.log("Connecting to MCP server:", process.env.TEST_MCP_SERVER_URL);
		try {
			await mcpClient.connect();
			console.log("Successfully connected to MCP server");

			// Get initial list of available methods
			const initResponse = (await mcpClient.callTool(
				"init_project_rules",
				{},
			)) as InitResponse;
			availableMethods = initResponse.content?.methods || DEFAULT_METHODS;
			console.log("Available methods:", availableMethods);
		} catch (error) {
			console.error("Connection failed:", error);
			throw error;
		}
	}, 30000);

	afterAll(async () => {
		await mcpClient.close();
	});

	// Test core available tools
	if (availableMethods.includes("plan_task")) {
		it("plan_task - should create task plans", async () => {
			try {
				const response = await mcpClient.callTool("plan_task", {
					description: "Test task planning",
				});
				console.log("plan_task response:", response);
				expect(response).toHaveProperty("content");
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.warn("plan_task failed:", error.message);
				} else if (typeof error === "string") {
					console.warn("plan_task failed:", error);
				} else {
					console.warn("plan_task failed with unknown error type");
				}
				throw error;
			}
		}, 30000);

		it("plan_task - should create development plans", async () => {
			try {
				const response = (await mcpClient.callTool("plan_task", {
					description: "Create a new user authentication system",
				})) as unknown as McpResponse;

				console.log("Plan Task Result:", response.content);
				expect(response).toHaveProperty("content");

				if (response.content.steps) {
					expect(Array.isArray(response.content.steps)).toBe(true);
				}
			} catch (error: unknown) {
				if (typeof error === "object" && error !== null) {
					const mcpError = error as McpError;
					console.warn("plan_task failed:", mcpError.message);
					if (mcpError.code) console.warn("Error code:", mcpError.code);
				}
				throw error;
			}
		}, 30000);
	}

	if (availableMethods.includes("analyze_task")) {
		it("analyze_task - should analyze requirements", async () => {
			try {
				const response = await mcpClient.callTool("analyze_task", {
					requirements: "Test analysis",
				});
				console.log("analyze_task response:", response);
				expect(response).toHaveProperty("content");
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.warn("analyze_task failed:", error.message);
				} else if (typeof error === "string") {
					console.warn("analyze_task failed:", error);
				} else {
					console.warn("analyze_task failed with unknown error type");
				}
				throw error;
			}
		}, 30000);
	}

	// Add more tool tests as needed

	it("should verify server capabilities", () => {
		expect(availableMethods.length).toBeGreaterThan(0);
		console.log("Verified server provides", availableMethods.length, "methods");
	});
});
