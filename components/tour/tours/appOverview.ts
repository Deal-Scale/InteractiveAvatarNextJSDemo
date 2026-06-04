import {
	openAppToursSection,
	openAvatarWorkspace,
	openBasicChatWorkspace,
	openBottomChatPanel,
	openChatSettingsForTour,
	openSidebar,
	openSidebarSection,
	prepareTopPanelTarget,
	showBottomChatPanelToggle,
} from "../tourHelpers";
import type { TourDefinition } from "../tourTypes";

export const appOverviewTour: TourDefinition = {
	id: "app-overview",
	title: "App overview",
	description: "Learn the sidebar, workspace, top panel, and core flows.",
	relatedTourIds: [
		"left-sidebar",
		"chats",
		"brain",
		"data-grid",
		"actions-kanban",
	],
	steps: [
		{
			target: '[data-tour="sidebar-header"]',
			content:
				"Use the sidebar to switch chats, manage assets, connect tools, and configure agents.",
			placement: "auto",
			skipBeacon: true,
			before: openSidebar,
		},
		{
			target: '[data-tour="new-chat"]',
			content: "Start a new chat and choose text, voice, or avatar mode.",
			placement: "auto",
			before: openSidebar,
		},
		{
			target: '[data-tour="bookmark-current"]',
			content:
				"Bookmark the current chat or live avatar session so it can be organized and reopened.",
			placement: "auto",
			before: openSidebar,
		},
		{
			target: '[data-tour="top-panel-tabs"]',
			content:
				"Use the top panel tabs to move between Brain, Data, and Actions workflows.",
			placement: "auto",
			before: () =>
				prepareTopPanelTarget("brain", '[data-tour="top-panel-tabs"]'),
		},
		{
			target: '[data-tour="live-avatar-tour-anchor"]',
			content:
				"Select an avatar, voice, and knowledge context here before starting a LiveAvatar video chat.",
			blockTargetInteraction: false,
			hideOverlay: true,
			placement: "bottom",
			before: openAvatarWorkspace,
		},
		{
			target: '[data-tour="basic-chat-tour-anchor"]',
			content:
				"Basic Chat lets you use text chat without starting a LiveAvatar session.",
			blockTargetInteraction: false,
			hideOverlay: true,
			placement: "bottom",
			before: openBasicChatWorkspace,
		},
		{
			target: '[data-tour="bottom-chat-panel-toggle"]',
			content:
				"Use this bottom chat toggle to reopen Basic Chat after the drawer is minimized.",
			placement: "top",
			before: showBottomChatPanelToggle,
		},
		{
			target: '[data-tour="bottom-chat-panel"]',
			content:
				"The bottom panel is the active Basic Chat drawer for messages, slash commands, attachments, and response controls.",
			placement: "center",
			before: openBottomChatPanel,
		},
		{
			target: '[data-tour="chat-settings"]',
			content:
				"Chat Settings lets you configure basic text chat, voice chat, and avatar chat before switching modes.",
			blockTargetInteraction: false,
			placement: "center",
			before: openChatSettingsForTour,
		},
		{
			target: '[data-tour="bookmarks"]',
			content:
				"Bookmarks save important chats or live avatar sessions with names, tags, and folders.",
			placement: "auto",
			before: () => openSidebarSection("bookmarks"),
		},
		{
			target: '[data-tour="assets"]',
			content:
				"Assets collect uploaded files and generated outputs you can attach to chat.",
			placement: "auto",
			before: () => openSidebarSection("assets"),
		},
		{
			target: '[data-tour="knowledge-base"]',
			content:
				"Knowledge bases organize markdown, text, and data files for chat and agent context.",
			placement: "auto",
			before: () => openSidebarSection("knowledge-base"),
		},
		{
			target: '[data-tour="tools"]',
			content:
				"Tools connect OAuth and API-key services that agents can use in workflows.",
			placement: "auto",
			before: () => openSidebarSection("tools"),
		},
		{
			target: '[data-tour="agents"]',
			content:
				"Agents package chat type, model, voice, video, context, and MCP tool settings.",
			placement: "auto",
			before: () => openSidebarSection("agents"),
		},
		{
			target: '[data-tour="app-tours"]',
			content:
				"App Tours lives in the left sidebar and launches guided flows for chats, bookmarks, assets, knowledge bases, tools, agents, and workspace panels.",
			placement: "auto",
			before: openAppToursSection,
		},
		{
			target: '[data-tour="active-sessions"]',
			content:
				"Active Sessions shows currently running LiveAvatar sessions that you can reopen.",
			placement: "auto",
			before: () => openSidebarSection("active-sessions"),
		},
		{
			target: '[data-tour="session-history"]',
			content:
				"Session History lists previous LiveAvatar sessions for review or continuation.",
			placement: "auto",
			before: () => openSidebarSection("session-history"),
		},
	],
};
