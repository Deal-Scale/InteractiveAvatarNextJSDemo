import { http, HttpResponse } from "msw";

// Example mock data
const statsSummary = {
  usersOnline: 42,
  sessionsToday: 1234,
  cpuLoad: 0.23,
};

const bookmarks = [
  { id: "1", title: "Welcome", tags: ["intro"], lastMessage: "Hello" },
  { id: "2", title: "About", tags: ["info"], lastMessage: "Details" },
];

export const handlers = [
  http.get("/api/mock/stats/summary", () => {
    return HttpResponse.json(statsSummary);
  }),

  http.get("/api/mock/bookmarks", () => {
    return HttpResponse.json(bookmarks);
  }),
];
