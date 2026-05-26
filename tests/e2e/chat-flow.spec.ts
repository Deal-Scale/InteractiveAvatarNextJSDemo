import { expect, type Page, test } from "@playwright/test";

const CHAT_REPLY =
	"Playwright stub reply: markdown **works**, actions render, and chat stays usable.";
const CHAT_REPLY_VISIBLE =
	"Playwright stub reply: markdown works, actions render, and chat stays usable.";

async function openBasicChat(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem("chat_provider_mode:text:v2", "pollinations");
		window.localStorage.setItem("chat_provider_mode:voice", "elevenlabs");
		window.localStorage.setItem(
			"chat_provider_settings:voice",
			JSON.stringify({ autoSpeak: false, voiceEnabled: false }),
		);
	});

	await page.route(
		"**/api/pollinations/text/chat-completion",
		async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					choices: [
						{
							message: {
								content: CHAT_REPLY,
							},
						},
					],
				}),
			});
		},
	);

	await page.goto("/");
	await expect(page.getByRole("textbox", { name: "Chat input" })).toBeVisible();
	await expect(page.getByText("Waiting to start session...")).toHaveCount(0);
	await expect(page.getByText("Start chat without session")).toHaveCount(0);
}

async function sendChatMessage(page: Page, message: string) {
	const input = page.getByRole("textbox", { name: "Chat input" });
	await input.fill(message);
	await expect(input).toHaveValue(message);

	await page.getByRole("button", { name: "Send message" }).click();

	await expect(input).toHaveValue("");
	await expect(
		page.getByLabel(/User message/i).filter({ hasText: message }),
	).toBeVisible();
	await expect(
		page.getByLabel(/Avatar message/i).filter({ hasText: CHAT_REPLY_VISIBLE }),
	).toBeVisible();
}

test.describe("basic chat flow", () => {
	test("starts in usable basic chat without requiring an avatar session", async ({
		page,
	}) => {
		await openBasicChat(page);

		await expect(page.getByText("Basic Chat")).toBeVisible();
		await expect(
			page.getByRole("region", { name: "Chat drawer" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Open commands" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Attach files" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Send message" }),
		).toBeEnabled();
	});

	test("sends a text message through the selected provider and renders the reply", async ({
		page,
	}) => {
		await openBasicChat(page);

		await sendChatMessage(page, "E2E chat smoke message");

		await expect(
			page.getByRole("button", { name: "Upvote response" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Downvote response" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Upvote response" }).first().click();
		await page
			.getByRole("button", { name: "Downvote response" })
			.first()
			.click();
	});

	test("opens slash commands from the chat input", async ({ page }) => {
		await openBasicChat(page);

		await page.getByRole("button", { name: "Open commands" }).click();
		await expect(
			page.getByRole("listbox", { name: "Slash command palette" }),
		).toBeVisible();

		await page.keyboard.press("Escape");
		await expect(
			page.getByRole("listbox", { name: "Slash command palette" }),
		).toBeHidden();
	});

	test("loads a user message back into the input for editing", async ({
		page,
	}) => {
		await openBasicChat(page);
		const draft = "E2E edit this exact user message";

		await sendChatMessage(page, draft);
		await page.getByRole("button", { name: "Edit into input" }).first().click();

		await expect(page.getByRole("textbox", { name: "Chat input" })).toHaveValue(
			draft,
		);
		await expect(
			page.getByRole("button", { name: "Confirm edit and send" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Cancel editing" }),
		).toBeVisible();
	});

	test("opens branch-to-agent from an assistant response", async ({ page }) => {
		await openBasicChat(page);
		await sendChatMessage(page, "E2E branch this response");

		await page.getByRole("button", { name: "Branch to agent" }).first().click();
		await expect(
			page.getByRole("dialog", { name: "Branch to agent" }),
		).toBeVisible();
		await expect(
			page.getByText("Original AI response", { exact: true }),
		).toBeVisible();
		await expect(
			page.getByPlaceholder(
				"Describe what the agent should do with this response",
			),
		).toBeVisible();
	});
});

test.describe("chat guided tour", () => {
	test("walks through concrete chat controls after the sidebar intro", async ({
		page,
	}) => {
		await openBasicChat(page);
		const input = page.getByRole("textbox", { name: "Chat input" });
		await input.fill("stale tour draft");
		await expect(input).toHaveValue("stale tour draft");

		await page.getByRole("button", { name: "Minimize chat" }).click();
		await expect(
			page.getByRole("button", { name: "Open chat drawer" }),
		).toBeVisible();

		const chatSettings = page
			.getByRole("button", { exact: true, name: "App Tours" })
			.last();
		await chatSettings.scrollIntoViewIfNeeded();
		await chatSettings.click({ force: true });

		const chatsTour = page
			.locator("button")
			.filter({ hasText: "Chats" })
			.filter({ hasText: /Use chat panels/i });
		await expect(chatsTour).toBeVisible();
		await chatsTour.click();

		const tooltip = page.locator('[role="alertdialog"]').last();
		await expect(tooltip).toContainText("Start a fresh chat");
		await tooltip.getByRole("button", { name: /^next/i }).click();

		await expect(page.locator('[role="alertdialog"]').last()).toContainText(
			"The bottom chat panel is open and ready",
		);
		await expect(
			page.getByRole("textbox", { name: "Chat input" }),
		).toBeVisible();
		await expect(page.getByRole("textbox", { name: "Chat input" })).toHaveValue(
			"",
		);
		await expect(
			page.getByRole("button", { name: "Open commands" }),
		).toBeVisible();

		const expectedStepText = [
			"Type messages here",
			"Slash commands can add knowledge bases",
			"Use Retry to regenerate",
			"Copy response text",
			"Upvote useful responses",
			"Downvote weak responses",
			"Branch or restream",
			"Click the speaker button",
			"Mermaid chart actions",
			"Choose Add to Grid",
		];

		for (const text of expectedStepText) {
			await page
				.locator('[role="alertdialog"]')
				.last()
				.getByRole("button", { name: /^next/i })
				.click();
			await expect(page.locator('[role="alertdialog"]').last()).toContainText(
				text,
			);
		}
	});
});
