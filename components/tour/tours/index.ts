import type { TourDefinition } from "../tourTypes";
import { agentsTour } from "./agents";
import { appOverviewTour } from "./appOverview";
import { chatsTour } from "./chats";
import {
	agentManagerTour,
	calculationsTour,
	campaignsTour,
	chartsTour,
	chatTour,
	connectionsTour,
	dealRoomTour,
	employeeTour,
	kanbanTour,
	leadListTour,
	profileTour,
	resourcesTour,
} from "./dashboardRoutes";
import { salesDemoTour, supportDemoTour } from "./demoTours";
import {
	assetsTour,
	bookmarksTour,
	knowledgeBaseTour,
	leftSidebarTour,
	toolsTour,
} from "./sidebarTours";
import { actionsKanbanTour, brainTour, dataGridTour } from "./workspaceTours";

export const tourDefinitions: TourDefinition[] = [
	appOverviewTour,
	leftSidebarTour,
	chatsTour,
	bookmarksTour,
	assetsTour,
	knowledgeBaseTour,
	toolsTour,
	agentsTour,
	agentManagerTour,
	campaignsTour,
	leadListTour,
	kanbanTour,
	chatTour,
	connectionsTour,
	chartsTour,
	calculationsTour,
	resourcesTour,
	dealRoomTour,
	employeeTour,
	profileTour,
	brainTour,
	dataGridTour,
	actionsKanbanTour,
	salesDemoTour,
	supportDemoTour,
];
