import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";

type MermaidTourWindow = Window & {
	__mindStreamTourMermaidActionsOpen?: boolean;
};

export type SidebarTourSection =
	| "agents"
	| "active-sessions"
	| "assets"
	| "bookmarks"
	| "chats"
	| "knowledge-base"
	| "session-history"
	| "tools";

export type TopPanelTourTab = "video" | "brain" | "data" | "actions";
export type DashboardChartsTab =
	| "overview"
	| "leads"
	| "ai-agents"
	| "advanced";

export async function openBottomChatPanel() {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	session.setChatExperience("basic");
	placement.setDockMode("bottom");
	placement.setBottomHeightFrac(0.65);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
		window.dispatchEvent(new CustomEvent("deal-scale:restore-chat"));
		window.dispatchEvent(
			new CustomEvent("tour-start-chat-without-session", {
				detail: { clearInput: true },
			}),
		);
	}
	await scrollTourTargetIntoView('[data-tour="chat-input"]');
}

export async function showBottomChatPanelToggle() {
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
		window.dispatchEvent(new CustomEvent("tour-minimize-chat"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="bottom-chat-panel-toggle"]');
}

function ensureChatTourMessages() {
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

export async function prepareChatTourTarget(selector: string) {
	await openBottomChatPanel();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-slash-command-menu"));
		await new Promise((resolve) => window.setTimeout(resolve, 80));
	}
	ensureChatTourMessages();
	await scrollTourTargetIntoView(selector);
}

export async function openSlashCommandMenu() {
	await openBottomChatPanel();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-slash-command-menu"));
	}
	await scrollTourTargetIntoView('[data-tour="slash-command-menu"]');
}

export async function openMermaidActionsMenu() {
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

export function closeMermaidActionsMenu() {
	if (typeof window !== "undefined") {
		(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen = false;
		window.dispatchEvent(new CustomEvent("tour-close-mermaid-actions"));
	}
}

export async function scrollTourTargetIntoView(selector: string) {
	if (typeof window === "undefined") return;
	const target = await waitForTourTarget(selector);
	target?.scrollIntoView({
		behavior: "instant",
		block: "center",
		inline: "nearest",
	});
	await new Promise((resolve) => window.setTimeout(resolve, 75));
}

async function waitForTourTarget(selector: string) {
	if (typeof window === "undefined") return null;
	const startedAt = window.performance.now();
	while (window.performance.now() - startedAt < 3500) {
		const target = document.querySelector(selector);
		if (target) {
			const rect = target.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) return target;
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
		window.dispatchEvent(new CustomEvent("tour-minimize-chat"));
		await new Promise((resolve) => window.setTimeout(resolve, 100));
	}
}

export async function openDashboardTourTarget(href: string, selector: string) {
	const session = useSessionStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	await navigateDashboardTour(href);
	await scrollTourTargetIntoView(selector);
}

export async function openDashboardChartsTab(
	tab: DashboardChartsTab,
	selector: string,
) {
	const session = useSessionStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("tour-open-charts-tab", { detail: { tab } }),
		);
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

async function navigateDashboardTour(href: string) {
	const session = useSessionStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	if (typeof window !== "undefined") {
		const nextUrl = new URL(href, window.location.origin);
		const currentPath = `${window.location.pathname}${window.location.search}`;
		const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
		if (currentPath !== nextPath) {
			console.warn("[tour] Dashboard tour target requested on inactive route", {
				currentPath,
				nextPath,
			});
		}
	}
}

export async function openAgentManagerCreateTarget(selector: string) {
	await navigateDashboardTour("/dashboard/agents");
	if (typeof window !== "undefined") {
		const formIsVisible = document.querySelector(
			'[data-tour="agent-manager-form"]',
		);
		if (!formIsVisible) {
			await scrollTourTargetIntoView('[data-tour="agents-create"]');
			window.dispatchEvent(new CustomEvent("tour-open-agent-manager-create"));
			await new Promise((resolve) => window.setTimeout(resolve, 150));
		}
	}
	await scrollTourTargetIntoView(selector);
}

export async function closeAgentManagerCreateTarget(selector: string) {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-agent-manager-create"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openDashboardTourTarget("/dashboard/agents", selector);
}

export async function openDealCreateTarget(
	selector: string,
	step: 1 | 2 | 3 = 1,
) {
	await openDashboardTourTarget(
		"/dashboard/deal-room",
		'[data-tour="deal-room-create"]',
	);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-deal-create-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
		window.dispatchEvent(
			new CustomEvent("tour-set-deal-create-step", {
				detail: { step },
			}),
		);
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function openEmployeeInviteTarget(selector: string) {
	await openDashboardTourTarget(
		"/dashboard/employee",
		'[data-tour="employee-invite"]',
	);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-employee-invite-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function openCampaignCreateTarget(selector: string, step = 0) {
	await openDashboardTourTarget(
		"/dashboard/campaigns",
		'[data-tour="campaigns-create"]',
	);
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-campaign-create-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
		window.dispatchEvent(
			new CustomEvent("tour-set-campaign-create-step", {
				detail: { step },
			}),
		);
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function openDashboardKanbanTaskTarget(
	selector: string,
	mode: "manual" | "ai" = "manual",
) {
	await openDashboardTourTarget(
		"/dashboard/kanban",
		'[data-tour="kanban-new-task"]',
	);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent(
				mode === "ai"
					? "tour-open-kanban-ai-task-modal"
					: "tour-open-kanban-manual-task-modal",
			),
		);
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function closeDashboardKanbanTaskAndShow(selector: string) {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-kanban-task-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await openDashboardTourTarget("/dashboard/kanban", selector);
}

export async function openConnectionsWebhookTarget(
	selector: string,
	stage: "incoming" | "outgoing" | "feeds" = "incoming",
) {
	await openDashboardTourTarget(
		"/dashboard/connections",
		'[data-tour="connections-configure"]',
	);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("tour-open-connections-webhook-modal", {
				detail: { stage },
			}),
		);
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function openSidebar() {
	const session = useSessionStore.getState();
	session.closeChatSettings();
	session.closeConfigModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
	}
	usePlacementStore.getState().setSidebarCollapsed(false);
	await scrollTourTargetIntoView('[data-tour="sidebar-header"]');
}

export async function openAppToursSection() {
	await openSidebar();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-open-app-tours"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="app-tours"]');
}

export async function openChatSettingsForTour() {
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

export async function openSidebarSection(section: SidebarTourSection) {
	await openSidebar();
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent("tour-open-sidebar-section", { detail: { section } }),
	);
	await scrollTourTargetIntoView(getSidebarSectionTarget(section));
}

function getSidebarSectionTarget(section: SidebarTourSection) {
	if (section === "chats") {
		return '[data-tour="chats-section"]';
	}
	return `[data-tour="${section}"]`;
}

export async function openTopPanel(tab: TopPanelTourTab) {
	const session = useSessionStore.getState();
	const placement = usePlacementStore.getState();
	await closeChatPanelForWorkspaceTour();
	session.setControlsMinimized(false);
	session.setViewTab(tab);
	placement.setActiveVideoTab(tab);
	await scrollTourTargetIntoView(`[data-tour="${tab}-tab"]`);
}

export async function collapseTopPanelForTour(tab: TopPanelTourTab = "brain") {
	const session = useSessionStore.getState();
	await closeChatPanelForWorkspaceTour();
	session.setViewTab(tab);
	session.setControlsMinimized(true);
	await scrollTourTargetIntoView('[data-tour="top-panel-toggle"]');
}

export async function prepareTopPanelTarget(
	tab: TopPanelTourTab,
	selector: string,
) {
	await openTopPanel(tab);
	await scrollTourTargetIntoView(selector);
}

export async function prepareKanbanTarget(selector: string) {
	await openTopPanel("actions");
	if (selector === '[data-tour="kanban-add-task"]') {
		await waitForTourTargetText(selector, "Add Task");
	}
	await scrollTourTargetIntoView(selector);
}

export async function openKanbanManualTaskModal(
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

export async function openKanbanAiTaskModal(
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

export async function closeKanbanTaskModalAndShow(selector: string) {
	await openTopPanel("actions");
	await waitForTourTargetText('[data-tour="kanban-add-task"]', "Add Task");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-kanban-task-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function prepareDataResizeHandle() {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-add-data-mermaid-chart"));
		window.dispatchEvent(new CustomEvent("tour-enable-data-layout"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView('[data-tour="data-grid-resize-handle"]');
}

export async function prepareDataGridWithMermaidChart(selector: string) {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-add-data-mermaid-chart"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView(selector);
}

export async function prepareDataRestoreControl() {
	await openTopPanel("data");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-data-restore-control"));
		await new Promise((resolve) => window.setTimeout(resolve, 200));
	}
	await scrollTourTargetIntoView('[data-tour="data-grid-restore-builtin"]');
}

export async function prepareBrainGraphTarget(selector: string) {
	await openTopPanel("brain");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-show-brain-graph"));
		await new Promise((resolve) => window.setTimeout(resolve, 250));
	}
	await scrollTourTargetIntoView(selector);
}

export async function openAvatarWorkspace() {
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

export async function openBasicChatWorkspace() {
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
			if (rect.width > 0 && rect.height > 0) return target;
		}
		await new Promise((resolve) => window.setTimeout(resolve, 75));
	}
	return document.querySelector(selector);
}

export async function openToolConnectionModal() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("open-connect-tool-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

export async function closeToolConnectionModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-tool-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("tools");
}

export async function openBookmarkAddModal() {
	await openSidebarSection("bookmarks");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("tour-open-bookmark-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

export async function closeBookmarkAddModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-bookmark-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("bookmarks");
}

export async function openKnowledgeBaseAddModal() {
	await openSidebarSection("knowledge-base");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("open-add-kb-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

export async function closeKnowledgeBaseAddModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-kb-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("knowledge-base");
}

export async function openAgentCreateModal() {
	await openSidebarSection("agents");
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("tour-open-agent-create-modal"));
	await new Promise((resolve) => window.setTimeout(resolve, 150));
}

export async function prepareAgentModalTarget(selector: string) {
	await openAgentCreateModal();
	await scrollTourTargetIntoView(selector);
}

export async function prepareAgentTextVoiceMode(selector: string) {
	await openAgentCreateModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-select-agent-text-voice-mode"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView(selector);
}

export async function prepareAgentVideoMode() {
	await openAgentCreateModal();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-select-agent-video-mode"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await scrollTourTargetIntoView('[data-tour="agent-section-video"]');
}

export async function prepareAgentMonetizationSummary() {
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

export async function closeAgentCreateModalAndShowSection() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tour-close-agent-create-modal"));
		await new Promise((resolve) => window.setTimeout(resolve, 150));
	}
	await openSidebarSection("agents");
}
