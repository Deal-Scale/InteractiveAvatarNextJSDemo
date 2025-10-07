"use client";

import type {
	Conversation,
	ConversationGroup,
} from "@/components/Sidebar/types";

import { ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";

export default function ConversationsSection(props: {
	groups: ConversationGroup[];
	collapsedGroups: Set<string>;
	setCollapsedGroups: (updater: (prev: Set<string>) => Set<string>) => void;
	bookmarkedIds: Set<string>;
	selectionMode: boolean;
	selectedIds: Set<string>;
	toggleSelect: (id: string) => void;
	onSelect?: (c: Conversation) => void;
	openBookmarkModal: (id: string) => void;
	archivedIds: Set<string>;
}) {
	const {
		groups,
		collapsedGroups,
		setCollapsedGroups,
		bookmarkedIds,
		selectionMode,
		selectedIds,
		toggleSelect,
		onSelect,
		openBookmarkModal,
		archivedIds,
	} = props;

	return (
		<>
			{groups.map((group) => (
				<SidebarGroup key={group.period}>
					<button
						className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
						type="button"
						onClick={() =>
							setCollapsedGroups((prev) => {
								const next = new Set(prev);

								if (next.has(group.period)) next.delete(group.period);
								else next.add(group.period);

								return next;
							})
						}
					>
						<SidebarGroupLabel>{group.period}</SidebarGroupLabel>
						<ChevronRight
							className={`size-3 transition-transform ${collapsedGroups.has(group.period) ? "rotate-0" : "rotate-90"}`}
						/>
					</button>
					{!collapsedGroups.has(group.period) && (
						<SidebarMenu>
							{group.conversations
								.filter((c) => !archivedIds.has(c.id))
								.map((conversation) => {
									const isBookmarked = bookmarkedIds.has(conversation.id);
									const isSelected = selectedIds.has(conversation.id);

									return (
										<SidebarMenuButton
											key={conversation.id}
											className=""
											onClick={() => {
												if (selectionMode) toggleSelect(conversation.id);
												else onSelect?.(conversation);
											}}
										>
											<div className="flex w-full items-center gap-2">
												{selectionMode && (
													<input
														aria-label={
															isSelected
																? "Deselect conversation"
																: "Select conversation"
														}
														checked={isSelected}
														className="size-4 accent-primary"
														type="checkbox"
														onChange={() => toggleSelect(conversation.id)}
														onClick={(e) => e.stopPropagation()}
													/>
												)}
												<div className="min-w-0 flex-1 truncate pr-2">
													{conversation.title}
												</div>
												<button
													aria-label={
														isBookmarked ? "Edit bookmark" : "Add bookmark"
													}
													className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
													onClick={(e) => {
														e.stopPropagation();
														openBookmarkModal(conversation.id);
													}}
													type="button"
												>
													{isBookmarked ? (
														<BookmarkCheck className="size-4 text-primary" />
													) : (
														<Bookmark className="size-4" />
													)}
												</button>
											</div>
										</SidebarMenuButton>
									);
								})}
						</SidebarMenu>
					)}
				</SidebarGroup>
			))}
		</>
	);
}
