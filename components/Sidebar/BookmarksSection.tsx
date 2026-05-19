"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronRight, MoreVertical } from "lucide-react";
import { useMemo } from "react";

import {
	File,
	Folder,
	Tree,
	type TreeViewElement,
} from "@/components/magicui/file-tree";
import type { Conversation } from "@/components/Sidebar/types";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";

type BookmarkFolder = { id: string; name: string; parentId?: string };
type BookmarkTreeNode = Omit<TreeViewElement, "children"> & {
	kind: "folder" | "bookmark";
	folder?: BookmarkFolder;
	children?: BookmarkTreeNode[];
};

export default function BookmarksSection(props: {
	collapsedBookmarks: boolean;
	setCollapsedBookmarks: (fn: (v: boolean) => boolean) => void;
	bookmarkedIds: Set<string>;
	bookmarkFolders: BookmarkFolder[];
	bookmarkMeta: Record<
		string,
		{ folderId?: string; tags?: string[]; title?: string } | undefined
	>;
	conversationsById: Record<string, Conversation | undefined>;
	onOpenChat?: (c: Conversation) => void;
	onOpenBookmarkMove?: (id: string) => void;
	onDeleteBookmark?: (id: string) => void;
	onMoveBookmarkFolder?: (id: string, parentId?: string) => void;
	onDeleteBookmarkFolder?: (id: string) => void;
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
		onDeleteBookmark,
		onMoveBookmarkFolder,
		onDeleteBookmarkFolder,
	} = props;

	const tree: BookmarkTreeNode[] = useMemo(() => {
		const folders: Record<string, BookmarkTreeNode> = {};
		const rootFolders: BookmarkTreeNode[] = [];

		for (const f of bookmarkFolders || []) {
			folders[f.id] = {
				id: f.id,
				name: f.name,
				kind: "folder",
				folder: f,
				children: [],
			};
		}

		for (const f of bookmarkFolders || []) {
			const node = folders[f.id];
			const parent = f.parentId ? folders[f.parentId] : undefined;

			if (!node) continue;
			if (parent && parent.id !== node.id) {
				parent.children = parent.children || [];
				parent.children.push(node);
			} else {
				rootFolders.push(node);
			}
		}

		const uncategorized: BookmarkTreeNode = {
			id: "__uncategorized__",
			name: "Uncategorized",
			kind: "folder",
			children: [],
		};

		for (const id of Array.from(bookmarkedIds || [])) {
			const conv = conversationsById[id];
			if (!conv) continue;

			const meta = bookmarkMeta[id];
			const node: BookmarkTreeNode = {
				id: conv.id,
				name: meta?.title || conv.title,
				kind: "bookmark",
			};

			const folderId = meta?.folderId;

			if (folderId && folders[folderId]) {
				folders[folderId].children = folders[folderId].children || [];
				folders[folderId].children?.push(node);
			} else {
				uncategorized.children?.push(node);
			}
		}

		const sortTree = (nodes: BookmarkTreeNode[]) => {
			nodes.sort((a, b) => {
				if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
				return a.name.localeCompare(b.name);
			});
			for (const node of nodes) {
				if (node.children) sortTree(node.children);
			}
		};

		sortTree(rootFolders);
		if (uncategorized.children && uncategorized.children.length > 0) {
			sortTree(uncategorized.children);
			rootFolders.push(uncategorized);
		}
		return rootFolders;
	}, [bookmarkFolders, bookmarkedIds, bookmarkMeta, conversationsById]);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedBookmarks((v) => !v)}
			>
				<SidebarGroupLabel className="border-amber-400/35 bg-amber-500/10 text-amber-700 dark:text-amber-300">
					Bookmarks
				</SidebarGroupLabel>
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
								<BookmarkFolderNode
									key={folder.id}
									node={folder}
									bookmarkFolders={bookmarkFolders}
									bookmarkMeta={bookmarkMeta}
									conversationsById={conversationsById}
									onDeleteBookmark={onDeleteBookmark}
									onDeleteBookmarkFolder={onDeleteBookmarkFolder}
									onMoveBookmarkFolder={onMoveBookmarkFolder}
									onOpenBookmarkMove={onOpenBookmarkMove}
									onOpenChat={onOpenChat}
								/>
							))}
						</Tree>
					)}
				</div>
			)}
		</SidebarGroup>
	);
}

function BookmarkFolderNode(props: {
	node: BookmarkTreeNode;
	bookmarkFolders: BookmarkFolder[];
	bookmarkMeta: Record<
		string,
		{ folderId?: string; tags?: string[]; title?: string } | undefined
	>;
	conversationsById: Record<string, Conversation | undefined>;
	onOpenChat?: (c: Conversation) => void;
	onOpenBookmarkMove?: (id: string) => void;
	onDeleteBookmark?: (id: string) => void;
	onMoveBookmarkFolder?: (id: string, parentId?: string) => void;
	onDeleteBookmarkFolder?: (id: string) => void;
}) {
	const {
		node,
		bookmarkFolders,
		bookmarkMeta,
		conversationsById,
		onOpenChat,
		onOpenBookmarkMove,
		onDeleteBookmark,
		onMoveBookmarkFolder,
		onDeleteBookmarkFolder,
	} = props;
	const isRealFolder = Boolean(node.folder);

	return (
		<Folder
			element={node.name}
			value={node.id}
			action={
				isRealFolder ? (
					<BookmarkFolderActions
						folder={node.folder as BookmarkFolder}
						folders={bookmarkFolders}
						onDeleteFolder={onDeleteBookmarkFolder}
						onMoveFolder={onMoveBookmarkFolder}
					/>
				) : undefined
			}
		>
			{(node.children || []).map((child) =>
				child.kind === "folder" ? (
					<BookmarkFolderNode
						key={child.id}
						node={child}
						bookmarkFolders={bookmarkFolders}
						bookmarkMeta={bookmarkMeta}
						conversationsById={conversationsById}
						onDeleteBookmark={onDeleteBookmark}
						onDeleteBookmarkFolder={onDeleteBookmarkFolder}
						onMoveBookmarkFolder={onMoveBookmarkFolder}
						onOpenBookmarkMove={onOpenBookmarkMove}
						onOpenChat={onOpenChat}
					/>
				) : (
					<BookmarkTreeItem
						key={child.id}
						child={child}
						conversation={conversationsById[child.id]}
						meta={bookmarkMeta[child.id]}
						onDeleteBookmark={onDeleteBookmark}
						onOpenBookmarkMove={onOpenBookmarkMove}
						onOpenChat={onOpenChat}
					/>
				),
			)}
		</Folder>
	);
}

function BookmarkFolderActions(props: {
	folder: BookmarkFolder;
	folders: BookmarkFolder[];
	onMoveFolder?: (id: string, parentId?: string) => void;
	onDeleteFolder?: (id: string) => void;
}) {
	const { folder, folders, onMoveFolder, onDeleteFolder } = props;
	const descendantIds = useMemo(() => {
		const ids = new Set<string>();
		const collect = (folderId: string) => {
			for (const candidate of folders) {
				if (candidate.parentId === folderId && !ids.has(candidate.id)) {
					ids.add(candidate.id);
					collect(candidate.id);
				}
			}
		};

		collect(folder.id);

		return ids;
	}, [folder.id, folders]);
	const moveTargets = folders
		.filter((candidate) => candidate.id !== folder.id)
		.filter((candidate) => !descendantIds.has(candidate.id))
		.sort((a, b) => a.name.localeCompare(b.name));

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Bookmark folder actions"
					className="shrink-0 rounded-md border border-border bg-card p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={(e) => e.stopPropagation()}
				>
					<MoreVertical className="size-3" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent
					className="z-[1000] min-w-[13rem] rounded-md border border-border bg-card p-1 text-xs shadow-xl"
					sideOffset={4}
					align="end"
					onClick={(e) => e.stopPropagation()}
				>
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onMoveFolder?.(folder.id, undefined);
						}}
					>
						Move to top level
					</DropdownMenuItem>
					{moveTargets.length > 0 && (
						<div className="px-2 pt-2 pb-1 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
							Move under
						</div>
					)}
					{moveTargets.map((target) => (
						<DropdownMenuItem
							key={target.id}
							className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
							onSelect={(e) => {
								e.preventDefault();
								onMoveFolder?.(folder.id, target.id);
							}}
						>
							{target.name}
						</DropdownMenuItem>
					))}
					<div className="my-1 h-px bg-border" />
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-red-600 outline-none data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950/40"
						onSelect={(e) => {
							e.preventDefault();
							onDeleteFolder?.(folder.id);
						}}
					>
						Delete Folder
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}

function BookmarkTreeItem(props: {
	child: TreeViewElement;
	conversation?: Conversation;
	meta?: { folderId?: string; tags?: string[]; title?: string };
	onOpenChat?: (c: Conversation) => void;
	onOpenBookmarkMove?: (id: string) => void;
	onDeleteBookmark?: (id: string) => void;
}) {
	const {
		child,
		conversation,
		meta,
		onOpenChat,
		onOpenBookmarkMove,
		onDeleteBookmark,
	} = props;
	const tags = meta?.tags?.filter(Boolean) ?? [];

	return (
		<div className="flex min-w-0 items-center justify-between gap-1">
			<div className="min-w-0 flex-1">
				<File
					className="min-w-0 flex-1 pr-2"
					value={child.id}
					onClick={() => {
						if (conversation) onOpenChat?.(conversation);
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
				<DropdownMenuPortal>
					<DropdownMenuContent
						className="z-[1000] min-w-[13rem] rounded-md border border-border bg-card p-1 text-xs shadow-xl"
						sideOffset={4}
						align="end"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="px-2 py-1.5">
							<div className="mb-1 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
								Tags
							</div>
							{tags.length > 0 ? (
								<div className="flex max-w-[11rem] flex-wrap gap-1">
									{tags.map((tag) => (
										<span
											key={tag}
											className="rounded border border-border bg-muted px-1.5 py-0.5 text-[0.68rem] leading-none text-foreground"
										>
											{tag}
										</span>
									))}
								</div>
							) : (
								<div className="text-muted-foreground">No tags</div>
							)}
						</div>
						<div className="my-1 h-px bg-border" />
						<DropdownMenuItem
							className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
							onSelect={(e) => {
								e.preventDefault();
								if (conversation) onOpenChat?.(conversation);
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
							Edit Bookmark
						</DropdownMenuItem>
						<DropdownMenuItem
							className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-red-600 outline-none data-[highlighted]:bg-red-50 dark:text-red-400 dark:data-[highlighted]:bg-red-950/40"
							onSelect={(e) => {
								e.preventDefault();
								onDeleteBookmark?.(child.id);
							}}
						>
							Delete Bookmark
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</DropdownMenu>
		</div>
	);
}
