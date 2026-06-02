import { describe, expect, it } from "vitest";
import { buildAgentChainInstruction } from "@/lib/agent-chain";

describe("buildAgentChainInstruction", () => {
	it("returns an empty instruction for zero or one agent", () => {
		expect(buildAgentChainInstruction([])).toBe("");
		expect(
			buildAgentChainInstruction([
				{ id: "agent-1", name: "Sales Assistant", kind: "agent" },
			] as any),
		).toBe("");
	});

	it("builds an ordered multi-agent instruction with descriptions and starters", () => {
		const instruction = buildAgentChainInstruction([
			{
				id: "agent-1",
				name: "Sales Assistant",
				kind: "agent",
				description: "Qualifies leads.",
				conversationStarters: ["Find warm leads."],
			},
			{
				id: "agent-2",
				name: "Support Bot",
				kind: "agent",
				description: "Handles support.",
				conversationStarters: ["Summarize the issue.", "Draft a response."],
			},
		] as any);

		expect(instruction).toContain("Multi-agent chain requested.");
		expect(instruction).toContain("1. Sales Assistant");
		expect(instruction).toContain("2. Support Bot");
		expect(instruction).toContain("Qualifies leads.");
		expect(instruction).toContain("Handles support.");
		expect(instruction).toContain("Conversation starters: Find warm leads.");
		expect(instruction).toContain(
			"Conversation starters: Summarize the issue. | Draft a response.",
		);
	});
});
