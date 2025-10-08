import { http, HttpResponse } from "msw";

// Example mock data
const statsSummary = {
	usersOnline: 42,
	sessionsToday: 1234,
	cpuLoad: 0.23,
};

const bookmarks = [
	{
		id: "t1",
		title: "Project roadmap discussion",
		tags: ["intro"],
		lastMessage:
			"Let's prioritize the authentication features for the next sprint.",
	},
	{
		id: "y1",
		title: "Database Schema Design",
		tags: ["design"],
		lastMessage:
			"Let's add indexes to improve query performance on these tables.",
	},
];

export const handlers = [
	http.get("/api/mock/stats/summary", () => {
		return HttpResponse.json(statsSummary);
	}),

	http.get("/api/mock/bookmarks", () => {
		return HttpResponse.json(bookmarks);
	}),

	// Knowledge Base mock API (additive)
	http.get("/api/kb", () => {
		const list = [
			{
				id: "kb_text_1",
				name: "Team Onboarding",
				sourceType: "text",
				status: "synced",
			},
			{
				id: "kb_api_1",
				name: "Docs Site",
				sourceType: "api",
				status: "syncing",
			},
		];
		return HttpResponse.json(list);
	}),

	http.post("/api/kb", async ({ request }) => {
		const body = (await request.json()) as any;
		const id = `kb_${Date.now()}`;
		const item = {
			id,
			name: body.name ?? "Untitled KB",
			sourceType: body.type === "text" ? "text" : "api",
			status: body.type === "text" ? "synced" : "pending",
		};
		return HttpResponse.json(item, { status: 201 });
	}),

	http.post("/api/kb/test-connection", async () => {
		return HttpResponse.json({ ok: true });
	}),

	http.post("/api/kb/connect", async ({ request }) => {
		const body = (await request.json()) as any;
		const id = `kb_${Date.now()}`;
		return HttpResponse.json({ id, name: body.connectorKey ?? "API KB" });
	}),

	http.post("/api/kb/:id/sync", () => {
		return HttpResponse.json({ ok: true });
	}),
];
