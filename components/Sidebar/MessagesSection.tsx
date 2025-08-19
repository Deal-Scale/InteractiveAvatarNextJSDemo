"use client";

import { ChevronRight } from "lucide-react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ConversationsSection from "@/components/Sidebar/ConversationsSection";
import { formatCompactNumber } from "@/components/Sidebar/utils/format";
import type {
	Conversation,
	ConversationGroup,
} from "@/components/Sidebar/types";

export default function MessagesSection(props: {
	collapsedMessages: boolean;
	setCollapsedMessages: (fn: (v: boolean) => boolean) => void;
	// conversations data and handlers
	groups: ConversationGroup[];
	archivedIds: Set<string>;
	bookmarkedIds: Set<string>;
	collapsedGroups: Set<string>;
	setCollapsedGroups: (updater: (prev: Set<string>) => Set<string>) => void;
	selectionMode: boolean;
	selectedIds: Set<string>;
	toggleSelect: (id: string) => void;
	onSelect?: (c: Conversation) => void;
	openBookmarkModal: (id: string) => void;
	// meta for controls
	totalCount: number;
	archivedCount: number;
	visibleConversationIds: string[];
	clearSelection: () => void;
	setSelectionMode: (v: boolean) => void;
	setSelectedIds: (s: Set<string>) => void;
}) {
	const {
		collapsedMessages,
		setCollapsedMessages,
		groups,
		archivedIds,
		bookmarkedIds,
		collapsedGroups,
		setCollapsedGroups,
		selectionMode,
		selectedIds,
		toggleSelect,
		onSelect,
		openBookmarkModal,
		totalCount,
		archivedCount,
		visibleConversationIds,
		clearSelection,
		setSelectionMode,
		setSelectedIds,
	} = props;

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
				type="button"
				onClick={() => setCollapsedMessages((v) => !v)}
			>
				<SidebarGroupLabel>Messages</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedMessages ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedMessages && (
				<div className="pt-2">
					{/* Selection Toggle */}
					<div className="px-2 pb-2 group-data-[state=collapsed]/sidebar:hidden">
						<Button
							className="w-full justify-center border border-border hover:bg-muted"
							disabled={!groups || visibleConversationIds.length === 0}
							variant="outline"
							onClick={() => {
								if (selectionMode) {
									clearSelection();
									setSelectionMode(false);
								} else {
									setSelectionMode(true);
									setSelectedIds(new Set(visibleConversationIds));
								}
							}}
						>
							{selectionMode ? "Deselect All" : "Select Visible"}
						</Button>
					</div>

					{/* Counts */}
					<div className="px-2 pb-1 text-center text-xs group-data-[state=collapsed]/sidebar:hidden">
						<span className="inline-block px-1 bg-aurora bg-clip-text text-transparent">
							{formatCompactNumber(totalCount)} conversations •{" "}
							{formatCompactNumber(archivedCount)} archived
						</span>
					</div>

					{/* List of conversation groups */}
					<ConversationsSection
						archivedIds={archivedIds}
						bookmarkedIds={bookmarkedIds}
						collapsedGroups={collapsedGroups}
						groups={groups}
						openBookmarkModal={openBookmarkModal}
						selectedIds={selectedIds}
						selectionMode={selectionMode}
						setCollapsedGroups={setCollapsedGroups}
						toggleSelect={toggleSelect}
						onSelect={onSelect}
					/>
				</div>
			)}
		</SidebarGroup>
	);
}
