import {
	closeKanbanTaskModalAndShow,
	closeMermaidActionsMenu,
	collapseTopPanelForTour,
	openKanbanAiTaskModal,
	openKanbanManualTaskModal,
	openMermaidActionsMenu,
	openTopPanel,
	prepareBrainGraphTarget,
	prepareChatTourTarget,
	prepareDataGridWithMermaidChart,
	prepareDataResizeHandle,
	prepareDataRestoreControl,
	prepareKanbanTarget,
} from "../tourHelpers";
import type { TourDefinition } from "../tourTypes";

export const brainTour: TourDefinition = {
	id: "brain",
	title: "Brain tab",
	description: "Open the top panel and inspect the knowledge graph.",
	steps: [
		{
			target: '[data-tour="top-panel-toggle"]',
			content: "Open the top panel when Brain, Data, or Actions is minimized.",
			placement: "bottom",
			skipBeacon: true,
			before: () => collapseTopPanelForTour("brain"),
		},
		{
			target: '[data-tour="brain-tab"]',
			content: "Switch to Brain to inspect the graph view.",
			placement: "bottom",
			before: () => openTopPanel("brain"),
		},
		{
			target: '[data-tour="brain-graph"]',
			content:
				"Use the graph to inspect relationships, zoom, highlight nodes, and open alternate views.",
			placement: "center",
			before: () => prepareBrainGraphTarget('[data-tour="brain-graph"]'),
		},
		{
			target: '[data-tour="brain-controls"]',
			content: "Use graph controls to zoom, maximize, minimize, and highlight.",
			placement: "left",
			before: () => prepareBrainGraphTarget('[data-tour="brain-controls"]'),
		},
	],
};

export const dataGridTour: TourDefinition = {
	id: "data-grid",
	title: "Data grid",
	description: "Add Mermaid charts from chat and customize chart layout.",
	steps: [
		{
			target: '[data-tour="top-panel-toggle"]',
			content: "Open the top panel before using Data.",
			placement: "bottom",
			skipBeacon: true,
			before: () => collapseTopPanelForTour("data"),
		},
		{
			target: '[data-tour="data-tab"]',
			content: "Open Data to view charts and dashboards.",
			placement: "bottom",
			before: () => openTopPanel("data"),
		},
		{
			target: '[data-tour="mermaid-actions"]',
			content:
				"This example Mermaid chart is rendered in chat. Open the chart submenu to see actions like View, Copy, Reload, and Add to Grid.",
			placement: "top",
			before: () => prepareChatTourTarget('[data-tour="mermaid-actions"]'),
		},
		{
			target: '[data-tour="mermaid-add-to-grid"]',
			content:
				"Use Add to Grid to send the Mermaid chart from chat into the Data dashboard.",
			blockTargetInteraction: false,
			placement: "left",
			before: openMermaidActionsMenu,
		},
		{
			target: '[data-tour="data-grid-layout-controls"]',
			content:
				"The Mermaid chart now appears in Data. Click Layout to enable chart dragging and resizing.",
			placement: "bottom",
			before: async () => {
				closeMermaidActionsMenu();
				await prepareDataGridWithMermaidChart(
					'[data-tour="data-grid-layout-controls"]',
				);
			},
		},
		{
			target: '[data-tour="data-grid-resize-handle"]',
			content:
				"Resize charts from this bottom-right corner handle while Layout mode is enabled.",
			placement: "top",
			before: prepareDataResizeHandle,
		},
		{
			target: '[data-tour="data-grid-remove-builtin"]',
			content:
				"Built-in non-Mermaid tables can be removed from the grid when you want a focused dashboard.",
			placement: "left",
			before: () =>
				prepareDataGridWithMermaidChart(
					'[data-tour="data-grid-remove-builtin"]',
				),
		},
		{
			target: '[data-tour="data-grid-restore-builtin"]',
			content:
				"Removed built-in tables appear here so you can add them back to the grid.",
			placement: "bottom",
			before: prepareDataRestoreControl,
		},
	],
};

export const actionsKanbanTour: TourDefinition = {
	id: "actions-kanban",
	title: "Actions Kanban",
	description:
		"Create AI/manual tasks, stop running tasks, and reconnect blocked tasks.",
	steps: [
		{
			target: '[data-tour="top-panel-toggle"]',
			content: "Open the top panel before using Actions.",
			placement: "bottom",
			skipBeacon: true,
			before: () => collapseTopPanelForTour("actions"),
		},
		{
			target: '[data-tour="actions-tab"]',
			content: "Open Actions to manage task workflows.",
			placement: "bottom",
			before: () => openTopPanel("actions"),
		},
		{
			target: '[data-tour="kanban-add-task"]',
			content:
				"Use Add Task to create either a manual work item or an AI-assisted task.",
			placement: "bottom",
			before: () => prepareKanbanTarget('[data-tour="kanban-add-task"]'),
		},
		{
			target: '[data-tour="kanban-task-type"]',
			content:
				"Choose Manual when a person owns the task. Choose AI when the task should run through an agent workflow.",
			blockTargetInteraction: false,
			placement: "center",
			before: () => openKanbanManualTaskModal('[data-tour="kanban-task-type"]'),
		},
		{
			target: '[data-tour="kanban-manual-task-form"]',
			content:
				"Manual tasks use the standard fields: assignee, lead or lead list, due date, schedule, files, and notes.",
			blockTargetInteraction: false,
			placement: "center",
			before: () =>
				openKanbanManualTaskModal('[data-tour="kanban-manual-task-form"]'),
		},
		{
			target: '[data-tour="kanban-ai-task-form"]',
			content:
				"AI tasks add agent selection, preview planning, MCP tool needs, and generated workflow context before the task is created.",
			blockTargetInteraction: false,
			placement: "center",
			before: () => openKanbanAiTaskModal('[data-tour="kanban-ai-task-form"]'),
		},
		{
			target: '[data-tour="kanban-ai-generate-preview"]',
			content:
				"Generate Preview builds the AI task plan so you can review needs and tool calls before creating it.",
			blockTargetInteraction: false,
			placement: "top",
			before: () =>
				openKanbanAiTaskModal('[data-tour="kanban-ai-generate-preview"]'),
		},
		{
			target: '[data-tour="kanban-board"]',
			content: "Drag tasks between columns as work progresses.",
			placement: "center",
			before: () => closeKanbanTaskModalAndShow('[data-tour="kanban-board"]'),
		},
		{
			target: '[data-tour="kanban-stop-task"]',
			content:
				"Stop or cancel a running AI task from the task card when it is taking too long or needs correction.",
			placement: "left",
			before: () =>
				closeKanbanTaskModalAndShow('[data-tour="kanban-stop-task"]'),
		},
		{
			target: '[data-tour="kanban-reconnect-task"]',
			content:
				"Reconnect, retry, or resolve authorization when a task is blocked by stale credentials or missing tool access.",
			placement: "left",
			before: () =>
				closeKanbanTaskModalAndShow('[data-tour="kanban-reconnect-task"]'),
		},
	],
};
