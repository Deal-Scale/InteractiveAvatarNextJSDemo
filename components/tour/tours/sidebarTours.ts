import {
	closeBookmarkAddModalAndShowSection,
	closeKnowledgeBaseAddModalAndShowSection,
	closeToolConnectionModalAndShowSection,
	openBookmarkAddModal,
	openBottomChatPanel,
	openKnowledgeBaseAddModal,
	openSidebar,
	openSidebarSection,
	openToolConnectionModal,
} from "../tourHelpers";
import type { TourDefinition } from "../tourTypes";

export const leftSidebarTour: TourDefinition = {
	id: "left-sidebar",
	title: "Left sidebar",
	description:
		"Tour Chats, Bookmarks, Assets, Knowledge Base, Tools, and Agents.",
	relatedTourIds: [
		"chats",
		"bookmarks",
		"assets",
		"knowledge-base",
		"tools",
		"agents",
	],
	steps: [
		{
			target: '[data-tour="sidebar-header"]',
			content:
				"The sidebar starts with search, quick actions, and the tour launcher.",
			placement: "right",
			skipBeacon: true,
			before: openSidebar,
		},
		{
			target: '[data-tour="chats-section"]',
			content:
				"Chats are grouped by recency and folder once chat folders are enabled.",
			placement: "right",
			before: () => openSidebarSection("chats"),
		},
		{
			target: '[data-tour="bookmarks"]',
			content:
				"Bookmarks save important chats or live sessions with names, tags, and folders.",
			placement: "right",
			before: () => openSidebarSection("bookmarks"),
		},
		{
			target: '[data-tour="assets"]',
			content: "Upload and attach reusable files from Assets.",
			placement: "right",
			before: () => openSidebarSection("assets"),
		},
		{
			target: '[data-tour="knowledge-base"]',
			content: "Upload documents or connect sources for contextual answers.",
			placement: "right",
			before: () => openSidebarSection("knowledge-base"),
		},
		{
			target: '[data-tour="tools"]',
			content: "Connect, reconnect, and disconnect API or OAuth tools.",
			placement: "right",
			before: () => openSidebarSection("tools"),
		},
		{
			target: '[data-tour="agents"]',
			content: "Create text, voice, or video agents and launch them in chat.",
			placement: "right",
			before: () => openSidebarSection("agents"),
		},
	],
};

export const bookmarksTour: TourDefinition = {
	id: "bookmarks",
	title: "Bookmarks",
	description: "Save chats with names, tags, folders, and nested folders.",
	steps: [
		{
			target: '[data-tour="bookmark-current"]',
			content: "Bookmark the current chat or live avatar session.",
			placement: "right",
			skipBeacon: true,
			before: openSidebar,
		},
		{
			target: '[data-tour="bookmark-modal"]',
			content:
				"Name the bookmark, choose an existing folder or create a new one, and add tags before saving.",
			blockTargetInteraction: false,
			placement: "center",
			before: openBookmarkAddModal,
		},
		{
			target: '[data-tour="bookmarks"]',
			content:
				"Saved bookmarks live here. Expand folders to reopen chats, move bookmarks, or delete saved items.",
			placement: "right",
			before: closeBookmarkAddModalAndShowSection,
		},
	],
};

export const assetsTour: TourDefinition = {
	id: "assets",
	title: "Assets",
	description: "Upload files, preview assets, and attach them to chat.",
	steps: [
		{
			target: '[data-tour="assets"]',
			content: "Use Assets to upload, preview, paginate, and attach files.",
			placement: "right",
			skipBeacon: true,
			before: () => openSidebarSection("assets"),
		},
		{
			target: '[data-tour="chat-input"]',
			content:
				"Attached assets appear in the composer before you send the message.",
			placement: "top",
			before: openBottomChatPanel,
		},
	],
};

export const knowledgeBaseTour: TourDefinition = {
	id: "knowledge-base",
	title: "Knowledge Base",
	description: "Upload context files and use them in chat or agents.",
	steps: [
		{
			target: '[data-tour="kb-add-button"]',
			content:
				"Start here to add a knowledge base, create folders, and upload markdown, text, or data files for context.",
			placement: "auto",
			skipBeacon: true,
			before: () => openSidebarSection("knowledge-base"),
		},
		{
			target: '[data-tour="kb-add-modal"]',
			content:
				"Use the Add Knowledge Base modal to select a folder, create a new folder, upload text files, paste markdown, or connect an external source.",
			blockTargetInteraction: false,
			placement: "center",
			before: openKnowledgeBaseAddModal,
		},
		{
			target: '[data-tour="knowledge-base"]',
			content:
				"Knowledge bases live here after creation. Use folders and item menus to organize context for chats and agents.",
			placement: "right",
			before: closeKnowledgeBaseAddModalAndShowSection,
		},
	],
};

export const toolsTour: TourDefinition = {
	id: "tools",
	title: "Tools",
	description: "Connect, disconnect, reconnect, and use external tools.",
	steps: [
		{
			target: '[data-tour="tools"]',
			content: "Search and filter tools by OAuth or API key.",
			placement: "right",
			skipBeacon: true,
			before: () => openSidebarSection("tools"),
		},
		{
			target: '[data-tour="tool-connect-modal"]',
			content:
				"Connect tools, review capabilities, disconnect, or reconnect stale credentials.",
			blockTargetInteraction: false,
			placement: "center",
			before: openToolConnectionModal,
		},
		{
			target: '[data-tour="tools"]',
			content:
				"Connected tools live here and can be used in chat or selected as MCP capabilities when creating agents.",
			placement: "right",
			before: closeToolConnectionModalAndShowSection,
		},
	],
};
