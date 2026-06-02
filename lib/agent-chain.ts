import type { MessageAsset } from "@/lib/types";

export function buildAgentChainInstruction(assets?: MessageAsset[]) {
	const chainAgents = (assets ?? [])
		.filter((asset) => asset.kind === "agent")
		.map((asset, index) => ({
			...asset,
			chainOrder: asset.chainOrder ?? index + 1,
		}))
		.sort((a, b) => (a.chainOrder ?? 0) - (b.chainOrder ?? 0));

	if (chainAgents.length <= 1) return "";

	const steps = chainAgents.map((agent, index) => {
		const starters = (agent.conversationStarters ?? []).slice(0, 3);
		const details: string[] = [];
		if (agent.description) details.push(agent.description);
		if (starters.length > 0) {
			details.push(`Conversation starters: ${starters.join(" | ")}`);
		}
		const suffix = details.length ? ` - ${details.join(" | ")}` : "";
		return `${index + 1}. ${agent.name}${suffix}`;
	});

	return [
		"Multi-agent chain requested.",
		"Process the user's prompt through these agents in order.",
		"Respect each agent's role and combine the final answer into one coherent response.",
		"Chain order:",
		...steps,
	].join("\n");
}
