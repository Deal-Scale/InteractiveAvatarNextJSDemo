import type { ConversationGroup } from "../types";

const CACHE_KEY = "conversations.cache.v1";
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export function loadFromCache(): ConversationGroup[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: ConversationGroup[] };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveToCache(data: ConversationGroup[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

// Simulated fetch to demonstrate lazy load + caching
export async function fetchConversations(): Promise<ConversationGroup[]> {
  await new Promise((r) => setTimeout(r, 350));
  return [
    {
      period: "Today",
      conversations: [
        {
          id: "t1",
          title: "Project roadmap discussion",
          lastMessage: "Let's prioritize the authentication features for the next sprint.",
          timestamp: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: "t2",
          title: "API Documentation Review",
          lastMessage: "The endpoint descriptions need more detail about rate limiting.",
          timestamp: Date.now() - 5 * 60 * 60 * 1000,
        },
        {
          id: "t3",
          title: "Frontend Bug Analysis",
          lastMessage: "I found the issue - we need to handle the null state in the user profile component.",
          timestamp: Date.now() - 8 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Yesterday",
      conversations: [
        {
          id: "y1",
          title: "Database Schema Design",
          lastMessage: "Let's add indexes to improve query performance on these tables.",
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
        },
        {
          id: "y2",
          title: "Performance Optimization",
          lastMessage: "The lazy loading implementation reduced initial load time by 40%.",
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Last 7 days",
      conversations: [
        {
          id: "w1",
          title: "Authentication Flow",
          lastMessage: "We should implement the OAuth2 flow with refresh tokens.",
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
        {
          id: "w2",
          title: "Component Library",
          lastMessage: "These new UI components follow the design system guidelines perfectly.",
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        {
          id: "w3",
          title: "UI/UX Feedback",
          lastMessage: "The navigation redesign received positive feedback from the test group.",
          timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Last month",
      conversations: [
        {
          id: "m1",
          title: "Initial Project Setup",
          lastMessage: "All the development environments are now configured consistently.",
          timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
        },
      ],
    },
  ];
}
