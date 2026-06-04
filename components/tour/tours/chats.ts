import {
	openBottomChatPanel,
	openMermaidActionsMenu,
	openSidebar,
	openSlashCommandMenu,
	prepareChatTourTarget,
} from "../tourHelpers";
import type { TourDefinition } from "../tourTypes";

export const chatsTour: TourDefinition = {
	id: "chats",
	title: "Chats",
	description:
		"Use chat panels, slash commands, votes, branching, and previews.",
	steps: [
		{
			target: '[data-tour="new-chat"]',
			content: "Start a fresh chat from the sidebar.",
			placement: "right",
			skipBeacon: true,
			before: openSidebar,
		},
		{
			target: '[data-tour="chat-input"]',
			content:
				"The bottom chat panel is open and ready. This composer is where you send text chat without starting an avatar session.",
			placement: "top",
			before: openBottomChatPanel,
		},
		{
			target: '[data-tour="slash-command-item"]',
			content: "Type messages here. Press `/` or Alt+/ to open commands.",
			placement: "top",
			before: openBottomChatPanel,
		},
		{
			target: '[data-tour="slash-command-menu"]',
			content:
				"Slash commands can add knowledge bases, connect tools, create tasks, and add visual outputs.",
			placement: "top",
			before: openSlashCommandMenu,
		},
		{
			target: '[data-tour="message-restream"]',
			content:
				"Use Retry to regenerate a response from the prior user message.",
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-restream"]'),
		},
		{
			target: '[data-tour="message-copy"]',
			content: "Copy response text from the action toolbar.",
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-copy"]'),
		},
		{
			target: '[data-tour="message-upvote"]',
			content: "Upvote useful responses so the interaction is recorded.",
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-upvote"]'),
		},
		{
			target: '[data-tour="message-downvote"]',
			content: "Downvote weak responses to capture feedback.",
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-downvote"]'),
		},
		{
			target: '[data-tour="message-branch-agent"]',
			content:
				"Branch or restream a response to another agent when you need a different specialist.",
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-branch-agent"]'),
		},
		{
			target: '[data-tour="message-speak"]',
			content:
				"Click the speaker button to hear an assistant chat bubble read aloud.",
			blockTargetInteraction: false,
			placement: "bottom",
			before: () => prepareChatTourTarget('[data-tour="message-speak"]'),
		},
		{
			target: '[data-tour="mermaid-actions"]',
			content:
				"Mermaid chart actions let you view this example diagram, reload it, copy it, or add it to the Data grid.",
			placement: "top",
			before: () => prepareChatTourTarget('[data-tour="mermaid-actions"]'),
		},
		{
			target: '[data-tour="mermaid-add-to-grid"]',
			content: "Choose Add to Grid to send this Mermaid chart to the Data tab.",
			blockTargetInteraction: false,
			placement: "left",
			before: openMermaidActionsMenu,
		},
	],
};
