export const queryKeys = {
	avatars: {
		list: ["avatars", "list"] as const,
	},
	voices: {
		list: ["voices", "list"] as const,
	},
	sessions: {
		active: ["sessions", "active"] as const,
		history: (params?: string) =>
			["sessions", "history", params ?? "default"] as const,
	},
	bookmarks: {
		list: ["bookmarks", "list"] as const,
		detail: (id: string) => ["bookmarks", "detail", id] as const,
	},
	stats: {
		summary: ["stats", "summary"] as const,
	},
	mcp: {
		tools: ["mcp", "tools"] as const,
		prompts: ["mcp", "prompts"] as const,
		resources: ["mcp", "resources"] as const,
	},
	assets: {
		list: ["assets", "list"] as const,
		upload: (sessionId?: string) =>
			["assets", "upload", sessionId ?? "default"] as const,
	},
	kb: {
		list: ["kb", "list"] as const,
		detail: (id: string) => ["kb", "detail", id] as const,
	},
	auth: {
		accessToken: ["auth", "access-token"] as const,
	},
} as const;
