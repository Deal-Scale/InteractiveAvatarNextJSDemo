import type { TourId } from "./tourRegistry";

export type TourGroup = {
	id: string;
	title: string;
	description: string;
	tourIds: TourId[];
	accentClassName: string;
};

export const tourGroups: TourGroup[] = [
	{
		id: "start",
		title: "Start here",
		description: "App shell, sidebar, and chat basics.",
		tourIds: ["app-overview", "left-sidebar", "chats"],
		accentClassName:
			"border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
	},
	{
		id: "organize",
		title: "Organize work",
		description: "Bookmarks, assets, and knowledge bases.",
		tourIds: ["bookmarks", "assets", "knowledge-base"],
		accentClassName:
			"border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	},
	{
		id: "automation",
		title: "Agents and tools",
		description: "Connect tools and create agents.",
		tourIds: ["tools", "agents"],
		accentClassName:
			"border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
	},
	{
		id: "workspace",
		title: "Workspace panels",
		description: "Brain, Data, and Actions workflows.",
		tourIds: ["brain", "data-grid", "actions-kanban"],
		accentClassName:
			"border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
	},
	{
		id: "demo-flows",
		title: "Demo flows",
		description: "Sales and support walkthroughs.",
		tourIds: ["sales-demo", "support-demo"],
		accentClassName:
			"border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	},
];
