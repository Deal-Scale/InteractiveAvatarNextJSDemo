export type KBConnector = {
	key: string;
	name: string;
	description: string;
	icon?: unknown;
};

// Placeholder list used by the AddKnowledgeBaseModal grid
export const KB_CONNECTORS: KBConnector[] = [
	{
		key: "github",
		name: "GitHub Repo",
		description: "Index a repository's README and docs",
	},
	{ key: "notion", name: "Notion", description: "Sync pages and databases" },
	{
		key: "gdrive",
		name: "Google Drive",
		description: "Sync selected folders and docs",
	},
	{
		key: "crawler",
		name: "Web Crawler",
		description: "Crawl a website and ingest pages",
	},
	{
		key: "custom",
		name: "Custom API",
		description: "Bring your own source via API",
	},
];
