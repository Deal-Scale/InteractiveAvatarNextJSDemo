"use client";

import React, { useMemo } from "react";
import { ChevronRight, MoreVertical } from "lucide-react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
	File,
	Folder,
	Tree,
	type TreeViewElement,
} from "@/components/magicui/file-tree";
import type { Conversation } from "@/components/Sidebar/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export default function BookmarksSection(props: {
	collapsedBookmarks: boolean;
	setCollapsedBookmarks: (fn: (v: boolean) => boolean) => void;
	bookmarkedIds: Set<string>;
	bookmarkFolders: Array<{ id: string; name: string }>;
	bookmarkMeta: Record<
		string,
		{ folderId?: string; tags?: string[] } | undefined
	>;
	conversationsById: Record<string, Conversation | undefined>;
	onOpenChat?: (c: Conversation) => void;
	onOpenBookmarkMove?: (id: string) => void;
}) {
	const {
		collapsedBookmarks,
		setCollapsedBookmarks,
		bookmarkedIds,
		bookmarkFolders,
		bookmarkMeta,
		conversationsById,
		onOpenChat,
		onOpenBookmarkMove,
	} = props;

	const tree: TreeViewElement[] = useMemo(() => {
		const folders: Record<string, TreeViewElement> = {};

		// initialize folders
		for (const f of bookmarkFolders || []) {
			folders[f.id] = { id: f.id, name: f.name, children: [] };
		}

		const uncategorized: TreeViewElement = {
			id: "__uncategorized__",
			name: "Uncategorized",
			children: [],
		};

		for (const id of Array.from(bookmarkedIds || [])) {
			const conv = conversationsById[id];
			if (!conv) continue;

			const node: TreeViewElement = {
				id: conv.id,
				name: conv.title,
			};

			const meta = bookmarkMeta[id];
			const folderId = meta?.folderId;

			if (folderId && folders[folderId]) {
				folders[folderId].children = folders[folderId].children || [];
				folders[folderId].children!.push(node);
			} else {
				uncategorized.children!.push(node);
			}
		}

		const result = Object.values(folders).sort((a, b) =>
			a.name.localeCompare(b.name),
		);
		if (uncategorized.children && uncategorized.children.length > 0) {
			result.push(uncategorized);
		}
		return result;
	}, [bookmarkFolders, bookmarkedIds, bookmarkMeta, conversationsById]);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedBookmarks((v) => !v)}
			>
				<SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedBookmarks ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedBookmarks && (
				<div className="px-2 pb-2">
					{tree.length === 0 ? (
						<div className="px-1 py-2 text-xs text-muted-foreground">
							No bookmarks yet
						</div>
					) : (
						<Tree className="text-xs">
							{tree.map((folder) => (
								<Folder key={folder.id} element={folder.name} value={folder.id}>
									{(folder.children || []).map((child) => (
										<div
											key={child.id}
											className="flex min-w-0 items-center justify-between gap-1"
										>
											<div className="min-w-0 flex-1">
												<File
													className="min-w-0 flex-1 pr-2"
													value={child.id}
													onClick={() => {
														const c = conversationsById[child.id];
														if (c) onOpenChat?.(c);
													}}
												>
													<span className="block truncate whitespace-nowrap max-w-[calc(100%-3.75rem)]">
														{child.name}
													</span>
												</File>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button
														type="button"
														aria-label="Bookmark actions"
														className="shrink-0 rounded-md border border-border bg-card p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
														onClick={(e) => e.stopPropagation()}
													>
														<MoreVertical className="size-3" />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													className="z-50 min-w-[12rem] rounded-md border border-border bg-card p-1 text-xs shadow-md"
													sideOffset={4}
													align="start"
													onClick={(e) => e.stopPropagation()}
												>
													<DropdownMenuItem
														className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
														onSelect={(e) => {
															e.preventDefault();
															const c = conversationsById[child.id];
															if (c) onOpenChat?.(c);
														}}
													>
														View Chat
													</DropdownMenuItem>
													<DropdownMenuItem
														className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
														onSelect={(e) => {
															e.preventDefault();
															onOpenBookmarkMove?.(child.id);
														}}
													>
														Move
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									))}
								</Folder>
							))}
						</Tree>
					)}
				</div>
			)}
		</SidebarGroup>
	);
}
