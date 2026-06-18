import {
	closeAgentManagerCreateTarget,
	closeDashboardKanbanTaskAndShow,
	openAgentManagerCreateTarget,
	openAppToursSection,
	openCampaignCreateTarget,
	openConnectionsWebhookTarget,
	openDashboardChartsTab,
	openDashboardKanbanTaskTarget,
	openDashboardTourTarget,
	openDealCreateTarget,
	openEmployeeInviteTarget,
	openSidebar,
	openSidebarSection,
	openSlashCommandMenu,
	openTopPanel,
	prepareChatTourTarget,
	prepareTopPanelTarget,
} from "../tourHelpers";
import type { TourDefinition, TourStep } from "../tourTypes";

function dashboardRouteStep({
	before,
	content,
	hideOverlay,
	href,
	target,
}: {
	before?: () => Promise<void> | void;
	content: string;
	hideOverlay?: boolean;
	href: string;
	target: string;
}): TourStep {
	return {
		target,
		content,
		placement: "auto",
		skipBeacon: true,
		hideOverlay,
		before: before ?? (() => openDashboardTourTarget(href, target)),
	};
}

function chartsTabStep({
	content,
	tab,
	target,
}: {
	content: string;
	tab: "overview" | "leads" | "ai-agents" | "advanced";
	target: string;
}): TourStep {
	return dashboardRouteStep({
		href:
			tab === "overview" ? "/dashboard/charts" : `/dashboard/charts?tab=${tab}`,
		target,
		content,
		before: () => openDashboardChartsTab(tab, target),
	});
}

export const agentManagerTour: TourDefinition = {
	id: "agent-manager",
	title: "AI Agents",
	description: "Open the AI agents manager and review the agent workspace.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agents-page"]',
			content:
				"Use the Agents page to manage AI agent profiles, configuration, and operating context.",
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agents-header"]',
			content:
				"The header shows the AI Sales Agents workspace and the primary action for creating a new agent.",
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agents-create"]',
			content:
				"Create Agent starts the assistant setup flow. The tour opens the form next so you can see what users configure.",
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-form"]',
			content:
				"The create form is where an assistant is configured before it is saved to the agent list.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-form"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-name"]',
			content:
				"Name identifies the assistant in campaign assignment, tables, and reporting.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-name"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-type"]',
			content:
				"Agent Type decides whether the assistant is built for phone, direct mail, or social workflows.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-type"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-goal"]',
			content:
				"Campaign Goal tells the assistant what outcome it should optimize for, such as booked appointments or qualified leads.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-goal"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-persona"]',
			content:
				"Persona shapes the tone of the assistant so it matches the intended buyer or seller conversation style.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-persona"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-script"]',
			content:
				"Sales Script gives the assistant concrete language to follow during outbound conversations. Users can paste the script directly here.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-script"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-script-upload"]',
			content:
				"Upload text file loads a .txt or .md sales script into the same field when users already have the script saved locally.",
			before: () =>
				openAgentManagerCreateTarget(
					'[data-tour="agent-manager-script-upload"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-publishing"]',
			content:
				"Publishing controls decide whether this assistant stays private or becomes available as a paid/public agent.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-publishing"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agent-manager-save"]',
			content:
				"Save Agent commits the configured assistant and returns the user to the agent list.",
			before: () =>
				openAgentManagerCreateTarget('[data-tour="agent-manager-save"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/agents",
			target: '[data-tour="agents-table"]',
			content:
				"The agent table lists existing agents and exposes edit and delete actions for each row.",
			before: () => closeAgentManagerCreateTarget('[data-tour="agents-table"]'),
		}),
	],
};

export const campaignsTour: TourDefinition = {
	id: "campaigns",
	title: "Campaigns",
	description: "Open campaign workflows and review campaign controls.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-page"]',
			content:
				"Campaigns centralize outreach setup, campaign activity, and follow-up workflow management.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-header"]',
			content:
				"The campaign header frames the workspace before users search, filter, or create outreach.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-search"]',
			content:
				"Use search to narrow campaign records before reviewing channel performance.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-filters"]',
			content:
				"Status filters switch between all, scheduled, active, and completed campaign views.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-stats"]',
			content:
				"Campaign stat cards summarize conversations and channel totals. Channel cards also switch the active campaign type.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-tabs"]',
			content:
				"Tabs navigate between call, text, social, and direct mail campaign tables while keeping the URL in sync.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-create"]',
			content:
				"Create Campaign starts the multi-step campaign builder for channel selection, customization, timing, and launch settings.",
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaign-channel-step"]',
			content:
				"Channel selection chooses the primary outreach path before campaign-specific settings are shown.",
			hideOverlay: true,
			before: () =>
				openCampaignCreateTarget('[data-tour="campaign-channel-step"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaign-customization-step"]',
			content:
				"Channel customization collects phone, lead list, transfer, and channel-specific settings for the new campaign.",
			hideOverlay: true,
			before: () =>
				openCampaignCreateTarget(
					'[data-tour="campaign-customization-step"]',
					1,
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaign-timing-step"]',
			content:
				"Timing preferences control campaign dates, daily attempt limits, and advanced call scheduling rules.",
			hideOverlay: true,
			before: () =>
				openCampaignCreateTarget('[data-tour="campaign-timing-step"]', 2),
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaign-finalize-step"]',
			content:
				"Finalize Campaign is where the user names the campaign, assigns the AI agent, chooses workflow assets, and launches.",
			hideOverlay: true,
			before: () =>
				openCampaignCreateTarget('[data-tour="campaign-finalize-step"]', 3),
		}),
		dashboardRouteStep({
			href: "/dashboard/campaigns",
			target: '[data-tour="campaigns-table-section"]',
			content:
				"The table section is where campaign rows, detail navigation, and channel-specific actions live.",
		}),
	],
};

export const leadListTour: TourDefinition = {
	id: "lead-list",
	title: "Lead List",
	description: "Open the lead list workspace.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-page"]',
			content:
				"Lead List is where saved lists, list actions, and lead list modals are managed.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-header"]',
			content:
				"The breadcrumb header confirms the active Lead List workspace before the tour moves into the table controls.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-table"]',
			content:
				"The lead list table is the main workspace for opening list details, skip tracing, and creating lead records.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-workspace-header"]',
			content:
				"The table header explains this list-management surface and the types of lead operations available.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-search"]',
			content:
				"Search filters visible lead lists by list name, record counts, phone, email, and social fields.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-ai-actions"]',
			content:
				"AI actions can run against selected rows or all filtered rows to summarize and prepare list workflows.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-actions"]',
			content:
				"List actions create leads, create lists, skip trace selected records, and export filtered lead data.",
		}),
		dashboardRouteStep({
			href: "/dashboard/lead-list",
			target: '[data-tour="lead-list-data-table"]',
			content:
				"The data grid is the operational table for sorting, selecting, opening, and exporting lead lists.",
		}),
	],
};

export const kanbanTour: TourDefinition = {
	id: "kanban",
	title: "Kanban",
	description: "Open the dashboard kanban board.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-page"]',
			content:
				"Kanban shows your action board for task status, assignments, and workflow execution.",
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-header"]',
			content:
				"The Kanban header names the workspace and keeps the new-task action within reach.",
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-new-task"]',
			content:
				"Use the new task control to add manual or AI-assisted tasks to the board.",
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-manual-task-button"]',
			content:
				"Manual Task opens a standard task form for assigning follow-up work without AI generation.",
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-ai-task-button"]',
			content:
				"AI Task opens the task builder with agent selection and AI preview controls.",
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-task-type"]',
			content:
				"The task modal tabs let users switch between manual entry and AI-assisted task setup.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget('[data-tour="kanban-task-type"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-task-assignment"]',
			content:
				"Assignment chooses whether the task is tied to a single lead, lead list, or general team workflow.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget('[data-tour="kanban-task-assignment"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-manual-task-form"]',
			content:
				"The manual form captures the task title, notes, scheduling, and ownership details.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget('[data-tour="kanban-manual-task-form"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-ai-task-form"]',
			content:
				"The AI form combines normal task fields with agent-specific controls for generated work plans.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget(
					'[data-tour="kanban-ai-task-form"]',
					"ai",
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-ai-preview"]',
			content:
				"The AI preview area shows the generated task plan, required tools, and needs before saving.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget('[data-tour="kanban-ai-preview"]', "ai"),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-task-save"]',
			content:
				"Create Task saves the configured manual or AI task back to the Kanban board.",
			hideOverlay: true,
			before: () =>
				openDashboardKanbanTaskTarget('[data-tour="kanban-task-save"]', "ai"),
		}),
		dashboardRouteStep({
			href: "/dashboard/kanban",
			target: '[data-tour="kanban-board-page"]',
			content:
				"The board columns organize work by status. Drag cards or open them to update task details.",
			before: () =>
				closeDashboardKanbanTaskAndShow('[data-tour="kanban-board-page"]'),
		}),
	],
};

export const chatTour: TourDefinition = {
	id: "chat",
	title: "Chat Experience",
	description: "Open the dashboard chat experience.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-experience-page"]',
			content:
				"Chat opens the full interactive avatar workspace with chat, video, data, brain, and actions panels.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="sidebar-header"]',
			content:
				"The embedded workspace sidebar stays available inside dashboard chat for search, app tours, saved sessions, knowledge, tools, and agents.",
			before: () => openSidebar(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="search-conversations"]',
			content:
				"Search filters conversations and sidebar records so users can quickly recover prior work without leaving the chat workspace.",
			before: () => openSidebar(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="new-chat"]',
			content:
				"New Chat starts a fresh text chat setup from the sidebar, useful when users want a clean thread or different chat mode.",
			before: () => openSidebar(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="bookmark-current"]',
			content:
				"Bookmark saves the active chat context so users can return to important conversations and generated work later.",
			before: () => openSidebar(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chats-section"]',
			content:
				"The Chats section is where current and historical conversations are organized before users reopen or bookmark work.",
			before: () => openSidebarSection("chats"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="bookmarks"]',
			content:
				"Bookmarks group saved chats into a file-tree style list, keeping important sessions accessible from the left sidebar.",
			before: () => openSidebarSection("bookmarks"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="knowledge-base"]',
			content:
				"Knowledge Base stores reusable documents and connected sources that agents can use as context during chat.",
			before: () => openSidebarSection("knowledge-base"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="tools"]',
			content:
				"Tools shows connected integrations and MCP-style capabilities that can be used from chat commands and agent workflows.",
			before: () => openSidebarSection("tools"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="agents"]',
			content:
				"The Agents section gives users quick access to configured assistants and preview actions without leaving the chat workspace.",
			before: () => openSidebarSection("agents"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="app-tours"]',
			content:
				"App Tours lives in the left sidebar so users can relaunch guided help for workspace features whenever they need it.",
			before: () => openAppToursSection(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="top-panel-tabs"]',
			content:
				"The top workspace controls switch the main panel between avatar video, brain graph, data grid, and action board views.",
			before: () =>
				prepareTopPanelTarget("brain", '[data-tour="top-panel-tabs"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="brain-tab"]',
			content:
				"Brain opens the graph workspace for reviewing connected context and relationship maps.",
			before: () => openTopPanel("brain"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="data-tab"]',
			content:
				"Data opens the grid workspace where generated charts, extracted records, and reusable data views live.",
			before: () => openTopPanel("data"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="actions-tab"]',
			content:
				"Actions opens the task board so chat insights can become tracked follow-up work.",
			before: () => openTopPanel("actions"),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="bottom-chat-panel"]',
			content:
				"The chat panel is the main conversation area for text prompts, agent responses, and follow-up actions.",
			before: () => prepareChatTourTarget('[data-tour="bottom-chat-panel"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-input"]',
			content:
				"Use the composer to type prompts, attach context, and send messages into the active chat.",
			before: () => prepareChatTourTarget('[data-tour="chat-input"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="slash-command-menu"]',
			content:
				"The slash-command menu exposes shortcuts for agents, knowledge, tools, saved actions, and reusable workflow commands.",
			before: () => openSlashCommandMenu(),
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="slash-command-item"]',
			content:
				"Each slash-command result can insert a structured action into the composer so users do not need to remember exact command syntax.",
			before: () => openSlashCommandMenu(),
		}),
	],
};
export const connectionsTour: TourDefinition = {
	id: "connections",
	title: "Connections",
	description: "Open the connections hub.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-page"]',
			content:
				"Connections Hub manages incoming webhooks, outgoing webhooks, feeds, and delivery activity.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-header"]',
			content:
				"The connections header introduces the integration hub and keeps the workflow context clear.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-categories"]',
			content:
				"Category tabs switch the connection context between leads, campaigns, and skip tracing.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-stages"]',
			content:
				"Stage tabs separate incoming webhooks, outgoing webhooks, and feed-based integrations.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-stage-card"]',
			content:
				"Stage cards explain the selected integration type and open the setup modal.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-highlights"]',
			content:
				"Highlights explain the operational details users should know before configuring this integration stage.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-configure"]',
			content:
				"The configure button opens the webhook and feed setup modal for the selected category and stage.",
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-modal"]',
			content:
				"The modal centralizes incoming webhooks, outgoing webhook destinations, and secure feed setup.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget('[data-tour="connections-webhook-modal"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-categories"]',
			content:
				"Webhook categories scope the setup to leads, campaigns, or skip tracing events.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget(
					'[data-tour="connections-webhook-categories"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-crm-guides"]',
			content:
				"CRM integration guides provide setup walkthroughs for common connected platforms.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget('[data-tour="connections-crm-guides"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-stages"]',
			content:
				"Modal stage tabs switch between incoming endpoints, outgoing destinations, and activity feeds.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget(
					'[data-tour="connections-webhook-stages"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-url"]',
			content:
				"The endpoint field is what users copy into their CRM or configure as an outbound destination.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget('[data-tour="connections-webhook-url"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-payload"]',
			content:
				"Payload examples show the expected schema so users can validate their CRM mapping.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget(
					'[data-tour="connections-webhook-payload"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-history"]',
			content:
				"Modal history previews recent webhook activity for troubleshooting and delivery verification.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget(
					'[data-tour="connections-webhook-history"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-webhook-actions"]',
			content:
				"Actions let users test the webhook, save the configuration, or cancel without changing setup.",
			hideOverlay: true,
			before: () =>
				openConnectionsWebhookTarget(
					'[data-tour="connections-webhook-actions"]',
				),
		}),
		dashboardRouteStep({
			href: "/dashboard/connections",
			target: '[data-tour="connections-history"]',
			content:
				"Activity History shows delivery events, endpoints, status codes, latency, and responses.",
		}),
	],
};

export const chartsTour: TourDefinition = {
	id: "charts",
	title: "Charts",
	description: "Open analytics and chart dashboards.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-page"]',
			content:
				"Charts visualize campaign performance, lead trends, pipeline health, and analytics dashboards.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-header"]',
			content:
				"The charts header anchors the analytics workspace and keeps the refresh action nearby when users need the latest reporting snapshot.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-refresh"]',
			content:
				"Refresh reloads analytics data so KPI cards, chart series, and downstream tabs stay current after campaigns or lead lists change.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-tabs"]',
			content:
				"Analytics tabs split the dashboard into overview metrics, lead segment performance, AI agent reporting, and advanced enterprise analysis.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-kpis"]',
			content:
				"The overview KPI cards summarize the operating pulse: total leads, active campaigns, conversion rate, and active tasks with recent deltas.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-grid"]',
			content:
				"The overview grid pairs outreach performance with lead generation trends so users can compare activity volume against lead growth.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-campaign-performance"]',
			content:
				"Campaign Performance breaks down outreach results by campaign so users can spot which channels and initiatives are producing outcomes.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-lead-trends"]',
			content:
				"Lead Trends shows whether lead generation is accelerating, flattening, or dropping over time before users adjust campaign volume.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-pipeline"]',
			content:
				"The pipeline funnel shows where leads are moving or stalling from capture through closed deals, which helps prioritize follow-up work.",
		}),
		chartsTabStep({
			tab: "overview",
			target: '[data-tour="charts-roi-calculator"]',
			content:
				"The ROI calculator estimates campaign return so analytics can connect activity to financial outcomes.",
		}),
		chartsTabStep({
			tab: "leads",
			target: '[data-tour="charts-leads-intro"]',
			content:
				"The Leads tab focuses on segment-level performance for off-market sellers, motivated sellers, cash buyers, and other tracked lead types.",
		}),
		chartsTabStep({
			tab: "leads",
			target: '[data-tour="charts-leads-summary"]',
			content:
				"Lead summary cards compress the tab into four decision metrics: total volume, qualified leads, hot leads, and average intent score.",
		}),
		chartsTabStep({
			tab: "leads",
			target: '[data-tour="charts-leads-mix"]',
			content:
				"Lead Mix compares total, qualified, and hot leads by segment so users can see which audience has both scale and quality.",
		}),
		chartsTabStep({
			tab: "leads",
			target: '[data-tour="charts-leads-quality"]',
			content:
				"Segment Quality highlights conversion rate, top source, qualified count, hot count, and the strongest signal for each segment.",
		}),
		chartsTabStep({
			tab: "leads",
			target: '[data-tour="charts-leads-breakdown"]',
			content:
				"The breakdown table gives an operations-ready view of every segment so users can compare source, conversion, and signal details row by row.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-intro"]',
			content:
				"The AI Agents tab measures how automated calling, messaging, enrichment, and workflows contribute to sales execution.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-overview"]',
			content:
				"AI overview cards summarize agent output, hours saved, conversion lift, and the highest-level automation impact.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-performance"]',
			content:
				"Voice and script performance compare conversation quality, speed, and messaging effectiveness across the AI outreach stack.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-automation"]',
			content:
				"Enrichment and workflow panels show how AI finds high-intent leads, fills missing context, and moves repetitive work out of the manual queue.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-pro-insights"]',
			content:
				"Pro insights expose deeper AI recommendations and locked premium analysis when the user needs more than starter reporting.",
		}),
		chartsTabStep({
			tab: "ai-agents",
			target: '[data-tour="charts-ai-weekly"]',
			content:
				"The weekly AI report turns agent activity into a quick executive summary of hours saved, high-intent leads found, and top performers.",
		}),
		chartsTabStep({
			tab: "advanced",
			target: '[data-tour="charts-advanced-intro"]',
			content:
				"The Advanced tab groups enterprise-grade analytics such as AI ROI, predictive scoring, forecasting, attribution, and team benchmarks.",
		}),
		chartsTabStep({
			tab: "advanced",
			target: '[data-tour="charts-advanced-ai-roi"]',
			content:
				"AI ROI connects automation cost to saved time and pipeline outcomes so leaders can judge whether AI spend is paying back.",
		}),
		chartsTabStep({
			tab: "advanced",
			target: '[data-tour="charts-advanced-predictive"]',
			content:
				"Predictive analytics combine lead scoring and revenue forecasting to identify which opportunities deserve priority before results are final.",
		}),
		chartsTabStep({
			tab: "advanced",
			target: '[data-tour="charts-advanced-efficiency"]',
			content:
				"Efficiency cards evaluate deal execution and close probability, helping teams separate activity volume from actual deal progress.",
		}),
		chartsTabStep({
			tab: "advanced",
			target: '[data-tour="charts-advanced-attribution"]',
			content:
				"Attribution and hobby-time forecasting explain which signals create value and how much manual effort automation is replacing.",
		}),
	],
};

export const calculationsTour: TourDefinition = {
	id: "calculations",
	title: "Calculations",
	description: "Open calculation tools for financial analysis.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/calculators",
			target: '[data-tour="calculations-page"]',
			content:
				"Calculations open the calculator hub for financing, deal analysis, and quick financial checks.",
		}),
		dashboardRouteStep({
			href: "/dashboard/calculators",
			target: '[data-tour="calculations-header"]',
			content:
				"The calculator header explains the analysis area before users choose a specific tool.",
		}),
		dashboardRouteStep({
			href: "/dashboard/calculators",
			target: '[data-tour="calculations-hub"]',
			content:
				"The calculator hub groups reusable real estate calculators in one embedded workspace.",
		}),
		dashboardRouteStep({
			href: "/dashboard/calculators",
			target: '[data-tour="calculations-nav"]',
			content:
				"Calculator navigation groups tools by category and jumps directly to the selected calculator.",
		}),
		dashboardRouteStep({
			href: "/dashboard/calculators",
			target: '[data-tour="calculations-grid"]',
			content:
				"The calculator grid contains reusable analysis tools for ROI, cash flow, lending, offers, and commissions.",
		}),
	],
};

export const resourcesTour: TourDefinition = {
	id: "resources",
	title: "Resources",
	description: "Open the resources library.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-page"]',
			content:
				"Resources collects training videos, custom GPTs, simulations, and mentor material.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-training"]',
			content:
				"Training Videos open tutorial modals so users can learn workflows without leaving the page.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-training-card"]',
			content:
				"Each training card summarizes a tutorial with category, duration, title, and description.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-training-open"]',
			content:
				"The play control opens the selected training video in the walkthrough modal.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-gpts"]',
			content:
				"Custom GPTs and AI tools link out to specialized assistants for real estate work.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-gpt-card"]',
			content:
				"AI tool cards identify the assistant, category, premium status, and intended use case.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-gpt-open"]',
			content:
				"Open Tool launches the selected custom GPT or AI tool in a separate browser tab.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-simulations"]',
			content:
				"Investment Simulations point users to scenario tools and templates in the community.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-simulation-card"]',
			content:
				"Simulation cards describe the scenario type and difficulty before users open the template.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-simulation-discord"]',
			content:
				"View in Discord opens the community resource where the simulation template is shared.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-discord-cta"]',
			content:
				"The Discord callout gives users a second path to community tools and support.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-mentors"]',
			content:
				"Investor Mentors provide contact actions for expert support and coaching.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-mentor-card"]',
			content:
				"Mentor cards show availability, expertise, experience, and a short bio for each mentor.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-mentor-contact"]',
			content:
				"Contact actions use the mentor's preferred channel, such as Discord, email, or calendar booking.",
		}),
		dashboardRouteStep({
			href: "/dashboard/resources",
			target: '[data-tour="resources-mentorship-info"]',
			content:
				"The mentorship callout explains when users should ask for personalized deal or market guidance.",
		}),
	],
};

export const dealRoomTour: TourDefinition = {
	id: "deal-room",
	title: "Deal Room",
	description: "Open the deal room pipeline.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-page"]',
			content:
				"Deal Room tracks property deals, status filters, deal progress, and create-deal actions.",
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-header"]',
			content:
				"The deal room header names the pipeline workspace and keeps the create action close to the workflow.",
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-create"]',
			content:
				"New Deal opens the create-deal modal so users can add an opportunity to the pipeline.",
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-create-property-step"]',
			content:
				"The first deal step captures the property address, city, state, and ZIP before the financial details.",
			before: () =>
				openDealCreateTarget('[data-tour="deal-create-property-step"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-create-financial-step"]',
			content:
				"The financial step captures deal type, purchase price, and ARV so the deal can calculate ROI.",
			before: () =>
				openDealCreateTarget('[data-tour="deal-create-financial-step"]', 2),
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-create-review-step"]',
			content:
				"The review step summarizes the new opportunity before it is created and added to the pipeline.",
			before: () =>
				openDealCreateTarget('[data-tour="deal-create-review-step"]', 3),
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-stats"]',
			content:
				"Quick stats summarize active deal count, total value, completion, and average close timing.",
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-filters"]',
			content:
				"Search and status filters narrow the deal grid by address, city, state, and pipeline status.",
		}),
		dashboardRouteStep({
			href: "/dashboard/deal-room",
			target: '[data-tour="deal-room-grid"]',
			content:
				"Deal cards open detail rooms with price, ARV, ROI, and progress information.",
		}),
	],
};

export const employeeTour: TourDefinition = {
	id: "employee",
	title: "Employee",
	description: "Open employee management.",
	steps: [
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-page"]',
			content:
				"Employee management covers team members, invites, team activity, and AI-assisted table actions.",
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-header"]',
			content:
				"The employee header frames team management and keeps the invite action visible.",
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-invite"]',
			content:
				"Add New opens the invite flow for creating a new team member with role and permission settings.",
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-invite-modal"]',
			content:
				"The invite modal starts the team member setup flow without leaving employee management.",
			before: () =>
				openEmployeeInviteTarget('[data-tour="employee-invite-modal"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-invite-form"]',
			content:
				"The invite form collects team member details, permissions, security settings, and platform limits.",
			before: () =>
				openEmployeeInviteTarget('[data-tour="employee-invite-form"]'),
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-tabs"]',
			content:
				"Employee tabs switch between the team table and activity reporting.",
		}),
		dashboardRouteStep({
			href: "/dashboard/employee",
			target: '[data-tour="employee-table"]',
			content:
				"The employee table supports search, column controls, row details, and selected-row AI actions.",
		}),
	],
};
