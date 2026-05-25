import { expect, test } from "@playwright/test";

async function openChatSettingsTours(page: import("@playwright/test").Page) {
	await page.goto("/");

	const chatSettings = page
		.getByRole("button", {
			exact: true,
			name: "App Tours",
		})
		.last();
	await expect(chatSettings).toBeVisible();
	const tourFolder = page
		.getByText(/Start here|Organize work|Agents and tools/)
		.first();
	for (let attempt = 0; attempt < 12; attempt += 1) {
		if (await tourFolder.isVisible().catch(() => false)) break;
		await chatSettings.scrollIntoViewIfNeeded();
		await chatSettings.click({ force: true });
		await page.waitForTimeout(500);
	}
	await expect(tourFolder).toBeVisible();
}

async function startTour(
	page: import("@playwright/test").Page,
	title: string,
	description: RegExp,
) {
	await openChatSettingsTours(page);

	const groupTitle =
		title === "Tools" || title === "Agents"
			? "Agents and tools"
			: title === "Bookmarks" || title === "Knowledge Base"
				? "Organize work"
				: "Start here";
	const groupButton = page.getByRole("button", {
		name: new RegExp(groupTitle, "i"),
	});
	const isTourVisible = await page
		.locator("button")
		.filter({ hasText: title })
		.filter({ hasText: description })
		.isVisible()
		.catch(() => false);
	if (!isTourVisible) {
		await groupButton.click();
	}

	const tourButton = page
		.locator("button")
		.filter({ hasText: title })
		.filter({ hasText: description });

	await expect(tourButton).toBeVisible();
	await tourButton.click();
}

async function clickTourPrimary(page: import("@playwright/test").Page) {
	const tooltip = page.locator('[role="alertdialog"]').last();
	await expect(tooltip).toBeVisible();

	const button = tooltip.getByRole("button", {
		name: /^(next|last|finish)/i,
	});

	await expect(button).toBeVisible();
	await expect(button).toBeEnabled();
	await button.click();
}

test.describe("guided tour modal steps", () => {
	test("app overview centers the live avatar workspace step", async ({
		page,
	}) => {
		await startTour(page, "App overview", /sidebar, workspace/i);

		await expect(page.getByText("Use the sidebar to switch")).toBeVisible();
		await clickTourPrimary(page);
		await expect(page.getByText("Start a new chat")).toBeVisible();
		await clickTourPrimary(page);
		await expect(page.getByText("Bookmark the current chat")).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("Use the top panel tabs to move between Brain"),
		).toBeVisible();
		await expect(page.locator('[data-tour="top-panel-tabs"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("Select an avatar, voice, and knowledge context"),
		).toBeVisible();
		await expect(page.getByText("Basic Chat", { exact: true })).toHaveCount(0);
		await expect(page.getByRole("region", { name: "Chat drawer" })).toHaveCount(
			0,
		);
		await expect(
			page.getByRole("button", { name: "Open chat drawer" }),
		).toHaveCount(0);
		await expect(
			page.getByText("Select an avatar to start session"),
		).toBeVisible();
		const card = page.locator('[data-tour="live-avatar-start-card"]');
		await expect(card).toBeVisible();
		const target = page.locator('[data-tour="live-avatar-tour-anchor"]');
		await expect(target).toBeVisible();
		const box = await card.boundingBox();
		const viewport = page.viewportSize();
		expect(box).not.toBeNull();
		expect(viewport).not.toBeNull();
		if (box && viewport) {
			expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(
				120,
			);
			expect(
				Math.abs(box.y + box.height / 2 - viewport.height / 2),
			).toBeLessThan(120);
		}
		const tooltipBox = await page
			.locator('[role="alertdialog"]')
			.last()
			.boundingBox();
		if (box && tooltipBox && viewport) {
			expect(tooltipBox.x).toBeGreaterThanOrEqual(0);
			expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(
				viewport.width,
			);
			expect(tooltipBox.x + tooltipBox.width / 2).toBeGreaterThan(box.x - 80);
			expect(tooltipBox.x + tooltipBox.width / 2).toBeLessThan(
				box.x + box.width + 80,
			);
			expect(tooltipBox.y + tooltipBox.height).toBeLessThanOrEqual(
				box.y + box.height * 0.35,
			);
		}

		await clickTourPrimary(page);
		await expect(
			page.getByText(
				"Basic Chat lets you use text chat without starting a LiveAvatar session.",
			),
		).toBeVisible();
		await expect(page.getByText("Basic Chat", { exact: true })).toBeVisible();
		await expect(page.locator('[data-tour="basic-chat-card"]')).toBeVisible();
		await expect(
			page.locator('[data-tour="basic-chat-tour-anchor"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("Use this bottom chat toggle to reopen Basic Chat"),
		).toBeVisible();
		await expect(page.getByRole("region", { name: "Chat drawer" })).toHaveCount(
			0,
		);
		await expect(
			page.getByRole("button", { name: "Open chat drawer" }),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="bottom-chat-panel-toggle"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("The bottom panel is the active Basic Chat drawer"),
		).toBeVisible();
		await expect(
			page.getByRole("region", { name: "Chat drawer" }),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByRole("dialog", { name: "Chat Settings" }),
		).toBeVisible();
		await expect(
			page.getByText("Chat Settings lets you configure basic text chat"),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByRole("dialog", { name: "Chat Settings" }),
		).toBeHidden();
		await expect(
			page.getByText("Bookmarks save important chats"),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Assets collect uploaded files")).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("Knowledge bases organize markdown"),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Tools connect OAuth")).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Agents package chat type")).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("App Tours lives in the left sidebar"),
		).toBeVisible();
		await expect(page.locator('[data-tour="app-tours"]')).toBeVisible();
	});

	test("bookmark modal allows tour navigation and then shows bookmarks section", async ({
		page,
	}) => {
		await startTour(page, "Bookmarks", /Save chats/i);

		await expect(page.getByText("Bookmark the current chat")).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /add bookmark|edit bookmark/i }),
		).toBeVisible();
		await page.getByPlaceholder("Current chat").fill("Tour test bookmark");
		await expect(page.getByPlaceholder("Current chat")).toHaveValue(
			"Tour test bookmark",
		);

		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /add bookmark|edit bookmark/i }),
		).toBeHidden();
		await expect(page.getByText("Saved bookmarks live here")).toBeVisible();
	});

	test("knowledge base modal allows tour navigation and then shows knowledge base section", async ({
		page,
	}) => {
		await startTour(page, "Knowledge Base", /Upload context files/i);

		await expect(
			page.getByText("Start here to add a knowledge base"),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /add knowledge base/i }),
		).toBeVisible();
		await page.getByPlaceholder("My Docs").fill("Tour test knowledge");
		await expect(page.getByPlaceholder("My Docs")).toHaveValue(
			"Tour test knowledge",
		);

		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /add knowledge base/i }),
		).toBeHidden();
		await expect(page.getByText("Knowledge bases live here")).toBeVisible();
	});

	test("tools modal allows tour navigation and then returns to tools", async ({
		page,
	}) => {
		await startTour(page, "Tools", /Connect, disconnect/i);

		await expect(page.getByText("Search and filter tools")).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /connect tool/i }),
		).toBeVisible();
		await page.getByPlaceholder("Search tools").last().fill("slack");
		await expect(page.getByPlaceholder("Search tools").last()).toHaveValue(
			"slack",
		);

		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /connect tool/i }),
		).toBeHidden();
		await expect(page.getByText("Connected tools live here")).toBeVisible();
	});

	test("agent create modal allows tour navigation and then returns to agents", async ({
		page,
	}) => {
		await startTour(page, "Agents", /Create text/i);

		await expect(page.getByText("Agents live in the sidebar")).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Create a new agent")).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /create agent/i }),
		).toBeVisible();
		const agentNameInput = page
			.getByRole("dialog", { name: /create agent/i })
			.getByRole("textbox")
			.first();
		await agentNameInput.fill("Tour test agent");
		await expect(agentNameInput).toHaveValue("Tour test agent");

		await clickTourPrimary(page);
		await expect(
			page.getByText("Profile defines the agent name"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-profile"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("Context controls the text provider"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-context"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(
			page.getByText("Voice settings appear for voice-capable agents"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-voice"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Video mode is exclusive")).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-video"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Tools selects MCP servers")).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-tools"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("Monetization is optional")).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-section-monetization"]'),
		).toBeVisible();

		await clickTourPrimary(page);
		await expect(page.getByText("When monetization is enabled")).toBeVisible();
		await expect(
			page.locator('[data-tour="agent-monetization-summary"]'),
		).toBeVisible();

		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /create agent/i }),
		).toBeHidden();
		await expect(page.getByText("Created agents appear here")).toBeVisible();
	});

	test("brain tour collapses controls then shows graph and controls", async ({
		page,
	}) => {
		await startTour(page, "Brain tab", /knowledge graph/i);

		await expect(
			page.getByRole("button", { name: "Show controls" }),
		).toBeVisible();
		await expect(page.getByText("Open the top panel when Brain")).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Switch to Brain")).toBeVisible();
		await expect(page.locator('[data-tour="brain-tab"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Use the graph to inspect")).toBeVisible();
		await expect(page.locator('[data-tour="brain-graph"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Use graph controls")).toBeVisible();
		await expect(page.locator('[data-tour="brain-controls"]')).toBeVisible();
	});

	test("data grid tour collapses controls and keeps panel steps visible", async ({
		page,
	}) => {
		await startTour(page, "Data grid", /Mermaid charts/i);

		await expect(
			page.getByRole("button", { name: "Show controls" }),
		).toBeVisible();
		await expect(
			page.getByText("Open the top panel before using Data"),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Open Data to view charts")).toBeVisible();
		await expect(page.locator('[data-tour="data-tab"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("This example Mermaid chart is rendered in chat"),
		).toBeVisible();
		await expect(page.locator('[data-tour="mermaid-actions"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Use Add to Grid")).toBeVisible();
		await expect(
			page.locator('[data-tour="mermaid-add-to-grid"]'),
		).toBeVisible();
		await page.waitForTimeout(300);
		await expect(
			page.locator('[data-tour="mermaid-add-to-grid"]'),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("The Mermaid chart now appears")).toBeVisible();
		await expect(
			page.locator('[data-tour="data-grid-layout-controls"]'),
		).toBeVisible();
		await expect(page.getByText("Tour Mermaid Flow")).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("Resize charts from this bottom-right"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="data-grid-resize-handle"]'),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Built-in non-Mermaid tables")).toBeVisible();
		await expect(
			page.locator('[data-tour="data-grid-remove-builtin"]').first(),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("Removed built-in tables appear here"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="data-grid-restore-builtin"]'),
		).toBeVisible();
	});

	test("actions kanban tour collapses controls and keeps panel steps visible", async ({
		page,
	}) => {
		await startTour(page, "Actions Kanban", /AI\/manual tasks/i);

		await expect(
			page.getByRole("button", { name: "Show controls" }),
		).toBeVisible();
		await expect(
			page.getByText("Open the top panel before using Actions"),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Open Actions to manage")).toBeVisible();
		await expect(page.locator('[data-tour="actions-tab"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Use Add Task to create")).toBeVisible();
		await expect(page.locator('[data-tour="kanban-add-task"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByRole("dialog", { name: /create task/i }),
		).toBeVisible();
		await expect(page.getByText("Choose Manual when a person")).toBeVisible();
		await expect(page.locator('[data-tour="kanban-task-type"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Manual tasks use the standard")).toBeVisible();
		await expect(
			page.locator('[data-tour="kanban-manual-task-form"]'),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("AI tasks add agent selection")).toBeVisible();
		await expect(
			page.locator('[data-tour="kanban-ai-task-form"]'),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Generate Preview builds")).toBeVisible();
		await expect(
			page.locator('[data-tour="kanban-ai-generate-preview"]'),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Drag tasks between columns")).toBeVisible();
		await expect(
			page.getByRole("dialog", { name: /create task/i }),
		).toBeHidden();
		await expect(page.locator('[data-tour="kanban-board"]')).toBeVisible();
		await clickTourPrimary(page);

		await expect(
			page.getByText("Stop or cancel a running AI task"),
		).toBeVisible();
		await expect(
			page.locator('[data-tour="kanban-stop-task"]').first(),
		).toBeVisible();
		await clickTourPrimary(page);

		await expect(page.getByText("Reconnect, retry, or resolve")).toBeVisible();
		await expect(
			page.locator('[data-tour="kanban-reconnect-task"]').first(),
		).toBeVisible();
	});
});
