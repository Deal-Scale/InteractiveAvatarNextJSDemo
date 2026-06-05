import type { AgentConfig } from "@/lib/schemas/agent";

const BUILTIN_AGENT_STARTERS: Record<string, string[]> = {
	"agent-1": [
		"Find warm leads and draft a short follow-up sequence.",
		"Summarize the best next step for this prospect.",
		"Create a concise follow-up message for this lead.",
	],
	"agent-2": [
		"Summarize this customer issue and suggest the next support step.",
		"Draft a clear response and mention any follow-up needed.",
		"Turn this into a short support ticket summary.",
	],
	"agent-3": [
		"Analyze the latest chat and create a dashboard insight.",
		"Turn this thread into action items and key takeaways.",
		"Extract the most important metrics from this conversation.",
	],
};

export function resolveConversationStarters(
	agent: Pick<AgentConfig, "id" | "promptStarter" | "conversationStarters">,
): string[] {
	const builtIn = BUILTIN_AGENT_STARTERS[agent.id];
	if (builtIn?.length) return builtIn;

	const starters = (agent.conversationStarters ?? [])
		.map((starter) => String(starter).trim())
		.filter(Boolean);
	if (starters.length > 0) return starters;

	const promptStarter = agent.promptStarter?.trim();
	return promptStarter ? [promptStarter] : [];
}
