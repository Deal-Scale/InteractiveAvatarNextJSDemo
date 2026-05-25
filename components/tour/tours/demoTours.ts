import {
	openBottomChatPanel,
	openSidebar,
	openSidebarSection,
	prepareKanbanTarget,
	prepareTopPanelTarget,
} from "@/components/tour/tourHelpers";
import type { TourDefinition } from "@/components/tour/tourTypes";

export const salesDemoTour: TourDefinition = {
	id: "sales-demo",
	title: "Sales demo flow",
	description:
		"Run a sales workflow from lead asset to chart and follow-up tasks.",
	steps: [
		{
			target: '[data-tour="agents"]',
			content: "Start with the Sales Assistant agent.",
			placement: "right",
			skipBeacon: true,
			before: () => openSidebarSection("agents"),
		},
		{
			target: '[data-tour="assets"]',
			content: "Upload a lead sheet and attach it to chat.",
			placement: "right",
			before: () => openSidebarSection("assets"),
		},
		{
			target: '[data-tour="chat-input"]',
			content: "Ask the agent to qualify leads and draft follow-up actions.",
			placement: "top",
			before: openBottomChatPanel,
		},
		{
			target: '[data-tour="bookmark-current"]',
			content: "Bookmark the result in a Sales folder.",
			placement: "right",
			before: openSidebar,
		},
		{
			target: '[data-tour="data-tab"]',
			content:
				"Add the pipeline chart to Data, resize the layout, and use the chart insights to ask chat to create follow-up tasks.",
			placement: "bottom",
			before: () => prepareTopPanelTarget("data", '[data-tour="data-tab"]'),
		},
		{
			target: '[data-tour="kanban-add-task"]',
			content:
				"Create sales follow-up tasks by asking chat to generate them, or click Add Task to create manual or AI tasks directly in Kanban.",
			placement: "bottom",
			before: () => prepareKanbanTarget('[data-tour="kanban-add-task"]'),
		},
	],
};

export const supportDemoTour: TourDefinition = {
	id: "support-demo",
	title: "Support demo flow",
	description: "Run a support workflow from KB upload to escalation task.",
	steps: [
		{
			target: '[data-tour="agents"]',
			content: "Start with the Support Bot agent.",
			placement: "right",
			skipBeacon: true,
			before: () => openSidebarSection("agents"),
		},
		{
			target: '[data-tour="knowledge-base"]',
			content: "Upload support FAQ or docs as a knowledge base.",
			placement: "right",
			before: () => openSidebarSection("knowledge-base"),
		},
		{
			target: '[data-tour="chat-input"]',
			content: "Ask the support question using the selected KB context.",
			placement: "top",
			before: openBottomChatPanel,
		},
		{
			target: '[data-tour="bookmark-current"]',
			content: "Bookmark the resolved chat in a Support folder.",
			placement: "right",
			before: openSidebar,
		},
		{
			target: '[data-tour="data-tab"]',
			content:
				"Add an escalation graph to Data, then use the insight to ask chat to create support tasks.",
			placement: "bottom",
			before: () => prepareTopPanelTarget("data", '[data-tour="data-tab"]'),
		},
		{
			target: '[data-tour="kanban-add-task"]',
			content:
				"Create escalation or follow-up tasks by asking chat, or click Add Task to create manual or AI tasks directly in Kanban.",
			placement: "bottom",
			before: () => prepareKanbanTarget('[data-tour="kanban-add-task"]'),
		},
	],
};
