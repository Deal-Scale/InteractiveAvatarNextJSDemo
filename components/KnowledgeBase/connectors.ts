export type KBConnectorAuth =
	| {
			type: "apiKey";
			fields: Array<{
				key: string;
				label: string;
				secret?: boolean;
				placeholder?: string;
			}>;
	  }
	| { type: "oauth"; authUrl: string; scopes?: string[] };

export type KBConnector = {
	key: string;
	name: string;
	description: string;
	icon?: unknown;
	auth: KBConnectorAuth;
};

// Placeholder list used by the AddKnowledgeBaseModal grid
export const KB_CONNECTORS: KBConnector[] = [
	// OAuth example
	{
		key: "github",
		name: "GitHub Repo",
		description: "Index a repository's README and docs",
		auth: {
			type: "oauth",
			authUrl: "https://github.com/login/oauth/authorize",
			scopes: ["repo", "read:org"],
		},
	},
	// OAuth example
	{
		key: "notion",
		name: "Notion",
		description: "Sync pages and databases",
		auth: {
			type: "oauth",
			authUrl: "https://api.notion.com/v1/oauth/authorize",
			scopes: ["read", "databases.read"],
		},
	},
	// OAuth example
	{
		key: "gdrive",
		name: "Google Drive",
		description: "Sync selected folders and docs",
		auth: {
			type: "oauth",
			authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
			scopes: ["https://www.googleapis.com/auth/drive.readonly"],
		},
	},
	// API Key example
	{
		key: "crawler",
		name: "Web Crawler",
		description: "Crawl a website and ingest pages",
		auth: {
			type: "apiKey",
			fields: [
				{ key: "apiKey", label: "API Key", placeholder: "Enter API key" },
				{
					key: "apiSecret",
					label: "API Secret",
					secret: true,
					placeholder: "Enter API secret",
				},
			],
		},
	},
	// API Key example
	{
		key: "custom",
		name: "Custom API",
		description: "Bring your own source via API",
		auth: {
			type: "apiKey",
			fields: [
				{
					key: "endpoint",
					label: "Endpoint",
					placeholder: "https://api.example.com",
				},
				{ key: "apiKey", label: "API Key" },
			],
		},
	},
];
