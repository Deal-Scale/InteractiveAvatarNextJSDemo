import {
	closeAgentCreateModalAndShowSection,
	openAgentCreateModal,
	openSidebarSection,
	prepareAgentModalTarget,
	prepareAgentMonetizationSummary,
	prepareAgentTextVoiceMode,
	prepareAgentVideoMode,
} from "../tourHelpers";
import type { TourDefinition } from "../tourTypes";

export const agentsTour: TourDefinition = {
	id: "agents",
	title: "Agents",
	description: "Create text, voice, or video agents and use them in chat.",
	steps: [
		{
			target: '[data-tour="agents"]',
			content:
				"Agents live in the sidebar with badges for abilities and modalities.",
			placement: "right",
			skipBeacon: true,
			before: () => openSidebarSection("agents"),
		},
		{
			target: '[data-tour="agent-create"]',
			content: "Create a new agent from the Agents section.",
			placement: "right",
			before: () => openSidebarSection("agents"),
		},
		{
			target: '[data-tour="agent-chat-type"]',
			content:
				"Text and Voice can be selected together. Video is exclusive and uses LiveAvatar options.",
			blockTargetInteraction: false,
			placement: "center",
			before: openAgentCreateModal,
		},
		{
			target: '[data-tour="agent-section-profile"]',
			content:
				"Profile defines the agent name, role, avatar image, tags, and interaction modes shown in the sidebar.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				prepareAgentModalTarget('[data-tour="agent-section-profile"]'),
		},
		{
			target: '[data-tour="agent-section-context"]',
			content:
				"Context controls the text provider, model, knowledge base, uploaded files, system prompt, and permissions like web browsing, code execution, and image generation.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				prepareAgentModalTarget('[data-tour="agent-section-context"]'),
		},
		{
			target: '[data-tour="agent-section-voice"]',
			content:
				"Voice settings appear for voice-capable agents and change based on the selected provider, including provider-specific advanced controls.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				prepareAgentTextVoiceMode('[data-tour="agent-section-voice"]'),
		},
		{
			target: '[data-tour="agent-section-video"]',
			content:
				"Video mode is exclusive. It reveals LiveAvatar fields such as avatar, video voice, quality, idle timeout, STT, video, and audio settings.",
			blockTargetInteraction: false,
			placement: "center",
			before: prepareAgentVideoMode,
		},
		{
			target: '[data-tour="agent-section-tools"]',
			content:
				"Tools selects MCP servers for the agent. Use these badges to grant API, OAuth, file, or automation capabilities.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				prepareAgentModalTarget('[data-tour="agent-section-tools"]'),
		},
		{
			target: '[data-tour="agent-section-monetization"]',
			content:
				"Monetization is optional. Enable it only when the agent should publish pricing and become eligible for payouts.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				prepareAgentModalTarget('[data-tour="agent-section-monetization"]'),
		},
		{
			target: '[data-tour="agent-monetization-summary"]',
			content:
				"When monetization is enabled, this card explains the base rate, multiplier, estimated payout, recommended monthly sessions, response length, and success metric.",
			blockTargetInteraction: false,
			placement: "center",
			before: prepareAgentMonetizationSummary,
		},
		{
			target: '[data-tour="agents"]',
			content:
				"Created agents appear here with badges for abilities, modalities, and MCP tool access.",
			placement: "right",
			before: closeAgentCreateModalAndShowSection,
		},
	],
};
