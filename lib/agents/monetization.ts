export type AgentUsageState = {
	label: string;
	value: string;
};

export type AgentUsageProfile = {
	id: string;
	label: string;
	description: string;
	baseAmount: number;
	currency: string;
	usageStates: AgentUsageState[];
};

type UsageProfileConfig = AgentUsageProfile & {
	keywords: string[];
};

const USAGE_PROFILES: UsageProfileConfig[] = [
	{
		id: "general",
		label: "General Purpose Agent",
		description:
			"Balanced assistants for onboarding, lightweight research, or concierge flows.",
		baseAmount: 25,
		currency: "USD",
		usageStates: [
			{ label: "Recommended monthly sessions", value: "Up to 1,000" },
			{ label: "Ideal response length", value: "1-2 minutes of dialog" },
			{ label: "Primary success metric", value: "Session completion rate" },
		],
		keywords: ["assistant", "general", "guide", "concierge"],
	},
	{
		id: "support",
		label: "Customer Support Agent",
		description:
			"Optimized for triage, troubleshooting, and quick customer hand-offs.",
		baseAmount: 22,
		currency: "USD",
		usageStates: [
			{ label: "Recommended monthly sessions", value: "Up to 2,500" },
			{ label: "Escalation target", value: "< 10% require live agent" },
			{ label: "Primary success metric", value: "First response resolution" },
		],
		keywords: ["support", "help", "success", "service", "cs", "customer"],
	},
	{
		id: "sales",
		label: "Revenue & Sales Agent",
		description:
			"Focused on prospecting, demos, and warm lead qualification workflows.",
		baseAmount: 32,
		currency: "USD",
		usageStates: [
			{ label: "Recommended monthly sessions", value: "Up to 600" },
			{ label: "Engagement goal", value: "3-5 minute interactive pitch" },
			{ label: "Primary success metric", value: "Qualified meetings set" },
		],
		keywords: ["sales", "revenue", "account", "closer", "pipeline", "growth"],
	},
	{
		id: "research",
		label: "Research & Insights Agent",
		description:
			"Great for summarization, analysis, and data-heavy decision support.",
		baseAmount: 28,
		currency: "USD",
		usageStates: [
			{ label: "Recommended monthly sessions", value: "Up to 900" },
			{ label: "Ideal response length", value: "2-4 minute deep dives" },
			{
				label: "Primary success metric",
				value: "Insights delivered per request",
			},
		],
		keywords: [
			"research",
			"analysis",
			"insight",
			"analytics",
			"data",
			"advisor",
		],
	},
];

const DEFAULT_PROFILE = USAGE_PROFILES[0];

export function getAgentUsageProfile(role?: string | null): AgentUsageProfile {
	if (!role) return DEFAULT_PROFILE;

	const normalized = role.toLowerCase();
	for (const profile of USAGE_PROFILES) {
		if (profile.keywords.some((keyword) => normalized.includes(keyword))) {
			return profile;
		}
	}

	return DEFAULT_PROFILE;
}

export function calculateMonetizedRate(
	baseAmount: number,
	multiplier: number,
): number {
	const total = baseAmount * multiplier;
	return Math.round(total * 100) / 100;
}
