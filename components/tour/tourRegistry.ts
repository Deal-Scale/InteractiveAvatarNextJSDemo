import type { Step } from "react-joyride";
import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";

type MermaidTourWindow = Window & {
	__mindStreamTourMermaidActionsOpen?: boolean;
};

export const TOUR_IDS = [
	"app-overview",
	"left-sidebar",
	"chats",
	"bookmarks",
	"assets",
	"knowledge-base",
	"tools",
	"agents",
	"brain",
	"data-grid",
	"actions-kanban",
	"sales-demo",
	"support-demo",
] as const;

export type TourId = (typeof TOUR_IDS)[number];

export type TourDefinition = {
	id: TourId;
	title: string;
	description: string;
	relatedTourIds?: TourId[];
	steps: Step[];
};

async function openBottomChatPanel() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	session.setChatExperience("basic");
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0.65);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
		window.dispatchEvent(
			new CustomEvent("tour-start-chat-without-session", {
				detail: { clearInput: true },
			}),
		);
	}
	await scrollTourTargetIntoView('[data-tour="chat-input"]');
}

async function showBottomChatPanelToggle() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	session.setChatExperience("basic");
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0);
	placement.setRightWidthFrac(0);
	placement.setFloating({ visible: false });
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="bottom-chat-panel-toggle"]');
}

async function ensureChatTourMessages() {
	const session = useSessionStore.getState();
	const existingIds = new Set(session.messages.map((message) => message.id));

	if (!existingIds.has("tour-chat-user")) {
		session.addMessage({
			id: "tour-chat-user",
			content: "Show me the chat controls.",
			sender: MessageSender.CLIENT,
		});
	}

	if (!existingIds.has("tour-chat-avatar")) {
		session.addMessage({
			id: "tour-chat-avatar",
			content:
				"Use these response controls to retry, branch to another agent, copy, upvote, or downvote this response.",
			provider: "pollinations",
			sender: MessageSender.AVATAR,
		});
	}

	if (!existingIds.has("tour-chat-mermaid")) {
		session.addMessage({
			id: "tour-chat-mermaid",
			content:
				"Example Mermaid chart ready to inspect or add to the Data grid.",
			jsx: `<Mermaid chart={"flowchart LR\\nA[Chat insight] --> B{Useful chart?}\\nB -->|Yes| C[Add to Data]\\nB -->|No| D[Keep in chat]"} />`,
			provider: "pollinations",
			sender: MessageSender.AVATAR,
		});
	}
}

async function prepareChatTourTarget(selector: string) {
	await openBottomChatPanel();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-slash-command-menu"));
		await new Promise((resolve) => window.setTimeout(resolve, 80));
	}
	ensureChatTourMessages();
	await scrollTourTargetIntoView(selector);
}

async function openSlashCommandMenu() {
	await openBottomChatPanel();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-slash-command-menu"));
	}
	await scrollTourTargetIntoView('[data-tour="slash-command-menu"]');
}

async function openMermaidActionsMenu() {
	await prepareChatTourTarget('[data-tour="mermaid-actions"]');
	if (typeof window !== "undefined") {
		(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen = true;
		window.dispatchEvent(new CustomEvent("tour-open-mermaid-actions"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="mermaid-add-to-grid"]');
	if (typeof window !== "undefined") {
		(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen = true;
		window.dispatchEvent(new CustomEvent("tour-open-mermaid-actions"));
		await new Promise((resolve) => window.setTimeout(resolve, 80));
	}
}

function closeMermaidActionsMenu() {
	if (typeof window !== "undefined") {
		(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen = false;
		window.dispatchEvent(new CustomEvent("tour-close-mermaid-actions"));
	}
}

async function scrollTourTargetIntoView(selector: string) {
	if (typeof window === "undefined") return;
	const target = await waitForTourTarget(selector);
	target?.scrollIntoView({
		behavior: "instant",
		block: "center",
		inline: "nearest",
	});
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

async function waitForTourTarget(selector: string) {
	if (typeof window === "undefined") return null;
	const startedAt = window.performance.now();
	while (window.performance.now() - startedAt < 3500) {
		const target = document.querySelector(selector);
		if (target) {
			const rect = target.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				return target;
			}
		}
		await new Promise((resolve) => window.setTimeout(resolve, 75));
	}
	return document.querySelector(selector);
}

async function closeChatPanelForWorkspaceTour() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0);
	placement.setRightWidthFrac(0);
	placement.setFloating({ visible: false });
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-slash-command-menu"));
		await new Promise((resolve) => window.setTimeout(resolve, 100));
	}
}

async function openSidebar() {
	const session = useSessionStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
	}
	usePlacementStore.getState().setSidebarCollapsed(false);
	await scrollTourTargetIntoView('[data-tour="sidebar-header"]');
}

async function openAppToursSection() {
	await openSidebar();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-app-tours"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="app-tours"]');
}

async function openChatSettingsForTour() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeConfigModal();
	session.setChatExperience("basic");
	session.openChatSettings("text");
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0);
	placement.setRightWidthFrac(0);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
	}
	await waitForTourTargetText('[data-tour="chat-settings"]', "Chat Settings");
	await scrollTourTargetIntoView('[data-tour="chat-settings"]');
}

async function openSidebarSection(
	section:
		| "agents"
		| "active-sessions"
		| "assets"
		| "bookmarks"
		| "chats"
		| "knowledge-base"
		| "session-history"
		| "tools",
) {
	await openSidebar();
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent("tour-open-sidebar-section", { detail: { section } }),
	);
	await scrollTourTargetIntoView(`[data-tour="${section}"]`);
}

async function openTopPanel(tab: "video" | "brain" | "data" | "actions") {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	await closeChatPanelForWorkspaceTour();
	session.setControlsMinimized(false);
	session.setViewTab(tab);
	placement.setActiveVideoTab(tab);
	await scrollTourTargetIntoView(`[data-tour="${tab}-tab"]`);
}

async function collapseTopPanelForTour(
	tab: "video" | "brain" | "data" | "actions" = "brain",
) {
	const session = useSessionStore.getState();
	await closeChatPanelForWorkspaceTour();
	session.setViewTab(tab);
	session.setControlsMinimized(true);
	await scrollTourTargetIntoView('[data-tour="top-panel-toggle"]');
}

async function prepareTopPanelTarget(
	tab: "video" | "brain" | "data" | "actions",
	selector: string,
) {
	await openTopPanel(tab);
	await scrollTourTargetIntoView(selector);
}

async function prepareKanbanTarget(selector: string) {
	await openTopPanel("actions");
	if (selector === '[data-tour="kanban-add-task"]') {
		await waitForTourTargetText(selector, "Add Task");
	}
	await scrollTourTargetIntoView(selector);
}

async function openKanbanManualTaskModal(
	selector = '[data-tour="kanban-task-type"]',
) {
	await openTopPanel("actions");
	await waitForTourTargetText('[data-tour="kanban-add-task"]', "Add Task");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-kanban-manual-task-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

async function openKanbanAiTaskModal(
	selector = '[data-tour="kanban-ai-task-form"]',
) {
	await openTopPanel("actions");
	await waitForTourTargetText('[data-tour="kanban-add-task"]', "Add Task");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-kanban-ai-task-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

async function closeKanbanTaskModalAndShow(selector: string) {
	await openTopPanel("actions");
	await waitForTourTargetText('[data-tour="kanban-add-task"]', "Add Task");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-kanban-task-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

async function prepareDataResizeHandle() {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-add-data-mermaid-chart"));
		window.dispatchEvent(new CustomEvent("tour-enable-data-layout"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView('[data-tour="data-grid-resize-handle"]');
}

async function prepareDataGridWithMermaidChart(selector: string) {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-add-data-mermaid-chart"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

async function prepareDataRestoreControl() {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-data-restore-control"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView('[data-tour="data-grid-restore-builtin"]');
}

async function prepareBrainGraphTarget(selector: string) {
	await openTopPanel("brain");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-brain-graph"));
		await new Promise((resolve) => window.setTimeout(resolve, 250));
	}
	await scrollTourTargetIntoView(selector);
}

async function openAvatarWorkspace() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	session.setChatExperience("avatar");
	session.setControlsMinimized(true);
	session.setViewTab("video");
	placement.setSidebarCollapsed(true);
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0);
	placement.setRightWidthFrac(0);
	placement.setFloating({ visible: false });
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-hide-chat-reopen"));
		window.dispatchEvent(new CustomEvent("tour-show-avatar-workspace"));
		await new Promise((resolve) => window.setTimeout(resolve, 250));
	}
	await waitForTourTargetText(
		'[data-tour="live-avatar-start-card"]',
		"Select an avatar to start session",
	);
	await scrollTourTargetIntoView('[data-tour="live-avatar-tour-anchor"]');
}

async function openBasicChatWorkspace() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	session.setChatExperience("basic");
	session.setControlsMinimized(true);
	session.setViewTab("video");
	placement.setSidebarCollapsed(true);
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0);
	placement.setRightWidthFrac(0);
	placement.setFloating({ visible: false });
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-hide-chat-reopen"));
		window.dispatchEvent(new CustomEvent("tour-show-basic-workspace"));
		await new Promise((resolve) => window.setTimeout(resolve, 250));
	}
	await waitForTourTargetText('[data-tour="basic-chat-card"]', "Basic Chat");
	await scrollTourTargetIntoView('[data-tour="basic-chat-tour-anchor"]');
}

async function waitForTourTargetText(selector: string, text: string) {
	if (typeof window === "undefined") return null;
	const startedAt = window.performance.now();
	while (window.performance.now() - startedAt < 5000) {
		const target = document.querySelector(selector);
		if (target?.textContent?.includes(text)) {
			const rect = target.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				return target;
			}
		}
		await new Promise((resolve) => window.setTimeout(resolve, 75));
	}
	return document.querySelector(selector);
}

async function openToolConnectionModal() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("open-connect-tool-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

async function closeToolConnectionModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-tool-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("tools");
}

async function openBookmarkAddModal() {
	await openSidebarSection("bookmarks");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("tour-open-bookmark-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

async function closeBookmarkAddModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-bookmark-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("bookmarks");
}

async function openKnowledgeBaseAddModal() {
	await openSidebarSection("knowledge-base");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("open-add-kb-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

async function closeKnowledgeBaseAddModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-kb-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("knowledge-base");
}

async function openAgentCreateModal() {
	await openSidebarSection("agents");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("tour-open-agent-create-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

async function prepareAgentModalTarget(selector: string) {
	await openAgentCreateModal();
	await scrollTourTargetIntoView(selector);
}

async function prepareAgentTextVoiceMode(selector: string) {
	await openAgentCreateModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-select-agent-text-voice-mode"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView(selector);
}

async function prepareAgentVideoMode() {
	await openAgentCreateModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-select-agent-video-mode"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="agent-section-video"]');
}

async function prepareAgentMonetizationSummary() {
	await openAgentCreateModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-enable-agent-monetization"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await waitForTourTargetText(
		'[data-tour="agent-monetization-summary"]',
		"Estimated payout",
	);
	await scrollTourTargetIntoView('[data-tour="agent-monetization-summary"]');
}

async function closeAgentCreateModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-agent-create-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("agents");
}

export const tourDefinitions: TourDefinition[] = [
	{
		id: "app-overview",
		title: "App overview",
		description: "Learn the sidebar, workspace, top panel, and core flows.",
		relatedTourIds: [
			"left-sidebar",
			"chats",
			"brain",
			"data-grid",
			"actions-kanban",
		],
		steps: [
			{
				target: '[data-tour="sidebar-header"]',
				content:
					"Use the sidebar to switch chats, manage assets, connect tools, and configure agents.",
				placement: "auto",
				skipBeacon: true,
				before: openSidebar,
			},
			{
				target: '[data-tour="new-chat"]',
				content: "Start a new chat and choose text, voice, or avatar mode.",
				placement: "auto",
				before: openSidebar,
			},
			{
				target: '[data-tour="bookmark-current"]',
				content:
					"Bookmark the current chat or live avatar session so it can be organized and reopened.",
				placement: "auto",
				before: openSidebar,
			},
			{
				target: '[data-tour="top-panel-tabs"]',
				content:
					"Use the top panel tabs to move between Brain, Data, and Actions workflows.",
				placement: "auto",
				before: () =>
					prepareTopPanelTarget("brain", '[data-tour="top-panel-tabs"]'),
			},
			{
				target: '[data-tour="live-avatar-tour-anchor"]',
				content:
					"Select an avatar, voice, and knowledge context here before starting a LiveAvatar video chat.",
				blockTargetInteraction: false,
				hideOverlay: true,
				placement: "bottom",
				before: openAvatarWorkspace,
			},
			{
				target: '[data-tour="basic-chat-tour-anchor"]',
				content:
					"Basic Chat lets you use text chat without starting a LiveAvatar session.",
				blockTargetInteraction: false,
				hideOverlay: true,
				placement: "bottom",
				before: openBasicChatWorkspace,
			},
			{
				target: '[data-tour="bottom-chat-panel-toggle"]',
				content:
					"Use this bottom chat toggle to reopen Basic Chat after the drawer is minimized.",
				placement: "top",
				before: showBottomChatPanelToggle,
			},
			{
				target: '[data-tour="bottom-chat-panel"]',
				content:
					"The bottom panel is the active Basic Chat drawer for messages, slash commands, attachments, and response controls.",
				placement: "center",
				before: openBottomChatPanel,
			},
			{
				target: '[data-tour="chat-settings"]',
				content:
					"Chat Settings lets you configure basic text chat, voice chat, and avatar chat before switching modes.",
				blockTargetInteraction: false,
				placement: "center",
				before: openChatSettingsForTour,
			},
			{
				target: '[data-tour="bookmarks"]',
				content:
					"Bookmarks save important chats or live avatar sessions with names, tags, and folders.",
				placement: "auto",
				before: () => openSidebarSection("bookmarks"),
			},
			{
				target: '[data-tour="assets"]',
				content:
					"Assets collect uploaded files and generated outputs you can attach to chat.",
				placement: "auto",
				before: () => openSidebarSection("assets"),
			},
			{
				target: '[data-tour="knowledge-base"]',
				content:
					"Knowledge bases organize markdown, text, and data files for chat and agent context.",
				placement: "auto",
				before: () => openSidebarSection("knowledge-base"),
			},
			{
				target: '[data-tour="tools"]',
				content:
					"Tools connect OAuth and API-key services that agents can use in workflows.",
				placement: "auto",
				before: () => openSidebarSection("tools"),
			},
			{
				target: '[data-tour="agents"]',
				content:
					"Agents package chat type, model, voice, video, context, and MCP tool settings.",
				placement: "auto",
				before: () => openSidebarSection("agents"),
			},
			{
				target: '[data-tour="app-tours"]',
				content:
					"App Tours lives in the left sidebar and launches guided flows for chats, bookmarks, assets, knowledge bases, tools, agents, and workspace panels.",
				placement: "auto",
				before: openAppToursSection,
			},
			{
				target: '[data-tour="active-sessions"]',
				content:
					"Active Sessions shows currently running LiveAvatar sessions that you can reopen.",
				placement: "auto",
				before: () => openSidebarSection("active-sessions"),
			},
			{
				target: '[data-tour="session-history"]',
				content:
					"Session History lists previous LiveAvatar sessions for review or continuation.",
				placement: "auto",
				before: () => openSidebarSection("session-history"),
			},
		],
	},
	{
		id: "left-sidebar",
		title: "Left sidebar",
		description:
			"Tour Chats, Bookmarks, Assets, Knowledge Base, Tools, and Agents.",
		relatedTourIds: [
			"chats",
			"bookmarks",
			"assets",
			"knowledge-base",
			"tools",
			"agents",
		],
		steps: [
			{
				target: '[data-tour="sidebar-header"]',
				content:
					"The sidebar starts with search, quick actions, and the tour launcher.",
				placement: "right",
				skipBeacon: true,
				before: openSidebar,
			},
			{
				target: '[data-tour="chats-section"]',
				content:
					"Chats are grouped by recency and folder once chat folders are enabled.",
				placement: "right",
				before: () => openSidebarSection("chats"),
			},
			{
				target: '[data-tour="bookmarks"]',
				content:
					"Bookmarks save important chats or live sessions with names, tags, and folders.",
				placement: "right",
				before: () => openSidebarSection("bookmarks"),
			},
			{
				target: '[data-tour="assets"]',
				content: "Upload and attach reusable files from Assets.",
				placement: "right",
				before: () => openSidebarSection("assets"),
			},
			{
				target: '[data-tour="knowledge-base"]',
				content: "Upload documents or connect sources for contextual answers.",
				placement: "right",
				before: () => openSidebarSection("knowledge-base"),
			},
			{
				target: '[data-tour="tools"]',
				content: "Connect, reconnect, and disconnect API or OAuth tools.",
				placement: "right",
				before: () => openSidebarSection("tools"),
			},
			{
				target: '[data-tour="agents"]',
				content: "Create text, voice, or video agents and launch them in chat.",
				placement: "right",
				before: () => openSidebarSection("agents"),
			},
		],
	},
	{
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
				before: () =>
					prepareChatTourTarget('[data-tour="message-branch-agent"]'),
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
				content:
					"Choose Add to Grid to send this Mermaid chart to the Data tab.",
				blockTargetInteraction: false,
				placement: "left",
				before: openMermaidActionsMenu,
			},
		],
	},
	{
		id: "bookmarks",
		title: "Bookmarks",
		description: "Save chats with names, tags, folders, and nested folders.",
		steps: [
			{
				target: '[data-tour="bookmark-current"]',
				content: "Bookmark the current chat or live avatar session.",
				placement: "right",
				skipBeacon: true,
				before: openSidebar,
			},
			{
				target: '[data-tour="bookmark-modal"]',
				content:
					"Name the bookmark, choose an existing folder or create a new one, and add tags before saving.",
				blockTargetInteraction: false,
				placement: "center",
				before: openBookmarkAddModal,
			},
			{
				target: '[data-tour="bookmarks"]',
				content:
					"Saved bookmarks live here. Expand folders to reopen chats, move bookmarks, or delete saved items.",
				placement: "right",
				before: closeBookmarkAddModalAndShowSection,
			},
		],
	},
	{
		id: "assets",
		title: "Assets",
		description: "Upload files, preview assets, and attach them to chat.",
		steps: [
			{
				target: '[data-tour="assets"]',
				content: "Use Assets to upload, preview, paginate, and attach files.",
				placement: "right",
				skipBeacon: true,
				before: () => openSidebarSection("assets"),
			},
			{
				target: '[data-tour="chat-input"]',
				content:
					"Attached assets appear in the composer before you send the message.",
				placement: "top",
				before: openBottomChatPanel,
			},
		],
	},
	{
		id: "knowledge-base",
		title: "Knowledge Base",
		description: "Upload context files and use them in chat or agents.",
		steps: [
			{
				target: '[data-tour="kb-add-button"]',
				content:
					"Start here to add a knowledge base, create folders, and upload markdown, text, or data files for context.",
				placement: "auto",
				skipBeacon: true,
				before: () => openSidebarSection("knowledge-base"),
			},
			{
				target: '[data-tour="kb-add-modal"]',
				content:
					"Use the Add Knowledge Base modal to select a folder, create a new folder, upload text files, paste markdown, or connect an external source.",
				blockTargetInteraction: false,
				placement: "center",
				before: openKnowledgeBaseAddModal,
			},
			{
				target: '[data-tour="knowledge-base"]',
				content:
					"Knowledge bases live here after creation. Use folders and item menus to organize context for chats and agents.",
				placement: "right",
				before: closeKnowledgeBaseAddModalAndShowSection,
			},
		],
	},
	{
		id: "tools",
		title: "Tools",
		description: "Connect, disconnect, reconnect, and use external tools.",
		steps: [
			{
				target: '[data-tour="tools"]',
				content: "Search and filter tools by OAuth or API key.",
				placement: "right",
				skipBeacon: true,
				before: () => openSidebarSection("tools"),
			},
			{
				target: '[data-tour="tool-connect-modal"]',
				content:
					"Connect tools, review capabilities, disconnect, or reconnect stale credentials.",
				blockTargetInteraction: false,
				placement: "center",
				before: openToolConnectionModal,
			},
			{
				target: '[data-tour="tools"]',
				content:
					"Connected tools live here and can be used in chat or selected as MCP capabilities when creating agents.",
				placement: "right",
				before: closeToolConnectionModalAndShowSection,
			},
		],
	},
	{
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
	},
	{
		id: "brain",
		title: "Brain tab",
		description: "Open the top panel and inspect the knowledge graph.",
		steps: [
			{
				target: '[data-tour="top-panel-toggle"]',
				content:
					"Open the top panel when Brain, Data, or Actions is minimized.",
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
				content:
					"Use graph controls to zoom, maximize, minimize, and highlight.",
				placement: "left",
				before: () => prepareBrainGraphTarget('[data-tour="brain-controls"]'),
			},
		],
	},
	{
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
	},
	{
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
				before: () =>
					openKanbanManualTaskModal('[data-tour="kanban-task-type"]'),
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
				before: () =>
					openKanbanAiTaskModal('[data-tour="kanban-ai-task-form"]'),
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
	},
	{
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
	},
	{
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
	},
];

export const tourRegistry = Object.fromEntries(
	tourDefinitions.map((tour) => [tour.id, tour]),
) as Record<TourId, TourDefinition>;
