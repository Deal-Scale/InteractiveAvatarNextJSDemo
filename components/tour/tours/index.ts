import { agentsTour } from "./agents";
import { appOverviewTour } from "./appOverview";
import { chatsTour } from "./chats";
import {
	salesDemoTour,
	supportDemoTour,
} from "./demoTours";
import {
	assetsTour,
	bookmarksTour,
	knowledgeBaseTour,
	leftSidebarTour,
	toolsTour,
} from "./sidebarTours";
import {
	actionsKanbanTour,
	brainTour,
	dataGridTour,
} from "./workspaceTours";
import type { TourDefinition } from "../tourTypes";

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
