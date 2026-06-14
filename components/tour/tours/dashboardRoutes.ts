import {
	closeAgentManagerCreateTarget,
	closeDashboardKanbanTaskAndShow,
	openAgentManagerCreateTarget,
	openCampaignCreateTarget,
	openConnectionsWebhookTarget,
	openDashboardKanbanTaskTarget,
	openDashboardTourTarget,
	openDealCreateTarget,
	openEmployeeInviteTarget,
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
			target: '[data-tour="chat-page"]',
			content:
				"Chat is the lightweight AI chat page for simple message exchange.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-header"]',
			content:
				"The chat header identifies this lightweight conversation page before the thread and composer.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-thread"]',
			content:
				"The message thread shows user and assistant messages as the conversation progresses.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-empty-state"]',
			content:
				"The empty state confirms there are no messages yet and prompts the user to start the conversation.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-composer"]',
			content: "Use the composer to enter a prompt and send it to the AI chat.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-input"]',
			content:
				"The input field accepts the user prompt before the message is added to the thread.",
		}),
		dashboardRouteStep({
			href: "/dashboard/chat",
			target: '[data-tour="chat-send"]',
			content:
				"Send posts the prompt, disables during response generation, and appends the AI reply when complete.",
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
				"The charts header anchors the analytics workspace before users switch reports or inspect KPIs.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-tabs"]',
			content:
				"Analytics tabs switch between overview, AI agent analytics, and advanced analytics.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-kpis"]',
			content:
				"KPI cards summarize total leads, active campaigns, conversion rate, and active tasks.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-grid"]',
			content:
				"The chart grid compares campaign performance and lead generation trends.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-pipeline"]',
			content:
				"The pipeline chart shows funnel health from lead capture through closed deals.",
		}),
		dashboardRouteStep({
			href: "/dashboard/charts",
			target: '[data-tour="charts-roi-calculator"]',
			content:
				"The ROI calculator estimates campaign return so analytics can connect activity to financial outcomes.",
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
