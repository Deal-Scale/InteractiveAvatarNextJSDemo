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
];
