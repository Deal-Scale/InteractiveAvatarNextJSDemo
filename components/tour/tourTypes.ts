import type { Step } from "react-joyride";

export const TOUR_IDS = [
	"app-overview",
	"left-sidebar",
	"chats",
	"bookmarks",
	"assets",
	"knowledge-base",
	"tools",
	"agents",
	"brain",
	"data-grid",
	"actions-kanban",
	"sales-demo",
	"support-demo",
] as const;

export type TourId = (typeof TOUR_IDS)[number];

export type TourDefinition = {
	id: TourId;
	title: string;
	description: string;
	relatedTourIds?: TourId[];
	steps: Step[];
};
