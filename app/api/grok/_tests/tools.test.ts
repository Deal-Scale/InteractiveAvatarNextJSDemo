import { describe, expect, it } from "vitest";

import {
	createTool,
	createDynamicTool,
	createToolRegistry,
} from "@/app/api/grok/sdk/tools";
import {
	createProviderRegistry,
	createCustomProvider,
} from "@/app/api/grok/sdk/providers";

import { z } from "zod";

describe("tool registry", () => {
	it("registers tools with validation schemas", () => {
		const registry = createToolRegistry();
		const echo = createTool({
			name: "echo",
			description: "Echo text",
			schema: z.object({ message: z.string() }),
			handler: async ({ message }) => message,
		});

		registry.register(echo);

		expect(registry.list()).toHaveLength(1);
	});

	it("supports dynamic tools", async () => {
		const dynamic = createDynamicTool({
			name: "dyn",
			description: "Dynamic tool",
			schema: z.object({ value: z.number() }),
			resolver: async () => ({
				name: "dyn",
				description: "Dynamic tool",
				schema: z.object({ value: z.number() }),
				handler: async ({ value }) => value * 2,
			}),
		});

		const resolved = await dynamic.resolve();
		expect(await resolved.handler({ value: 2 })).toBe(4);
	});
});

describe("provider registry", () => {
	it("registers providers", () => {
		const registry = createProviderRegistry();
		const custom = createCustomProvider({
			name: "grok",
			baseUrl: "https://api.test",
			models: ["grok-1"],
		});

		registry.register(custom);

		expect(registry.find("grok")).toEqual(custom);
	});
});
