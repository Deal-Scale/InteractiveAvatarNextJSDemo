import { agentsTour } from "@/components/tour/tours/agents";
import { appOverviewTour } from "@/components/tour/tours/appOverview";
import { chatsTour } from "@/components/tour/tours/chats";
import {
	salesDemoTour,
	supportDemoTour,
} from "@/components/tour/tours/demoTours";
import {
	assetsTour,
	bookmarksTour,
	knowledgeBaseTour,
	leftSidebarTour,
	toolsTour,
} from "@/components/tour/tours/sidebarTours";
import {
	actionsKanbanTour,
	brainTour,
	dataGridTour,
} from "@/components/tour/tours/workspaceTours";
import type { TourDefinition } from "@/components/tour/tourTypes";

export const tourDefinitions: TourDefinition[] = [
	appOverviewTour,
	leftSidebarTour,
	chatsTour,
	bookmarksTour,
	assetsTour,
	knowledgeBaseTour,
	toolsTour,
	agentsTour,
	brainTour,
	dataGridTour,
	actionsKanbanTour,
	salesDemoTour,
	supportDemoTour,
];
