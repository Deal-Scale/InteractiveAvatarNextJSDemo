import type React from "react";

export const TOUR_IDS = [
	"app-overview",
	"left-sidebar",
	"chats",
	"bookmarks",
	"assets",
	"knowledge-base",
	"tools",
	"agents",
	"agent-manager",
	"campaigns",
	"lead-list",
	"kanban",
	"chat",
	"connections",
	"charts",
	"calculations",
	"resources",
	"deal-room",
	"employee",
	"brain",
	"data-grid",
	"actions-kanban",
	"sales-demo",
	"support-demo",
] as const;

export type TourId = (typeof TOUR_IDS)[number];

export type TourStep = {
	target: string;
	content: React.ReactNode;
	placement?: "auto" | "bottom" | "center" | "left" | "right" | "top";
	disableBeacon?: boolean;
	skipBeacon?: boolean;
	hideOverlay?: boolean;
	blockTargetInteraction?: boolean;
	before?: () => Promise<void> | void;
};

export type TourDefinition = {
	id: TourId;
	title: string;
	description: string;
	relatedTourIds?: TourId[];
	steps: TourStep[];
};
