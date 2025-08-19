export const queryKeys = {
	avatars: {
		list: ["avatars", "list"] as const,
	},
	voices: {
		list: ["voices", "list"] as const,
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
	auth: {
		accessToken: ["auth", "access-token"] as const,
	},
} as const;
