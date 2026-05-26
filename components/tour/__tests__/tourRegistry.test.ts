import { describe, expect, it } from "vitest";
import { tourGroups } from "@/components/tour/tourGroups";
import {
	TOUR_IDS,
	tourDefinitions,
	tourRegistry,
} from "@/components/tour/tourRegistry";

describe("guided tour registry", () => {
	it("defines exactly one tour for every supported tour id", () => {
		const definitionIds = tourDefinitions.map((tour) => tour.id);

		expect(definitionIds.toSorted()).toEqual([...TOUR_IDS].toSorted());
		expect(new Set(definitionIds).size).toBe(definitionIds.length);
	});

	it.each(TOUR_IDS)("has runnable metadata and steps for %s", (tourId) => {
		const tour = tourRegistry[tourId];

		expect(tour).toBeDefined();
		expect(tour.id).toBe(tourId);
		expect(tour.title.trim()).not.toHaveLength(0);
		expect(tour.description.trim()).not.toHaveLength(0);
		expect(tour.steps.length).toBeGreaterThan(0);

		for (const step of tour.steps) {
			expect(typeof step.target).toBe("string");
			expect(String(step.target)).toMatch(/^\[data-tour="[^"]+"\]$/);
			expect(step.content).toBeTruthy();
		}
	});

	it("only links to existing related tours", () => {
		for (const tour of tourDefinitions) {
			for (const relatedTourId of tour.relatedTourIds ?? []) {
				expect(tourRegistry[relatedTourId]).toBeDefined();
			}
		}
	});

	it("places every guided tour in exactly one sidebar folder", () => {
		const groupedTourIds = tourGroups.flatMap((group) => group.tourIds);

		expect(groupedTourIds.toSorted()).toEqual([...TOUR_IDS].toSorted());
		expect(new Set(groupedTourIds).size).toBe(groupedTourIds.length);
	});

	it("keeps sidebar tour folders display-ready", () => {
		const groupIds = tourGroups.map((group) => group.id);

		expect(new Set(groupIds).size).toBe(groupIds.length);

		for (const group of tourGroups) {
			expect(group.title.trim()).not.toHaveLength(0);
			expect(group.description.trim()).not.toHaveLength(0);
			expect(group.accentClassName).toContain("border-");
			expect(group.tourIds.length).toBeGreaterThan(0);
		}
	});

	it("prepares hidden sidebar sections before tours target them", () => {
		const hiddenWhenCollapsedTargets = new Set([
			'[data-tour="active-sessions"]',
			'[data-tour="agents"]',
			'[data-tour="app-tours"]',
			'[data-tour="assets"]',
			'[data-tour="bookmarks"]',
			'[data-tour="chats-section"]',
			'[data-tour="knowledge-base"]',
			'[data-tour="session-history"]',
			'[data-tour="tools"]',
		]);

		for (const tour of tourDefinitions) {
			for (const step of tour.steps) {
				if (hiddenWhenCollapsedTargets.has(String(step.target))) {
					expect(step.before, `${tour.id} ${String(step.target)}`).toEqual(
						expect.any(Function),
					);
				}
			}
		}
	});

	it("uses auto placement for app overview steps that can sit near viewport edges", () => {
		for (const step of tourRegistry["app-overview"].steps) {
			if (
				step.target === '[data-tour="live-avatar-tour-anchor"]' ||
				step.target === '[data-tour="basic-chat-tour-anchor"]'
			) {
				expect(step.placement).toBe("bottom");
				continue;
			}
			if (step.target === '[data-tour="bottom-chat-panel-toggle"]') {
				expect(step.placement).toBe("top");
				continue;
			}
			if (step.target === '[data-tour="bottom-chat-panel"]') {
				expect(step.placement).toBe("center");
				continue;
			}
			if (step.target === '[data-tour="chat-settings"]') {
				expect(step.placement).toBe("center");
				continue;
			}
			expect(step.placement).toBe("auto");
		}
	});

	it("keeps sidebar section tour anchors on stable wrappers", async () => {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const sidebarSource = await fs.readFile(
			path.join(root, "components", "Sidebar.tsx"),
			"utf8",
		);
		const nestedSectionSources = await Promise.all(
			[
				"MessagesSection.tsx",
				"AssetsSection.tsx",
				"KnowledgebaseSection.tsx",
				"ToolsSection.tsx",
				"AgentsSection.tsx",
			].map((fileName) =>
				fs.readFile(path.join(root, "components", "Sidebar", fileName), "utf8"),
			),
		);

		for (const target of [
			"active-sessions",
			"chats-section",
			"assets",
			"knowledge-base",
			"tools",
			"agents",
			"session-history",
		]) {
			expect(sidebarSource).toContain(`data-tour="${target}"`);
			for (const nestedSource of nestedSectionSources) {
				expect(nestedSource).not.toContain(`data-tour="${target}"`);
			}
		}
	});

	it("shows live avatar, basic chat, settings, app tours, bookmarks, active sessions, and history in app overview", () => {
		const targets = tourRegistry["app-overview"].steps.map((step) =>
			String(step.target),
		);

		expect(targets).toContain('[data-tour="live-avatar-tour-anchor"]');
		expect(targets).toContain('[data-tour="basic-chat-tour-anchor"]');
		expect(targets).toContain('[data-tour="bottom-chat-panel-toggle"]');
		expect(targets).toContain('[data-tour="bottom-chat-panel"]');
		expect(targets).toContain('[data-tour="chat-settings"]');
		expect(targets).toContain('[data-tour="app-tours"]');
		expect(targets).toContain('[data-tour="bookmarks"]');
		expect(targets).toContain('[data-tour="active-sessions"]');
		expect(targets).toContain('[data-tour="session-history"]');
	});

	it("keeps active sessions and session history last in app overview", () => {
		const targets = tourRegistry["app-overview"].steps.map((step) =>
			String(step.target),
		);

		expect(targets.at(-2)).toBe('[data-tour="active-sessions"]');
		expect(targets.at(-1)).toBe('[data-tour="session-history"]');
	});

	it("keeps app overview steps in the requested workspace and sidebar order", () => {
		const targets = tourRegistry["app-overview"].steps.map((step) =>
			String(step.target),
		);

		expect(targets).toEqual([
			'[data-tour="sidebar-header"]',
			'[data-tour="new-chat"]',
			'[data-tour="bookmark-current"]',
			'[data-tour="top-panel-tabs"]',
			'[data-tour="live-avatar-tour-anchor"]',
			'[data-tour="basic-chat-tour-anchor"]',
			'[data-tour="bottom-chat-panel-toggle"]',
			'[data-tour="bottom-chat-panel"]',
			'[data-tour="chat-settings"]',
			'[data-tour="bookmarks"]',
			'[data-tour="assets"]',
			'[data-tour="knowledge-base"]',
			'[data-tour="tools"]',
			'[data-tour="agents"]',
			'[data-tour="app-tours"]',
			'[data-tour="active-sessions"]',
			'[data-tour="session-history"]',
		]);
	});

	it("prepares the avatar and basic chat workspaces before app overview highlights them", () => {
		const avatarWorkspaceStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="live-avatar-tour-anchor"]',
		);
		const basicChatStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="basic-chat-tour-anchor"]',
		);
		const bottomChatStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="bottom-chat-panel"]',
		);
		const bottomChatToggleStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="bottom-chat-panel-toggle"]',
		);
		const chatSettingsStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="chat-settings"]',
		);
		const appToursStep = tourRegistry["app-overview"].steps.find(
			(step) => step.target === '[data-tour="app-tours"]',
		);

		expect(avatarWorkspaceStep?.before).toEqual(expect.any(Function));
		expect(basicChatStep?.before).toEqual(expect.any(Function));
		expect(bottomChatToggleStep?.before).toEqual(expect.any(Function));
		expect(bottomChatStep?.before).toEqual(expect.any(Function));
		expect(chatSettingsStep?.before).toEqual(expect.any(Function));
		expect(appToursStep?.before).toEqual(expect.any(Function));
	});

	it("prepares tab-specific targets before tours highlight them", () => {
		const tabSpecificTargets = new Set([
			'[data-tour="actions-tab"]',
			'[data-tour="brain-controls"]',
			'[data-tour="brain-graph"]',
			'[data-tour="brain-tab"]',
			'[data-tour="data-grid"]',
			'[data-tour="data-grid-layout-controls"]',
			'[data-tour="data-grid-remove-builtin"]',
			'[data-tour="data-grid-restore-builtin"]',
			'[data-tour="data-grid-resize-handle"]',
			'[data-tour="data-tab"]',
			'[data-tour="kanban-add-task"]',
			'[data-tour="kanban-ai-generate-preview"]',
			'[data-tour="kanban-ai-task-form"]',
			'[data-tour="kanban-board"]',
			'[data-tour="kanban-manual-task-form"]',
			'[data-tour="kanban-reconnect-task"]',
			'[data-tour="kanban-stop-task"]',
			'[data-tour="kanban-task-type"]',
			'[data-tour="top-panel-tabs"]',
			'[data-tour="top-panel-toggle"]',
		]);

		for (const tour of tourDefinitions) {
			for (const step of tour.steps) {
				if (tabSpecificTargets.has(String(step.target))) {
					expect(step.before, `${tour.id} ${String(step.target)}`).toEqual(
						expect.any(Function),
					);
				}
			}
		}
	});

	it("closes chat and scrolls exact targets for top panel tours", async () => {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const tourHelpersSource = await fs.readFile(
			path.join(root, "components", "tour", "tourHelpers.ts"),
			"utf8",
		);
		const workspaceToursSource = await fs.readFile(
			path.join(root, "components", "tour", "tours", "workspaceTours.ts"),
			"utf8",
		);

		expect(tourHelpersSource).toContain("closeChatPanelForWorkspaceTour");
		expect(tourHelpersSource).toContain("setBottomHeightFrac(0)");
		expect(tourHelpersSource).toContain("setRightWidthFrac(0)");
		expect(tourHelpersSource).toContain("prepareTopPanelTarget");
		expect(tourHelpersSource).toContain("collapseTopPanelForTour");
		expect(tourHelpersSource).toContain("prepareBrainGraphTarget");
		expect(tourHelpersSource).toContain("tour-show-brain-graph");
		expect(tourHelpersSource).toContain("openKanbanManualTaskModal");
		expect(tourHelpersSource).toContain("openKanbanAiTaskModal");
		expect(tourHelpersSource).toContain("closeKanbanTaskModalAndShow");
		expect(workspaceToursSource).toContain(
			"prepareBrainGraphTarget('[data-tour=\"brain-graph\"]')",
		);
		expect(tourHelpersSource).toContain("prepareDataGridWithMermaidChart");
		expect(workspaceToursSource).toContain(
			'[data-tour="data-grid-layout-controls"]',
		);
		expect(tourHelpersSource).toContain("prepareDataResizeHandle");
		expect(tourHelpersSource).toContain("prepareDataGridWithMermaidChart");
		expect(tourHelpersSource).toContain("prepareDataRestoreControl");
		expect(tourHelpersSource).toContain("tour-add-data-mermaid-chart");
		expect(tourHelpersSource).toContain("tour-show-data-restore-control");
		expect(workspaceToursSource).toContain(
			"closeKanbanTaskModalAndShow('[data-tour=\"kanban-board\"]')",
		);
	});

	it("starts basic chat without an avatar session before bottom chat tour steps", async () => {
		const bottomChatTargets = new Set(['[data-tour="chat-input"]']);

		for (const tour of tourDefinitions) {
			for (const step of tour.steps) {
				if (bottomChatTargets.has(String(step.target))) {
					expect(step.before, `${tour.id} ${String(step.target)}`).toEqual(
						expect.any(Function),
					);
				}
			}
		}

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const tourHelpersSource = await fs.readFile(
			path.join(root, "components", "tour", "tourHelpers.ts"),
			"utf8",
		);
		const avatarSessionSource = await fs.readFile(
			path.join(root, "components", "AvatarSession.tsx"),
			"utf8",
		);

		expect(tourHelpersSource).toContain('setChatExperience("basic")');
		expect(tourHelpersSource).toContain("tour-start-chat-without-session");
		expect(tourHelpersSource).toContain("clearInput");
		expect(avatarSessionSource).toContain("tour-start-chat-without-session");
		expect(avatarSessionSource).toContain('setChatInput("")');
		expect(avatarSessionSource).toContain("enableMockChatUi()");
	});

	it("targets concrete chat controls after opening the bottom chat panel", () => {
		const chatTour = tourRegistry.chats;
		const chatTargets = chatTour.steps.map((step) => String(step.target));

		expect(chatTargets).not.toContain('[data-tour="bottom-chat-panel-toggle"]');
		expect(chatTargets).not.toContain('[data-tour="bottom-chat-panel"]');
		expect(chatTargets[0]).toBe('[data-tour="new-chat"]');
		expect(chatTargets).toContain('[data-tour="chat-input"]');
		expect(chatTargets).toContain('[data-tour="slash-command-item"]');
		expect(chatTargets).toContain('[data-tour="slash-command-menu"]');
		expect(chatTargets).toContain('[data-tour="message-restream"]');
		expect(chatTargets).toContain('[data-tour="message-copy"]');
		expect(chatTargets).toContain('[data-tour="message-upvote"]');
		expect(chatTargets).toContain('[data-tour="message-downvote"]');
		expect(chatTargets).toContain('[data-tour="message-branch-agent"]');
		expect(chatTargets).toContain('[data-tour="message-speak"]');
		expect(chatTargets).toContain('[data-tour="mermaid-actions"]');
		expect(chatTargets).toContain('[data-tour="mermaid-add-to-grid"]');

		for (const step of chatTour.steps.slice(1)) {
			expect(step.before, String(step.target)).toEqual(expect.any(Function));
		}
	});

	it("walks data grid through Mermaid menu, layout resize, remove, and restore", async () => {
		const dataGridTargets = tourRegistry["data-grid"].steps.map((step) =>
			String(step.target),
		);

		expect(dataGridTargets).toEqual([
			'[data-tour="top-panel-toggle"]',
			'[data-tour="data-tab"]',
			'[data-tour="mermaid-actions"]',
			'[data-tour="mermaid-add-to-grid"]',
			'[data-tour="data-grid-layout-controls"]',
			'[data-tour="data-grid-resize-handle"]',
			'[data-tour="data-grid-remove-builtin"]',
			'[data-tour="data-grid-restore-builtin"]',
		]);

		for (const target of [
			'[data-tour="mermaid-actions"]',
			'[data-tour="mermaid-add-to-grid"]',
			'[data-tour="data-grid-layout-controls"]',
			'[data-tour="data-grid-resize-handle"]',
			'[data-tour="data-grid-remove-builtin"]',
			'[data-tour="data-grid-restore-builtin"]',
		]) {
			const step = tourRegistry["data-grid"].steps.find(
				(candidate) => candidate.target === target,
			);
			expect(step?.before, target).toEqual(expect.any(Function));
		}

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const dataViewerSource = await fs.readFile(
			path.join(root, "components", "data-viewer", "DataViewer.tsx"),
			"utf8",
		);
		const mermaidSource = await fs.readFile(
			path.join(root, "components", "ui", "mermaid.tsx"),
			"utf8",
		);
		const tourProviderSource = await fs.readFile(
			path.join(root, "components", "tour", "AppTourProvider.tsx"),
			"utf8",
		);

		expect(dataViewerSource).toContain("TOUR_MERMAID_CHART");
		expect(dataViewerSource).toContain("tour-add-data-mermaid-chart");
		expect(dataViewerSource).toContain("tour-show-data-restore-control");
		expect(dataViewerSource).toContain('data-tour="data-grid-remove-builtin"');
		expect(dataViewerSource).toContain('data-tour="data-grid-restore-builtin"');
		expect(dataViewerSource).toContain("data-grid-resize-handle");
		expect(dataViewerSource).not.toContain("shouldRegenerateLayouts");
		expect(dataViewerSource).not.toContain("setEditable(false)");
		expect(mermaidSource).toContain("tourPinnedMenuRef");
		expect(mermaidSource).toContain("tour-close-mermaid-actions");
		expect(tourProviderSource).toContain("tour-close-mermaid-actions");
	});

	it("uses the real bookmark and knowledge base modals in their focused tours", async () => {
		const bookmarkTargets = tourRegistry.bookmarks.steps.map((step) =>
			String(step.target),
		);
		const knowledgeTargets = tourRegistry["knowledge-base"].steps.map((step) =>
			String(step.target),
		);

		expect(bookmarkTargets).toContain('[data-tour="bookmark-modal"]');
		expect(knowledgeTargets).toContain('[data-tour="kb-add-modal"]');
		expect(knowledgeTargets).not.toContain('[data-tour="chat-settings"]');
		expect(bookmarkTargets.at(-2)).toBe('[data-tour="bookmark-modal"]');
		expect(bookmarkTargets.at(-1)).toBe('[data-tour="bookmarks"]');
		expect(knowledgeTargets.at(-2)).toBe('[data-tour="kb-add-modal"]');
		expect(knowledgeTargets.at(-1)).toBe('[data-tour="knowledge-base"]');

		for (const target of [
			'[data-tour="bookmark-modal"]',
			'[data-tour="kb-add-modal"]',
		]) {
			const step = tourDefinitions
				.flatMap((tour) => tour.steps)
				.find((candidate) => candidate.target === target);
			expect(step?.before, target).toEqual(expect.any(Function));
			expect(step?.after, target).toBeUndefined();
			expect(step?.blockTargetInteraction, target).toBe(false);
			expect(step?.placement, target).toBe("center");
		}

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const bookmarkModalSource = await fs.readFile(
			path.join(root, "components", "Sidebar", "BookmarkModal.tsx"),
			"utf8",
		);
		const kbModalSource = await fs.readFile(
			path.join(
				root,
				"components",
				"KnowledgeBase",
				"AddKnowledgeBaseModal.tsx",
			),
			"utf8",
		);
		const sidebarSource = await fs.readFile(
			path.join(root, "components", "Sidebar.tsx"),
			"utf8",
		);

		expect(bookmarkModalSource).toContain('data-tour="bookmark-modal"');
		expect(bookmarkModalSource).toContain("onInteractOutside");
		expect(bookmarkModalSource).toContain("preventDefault()");
		expect(kbModalSource).toContain('data-tour="kb-add-modal"');
		expect(kbModalSource).toContain("onInteractOutside");
		expect(kbModalSource).toContain("preventDefault()");
		expect(sidebarSource).toContain("tour-open-bookmark-modal");
		expect(sidebarSource).toContain("tour-close-bookmark-modal");
		expect(sidebarSource).toContain("tour-close-kb-modal");
	});

	it("uses real tools and agent modals without replaying modal steps", async () => {
		const toolTargets = tourRegistry.tools.steps.map((step) =>
			String(step.target),
		);
		const agentTargets = tourRegistry.agents.steps.map((step) =>
			String(step.target),
		);

		expect(toolTargets).toContain('[data-tour="tool-connect-modal"]');
		expect(toolTargets.at(-1)).toBe('[data-tour="tools"]');
		expect(agentTargets).toContain('[data-tour="agent-chat-type"]');
		expect(agentTargets).toContain('[data-tour="agent-section-profile"]');
		expect(agentTargets).toContain('[data-tour="agent-section-context"]');
		expect(agentTargets).toContain('[data-tour="agent-section-voice"]');
		expect(agentTargets).toContain('[data-tour="agent-section-video"]');
		expect(agentTargets).toContain('[data-tour="agent-section-tools"]');
		expect(agentTargets).toContain('[data-tour="agent-section-monetization"]');
		expect(agentTargets).toContain('[data-tour="agent-monetization-summary"]');
		expect(agentTargets).not.toContain('[data-tour="agent-mcp"]');
		expect(agentTargets.at(-1)).toBe('[data-tour="agents"]');

		for (const target of [
			'[data-tour="tool-connect-modal"]',
			'[data-tour="agent-chat-type"]',
			'[data-tour="agent-section-profile"]',
			'[data-tour="agent-section-context"]',
			'[data-tour="agent-section-voice"]',
			'[data-tour="agent-section-video"]',
			'[data-tour="agent-section-tools"]',
			'[data-tour="agent-section-monetization"]',
			'[data-tour="agent-monetization-summary"]',
		]) {
			const step = tourDefinitions
				.flatMap((tour) => tour.steps)
				.find((candidate) => candidate.target === target);
			expect(step?.before, target).toEqual(expect.any(Function));
			expect(step?.after, target).toBeUndefined();
			expect(step?.blockTargetInteraction, target).toBe(false);
			expect(step?.placement, target).toBe("center");
		}

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const toolModalSource = await fs.readFile(
			path.join(root, "components", "Sidebar", "ToolConnectionModal.tsx"),
			"utf8",
		);
		const agentModalSource = await fs.readFile(
			path.join(root, "components", "Sidebar", "AgentModal.tsx"),
			"utf8",
		);
		const sidebarSource = await fs.readFile(
			path.join(root, "components", "Sidebar.tsx"),
			"utf8",
		);
		const agentsSectionSource = await fs.readFile(
			path.join(root, "components", "Sidebar", "AgentsSection.tsx"),
			"utf8",
		);

		expect(toolModalSource).toContain('data-tour="tool-connect-modal"');
		expect(toolModalSource).toContain("modal={false}");
		expect(toolModalSource).toContain("onInteractOutside");
		expect(toolModalSource).toContain("preventDefault()");
		expect(agentModalSource).toContain('data-tour="agent-chat-type"');
		expect(agentModalSource).toContain('dataTour: "agent-section-profile"');
		expect(agentModalSource).toContain('dataTour: "agent-section-context"');
		expect(agentModalSource).toContain('dataTour: "agent-section-voice"');
		expect(agentModalSource).toContain('dataTour: "agent-section-video"');
		expect(agentModalSource).toContain('dataTour: "agent-section-tools"');
		expect(agentModalSource).toContain(
			'dataTour: "agent-section-monetization"',
		);
		expect(agentModalSource).toContain("tour-enable-agent-monetization");
		expect(agentModalSource).toContain("modal={false}");
		expect(agentModalSource).toContain("onInteractOutside");
		expect(agentModalSource).toContain("preventDefault()");
		expect(sidebarSource).toContain("tour-close-tool-modal");
		expect(agentsSectionSource).toContain("tour-close-agent-create-modal");
	});

	it("anchors the knowledge base tour intro to the visible add button", async () => {
		const firstKnowledgeStep = tourRegistry["knowledge-base"].steps[0];

		expect(firstKnowledgeStep.target).toBe('[data-tour="kb-add-button"]');
		expect(firstKnowledgeStep.placement).toBe("auto");
		expect(firstKnowledgeStep.before).toEqual(expect.any(Function));

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const knowledgeSectionSource = await fs.readFile(
			path.join(root, "components", "Sidebar", "KnowledgebaseSection.tsx"),
			"utf8",
		);

		expect(knowledgeSectionSource).toContain('data-tour="kb-add-button"');
	});

	it("keeps Joyride uncontrolled so modal hooks do not replay steps", async () => {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const providerSource = await fs.readFile(
			path.join(root, "components", "tour", "AppTourProvider.tsx"),
			"utf8",
		);

		expect(providerSource).not.toContain("stepIndex=");
		expect(providerSource).not.toContain("setStepIndex");
		expect(providerSource).toContain("tourRunId");
		expect(providerSource).toContain("const tourZIndex = 2147483000");
		expect(providerSource).toContain("zIndex: tourZIndex + 1");
	});

	it("uses chat-or-kanban task creation language in demo flows", () => {
		for (const tourId of ["sales-demo", "support-demo"] as const) {
			const steps = tourRegistry[tourId].steps;

			expect(steps[4].target).toBe('[data-tour="data-tab"]');
			expect(String(steps[4].content)).toMatch(/ask chat to create/i);
			expect(steps[4].before).toEqual(expect.any(Function));
			expect(steps[4].placement).toBe("bottom");
			expect(steps[5].target).toBe('[data-tour="kanban-add-task"]');
			expect(String(steps[5].content)).toMatch(/asking chat/i);
			expect(String(steps[5].content)).toMatch(/Add Task/i);
			expect(steps[5].before).toEqual(expect.any(Function));
		}
	});

	it("targets concrete kanban create, stop, and reconnect controls", async () => {
		const kanbanTargets = tourRegistry["actions-kanban"].steps.map((step) =>
			String(step.target),
		);

		expect(kanbanTargets).toEqual([
			'[data-tour="top-panel-toggle"]',
			'[data-tour="actions-tab"]',
			'[data-tour="kanban-add-task"]',
			'[data-tour="kanban-task-type"]',
			'[data-tour="kanban-manual-task-form"]',
			'[data-tour="kanban-ai-task-form"]',
			'[data-tour="kanban-ai-generate-preview"]',
			'[data-tour="kanban-board"]',
			'[data-tour="kanban-stop-task"]',
			'[data-tour="kanban-reconnect-task"]',
		]);

		for (const target of [
			'[data-tour="kanban-task-type"]',
			'[data-tour="kanban-manual-task-form"]',
			'[data-tour="kanban-ai-task-form"]',
			'[data-tour="kanban-ai-generate-preview"]',
			'[data-tour="kanban-stop-task"]',
			'[data-tour="kanban-reconnect-task"]',
		]) {
			const step = tourRegistry["actions-kanban"].steps.find(
				(candidate) => candidate.target === target,
			);
			expect(step?.before, target).toEqual(expect.any(Function));
		}

		const fs = await import("node:fs/promises");
		const path = await import("node:path");
		const root = process.cwd();
		const addTaskSource = await fs.readFile(
			path.join(
				root,
				"components",
				"kanban",
				"components",
				"new-task-dialog",
				"index.tsx",
			),
			"utf8",
		);
		const editTaskSource = await fs.readFile(
			path.join(
				root,
				"components",
				"kanban",
				"components",
				"EditTaskDialog.tsx",
			),
			"utf8",
		);
		const statusBarSource = await fs.readFile(
			path.join(
				root,
				"components",
				"kanban",
				"components",
				"card",
				"components",
				"AiStatusBar.tsx",
			),
			"utf8",
		);
		const mocksSource = await fs.readFile(
			path.join(root, "components", "kanban", "utils", "mocks.ts"),
			"utf8",
		);

		expect(addTaskSource).toContain("tour-open-kanban-manual-task-modal");
		expect(addTaskSource).toContain("tour-open-kanban-ai-task-modal");
		expect(addTaskSource).toContain("tour-close-kanban-task-modal");
		expect(editTaskSource).toContain('data-tour="kanban-task-modal"');
		expect(editTaskSource).toContain('data-tour="kanban-task-type"');
		expect(editTaskSource).toContain('data-tour="kanban-manual-task-form"');
		expect(editTaskSource).toContain('data-tour="kanban-ai-task-form"');
		expect(editTaskSource).toContain('data-tour="kanban-ai-generate-preview"');
		expect(editTaskSource).toContain("modal={false}");
		expect(editTaskSource).toContain("onInteractOutside");
		expect(editTaskSource).toContain("preventDefault()");
		expect(statusBarSource).toContain('data-tour="kanban-stop-task"');
		expect(statusBarSource).toContain('data-tour="kanban-reconnect-task"');
		expect(mocksSource).toContain('"task_2"');
		expect(mocksSource).toContain("wf_outreach_running_001");
	});
});
