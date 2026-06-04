"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronRight, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
	File,
	Folder,
	Tree,
	type TreeViewElement,
} from "../magicui/file-tree";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel } from "../ui/sidebar";
import { setChatDragData } from "@/lib/chat-drag";

export type KnowledgeFolder = { id: string; name: string; parentId?: string };
type KnowledgeNode = Omit<TreeViewElement, "children"> & {
	kind: "folder" | "item";
	folder?: KnowledgeFolder;
	children?: KnowledgeNode[];
};

export default function KnowledgebaseSection(props: {
	collapsedKnowledge: boolean;
	setCollapsedKnowledge: (fn: (v: boolean) => boolean) => void;
	tree: TreeViewElement[];
	onOpenItem?: (id: string) => void;
	title?: string;
	onOpenMarkdown?: () => void;
	onStartApiSync?: () => void;
	onMoveItem?: (id: string) => void;
	onOpenAddKB?: () => void;
	folders?: KnowledgeFolder[];
	itemFolders?: Record<string, string | undefined>;
	onCreateFolder?: (name: string, parentId?: string) => KnowledgeFolder | void;
	onMoveFolder?: (id: string, parentId?: string) => void;
	onDeleteFolder?: (id: string) => void;
	onMoveKnowledgeItem?: (id: string, folderId?: string) => void;
	onDeleteKnowledgeItem?: (id: string) => void;
}) {
	const {
		collapsedKnowledge,
		setCollapsedKnowledge,
		tree,
		onOpenItem,
		title,
		onOpenMarkdown,
		onStartApiSync,
		onMoveItem,
		onOpenAddKB,
		folders: controlledFolders,
		itemFolders: controlledItemFolders,
		onCreateFolder,
		onMoveFolder,
		onDeleteFolder,
		onMoveKnowledgeItem,
		onDeleteKnowledgeItem,
	} = props;

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [localFolders, setLocalFolders] = useState<KnowledgeFolder[]>([]);
	const [localItemFolders, setLocalItemFolders] = useState<
		Record<string, string | undefined>
	>({});
	const folders = controlledFolders ?? localFolders;
	const itemFolders = controlledItemFolders ?? localItemFolders;

	const createFolder = (parentId?: string) => {
		const name = window.prompt(parentId ? "Subfolder name" : "Folder name");
		const trimmed = name?.trim();
		if (!trimmed) return;
		const created = onCreateFolder?.(trimmed, parentId);
		if (!controlledFolders) {
			setLocalFolders((prev) => [
				...prev,
				created ?? {
					id: `kb-folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
					name: trimmed,
					parentId,
				},
			]);
		}
	};

	const moveFolder = (id: string, parentId?: string) => {
		onMoveFolder?.(id, parentId);
		if (!controlledFolders) {
			setLocalFolders((prev) =>
				prev.map((folder) =>
					folder.id === id ? { ...folder, parentId } : folder,
				),
			);
		}
	};

	const deleteFolder = (id: string) => {
		const descendants = new Set<string>([id]);
		let changed = true;
		while (changed) {
			changed = false;
			for (const folder of folders) {
				if (folder.parentId && descendants.has(folder.parentId)) {
					if (!descendants.has(folder.id)) {
						descendants.add(folder.id);
						changed = true;
					}
				}
			}
		}
		onDeleteFolder?.(id);
		if (!controlledFolders) {
			setLocalFolders((prev) =>
				prev.filter((folder) => !descendants.has(folder.id)),
			);
		}
		const clearDeletedFolderItems = (
			prev: Record<string, string | undefined>,
		) => {
			const next = { ...prev };
			for (const [itemId, folderId] of Object.entries(next)) {
				if (folderId && descendants.has(folderId)) next[itemId] = undefined;
			}
			return next;
		};
		if (!controlledItemFolders) {
			setLocalItemFolders(clearDeletedFolderItems);
		}
	};

	const sourceItems = useMemo(() => flattenTree(tree), [tree]);

	const displayTree = useMemo(() => {
		const folderNodes: Record<string, KnowledgeNode> = {};
		const roots: KnowledgeNode[] = [];

		for (const folder of folders) {
			folderNodes[folder.id] = {
				id: folder.id,
				name: folder.name,
				kind: "folder",
				folder,
				children: [],
			};
		}

		for (const folder of folders) {
			const node = folderNodes[folder.id];
			const parent = folder.parentId ? folderNodes[folder.parentId] : undefined;
			if (!node) continue;
			if (parent && parent.id !== node.id) parent.children?.push(node);
			else roots.push(node);
		}

		const sourceRoots = tree.map(
			(node): KnowledgeNode => toKnowledgeNode(node),
		);
		const unfiled: KnowledgeNode = {
			id: "__kb_unfiled__",
			name: "Knowledge Items",
			kind: "folder",
			children: [],
		};

		for (const item of sourceItems) {
			const folderId = itemFolders[item.id];
			const target = folderId ? folderNodes[folderId] : undefined;
			const node: KnowledgeNode = { ...item, kind: "item" };
			if (target) target.children?.push(node);
			else unfiled.children?.push(node);
		}

		sortTree(roots);
		if (unfiled.children?.length) {
			sortTree(unfiled.children);
			roots.push(unfiled);
		} else if (roots.length === 0) {
			roots.push(...sourceRoots);
		}

		return roots;
	}, [folders, itemFolders, sourceItems, tree]);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedKnowledge((v) => !v)}
			>
				<SidebarGroupLabel className="border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">
					{title || "Knowledge Base"}
				</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedKnowledge ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedKnowledge && (
				<div className="px-2 pb-2">
					<div className="flex flex-wrap items-center gap-2 px-1 pb-2">
						<Button
							variant="outline"
							size="sm"
							title="Add Knowledge Base"
							aria-label="Add Knowledge Base"
							data-tour="kb-add-button"
							data-testid="kb-add-btn"
							onClick={(e) => {
								e.stopPropagation();
								onOpenAddKB
									? onOpenAddKB()
									: console.debug("KB: open add modal");
							}}
							className="inline-flex items-center gap-2"
						>
							<Plus className="size-3" />
							<span className="text-xs">Add KB</span>
						</Button>
					</div>
					{displayTree.length === 0 ? (
						<div className="px-1 py-2 text-xs text-muted-foreground">
							No knowledge items
						</div>
					) : (
						<Tree className="text-xs">
							{displayTree.map((node) => (
								<KnowledgeTreeNode
									key={node.id}
									node={node}
									folders={folders}
									itemFolders={itemFolders}
									onAddFolder={createFolder}
									onDeleteFolder={deleteFolder}
									onMoveFolder={moveFolder}
									onMoveItem={(id, folderId) => {
										onMoveKnowledgeItem?.(id, folderId);
										if (!controlledItemFolders) {
											setLocalItemFolders((prev) => ({
												...prev,
												[id]: folderId,
											}));
										}
										onMoveItem?.(id);
									}}
									onOpenItem={(id) => {
										setSelectedId((prev) => (prev === id ? null : id));
										onOpenItem?.(id);
									}}
									onOpenMarkdown={onOpenMarkdown}
									onStartApiSync={onStartApiSync}
									selectedId={selectedId}
									onDeleteKBItem={onDeleteKnowledgeItem}
								/>
							))}
						</Tree>
					)}
				</div>
			)}
		</SidebarGroup>
	);
}

function KnowledgeTreeNode(props: {
	node: KnowledgeNode;
	folders: KnowledgeFolder[];
	itemFolders: Record<string, string | undefined>;
	selectedId: string | null;
	onAddFolder: (parentId?: string) => void;
	onMoveFolder: (id: string, parentId?: string) => void;
	onDeleteFolder: (id: string) => void;
	onMoveItem: (id: string, folderId?: string) => void;
	onOpenItem: (id: string) => void;
	onOpenMarkdown?: () => void;
	onStartApiSync?: () => void;
	onDeleteKBItem?: (id: string) => void;
}) {
	const {
		node,
		folders,
		itemFolders,
		selectedId,
		onAddFolder,
		onMoveFolder,
		onDeleteFolder,
		onMoveItem,
		onOpenItem,
		onOpenMarkdown,
		onStartApiSync,
		onDeleteKBItem,
	} = props;

	if (node.kind === "folder") {
		const isRealFolder = Boolean(node.folder);
		return (
			<Folder
				element={node.name}
				value={node.id}
				draggable
				title="Drag knowledge folder to chat"
				onDragStart={(event) => {
					event.stopPropagation();
					setChatDragData(event.dataTransfer, {
						id: node.id.startsWith("kb-folder-")
							? node.id
							: `kb-folder-${node.id}`,
						name: node.name,
						kind: "knowledge",
						mimeType: "application/x-knowledge-folder",
						description: "Knowledge base folder",
					});
				}}
				action={
					isRealFolder ? (
						<div className="flex items-center gap-1">
							<button
								type="button"
								aria-label="Delete folder"
								className="shrink-0 rounded-md border border-border bg-card p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={(e) => {
									e.stopPropagation();
									if (
										window.confirm(
											`Are you sure you want to delete folder "${node.name}" and all of its contents?`,
										)
									) {
										onDeleteFolder(node.id);
									}
								}}
							>
								<Trash2 className="size-3" />
							</button>
							<KnowledgeFolderActions
								folder={node.folder as KnowledgeFolder}
								folders={folders}
								onAddFolder={onAddFolder}
								onDeleteFolder={onDeleteFolder}
								onMoveFolder={onMoveFolder}
							/>
						</div>
					) : undefined
				}
			>
				{(node.children || []).map((child) => (
					<KnowledgeTreeNode
						key={child.id}
						node={child}
						folders={folders}
						itemFolders={itemFolders}
						onAddFolder={onAddFolder}
						onDeleteFolder={onDeleteFolder}
						onMoveFolder={onMoveFolder}
						onMoveItem={onMoveItem}
						onOpenItem={onOpenItem}
						onOpenMarkdown={onOpenMarkdown}
						onStartApiSync={onStartApiSync}
						selectedId={selectedId}
						onDeleteKBItem={onDeleteKBItem}
					/>
				))}
			</Folder>
		);
	}

	return (
		<div className="flex items-center justify-between gap-1 w-full min-w-0">
			<div className="min-w-0 flex-1">
				<File
					value={node.id}
					isSelect={selectedId === node.id}
					onClick={() => onOpenItem(node.id)}
					draggable
					title="Drag knowledge item to chat"
					onDragStart={(event) => {
						event.stopPropagation();
						setChatDragData(event.dataTransfer, {
							id: node.id.startsWith("kb-") ? node.id : `kb-${node.id}`,
							name: node.name,
							kind: "knowledge",
							mimeType: "application/x-knowledge",
							description: "Knowledge base item",
						});
					}}
				>
					<span className="block truncate whitespace-nowrap">{node.name}</span>
				</File>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				<button
					type="button"
					aria-label="Delete knowledge item"
					className="shrink-0 rounded-md border border-border bg-card p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={(e) => {
						e.stopPropagation();
						if (
							window.confirm(`Are you sure you want to delete "${node.name}"?`)
						) {
							onDeleteKBItem?.(node.id);
						}
					}}
				>
					<Trash2 className="size-3" />
				</button>
				<KnowledgeItemActions
					folders={folders}
					itemId={node.id}
					currentFolderId={itemFolders[node.id]}
					onMoveItem={onMoveItem}
					onOpenMarkdown={onOpenMarkdown}
					onStartApiSync={onStartApiSync}
				/>
			</div>
		</div>
	);
}

function KnowledgeFolderActions(props: {
	folder: KnowledgeFolder;
	folders: KnowledgeFolder[];
	onAddFolder: (parentId?: string) => void;
	onMoveFolder: (id: string, parentId?: string) => void;
	onDeleteFolder: (id: string) => void;
}) {
	const { folder, folders, onAddFolder, onMoveFolder, onDeleteFolder } = props;
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
					aria-label="Knowledge folder actions"
					className="shrink-0 rounded-md border border-border bg-card p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={(e) => e.stopPropagation()}
				>
					<MoreVertical className="size-3" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent
					className="z-[2147483647] min-w-[13rem] rounded-md border border-border bg-card p-1 text-xs shadow-xl"
					style={{ zIndex: 2147483647 }}
					side="right"
					sideOffset={4}
					align="end"
					onClick={(e) => e.stopPropagation()}
				>
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onAddFolder(folder.id);
						}}
					>
						Add subfolder
					</DropdownMenuItem>
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onMoveFolder(folder.id, undefined);
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
								onMoveFolder(folder.id, target.id);
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
							onDeleteFolder(folder.id);
						}}
					>
						Delete Folder
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}

function KnowledgeItemActions(props: {
	itemId: string;
	currentFolderId?: string;
	folders: KnowledgeFolder[];
	onMoveItem: (id: string, folderId?: string) => void;
	onOpenMarkdown?: () => void;
	onStartApiSync?: () => void;
}) {
	const {
		itemId,
		currentFolderId,
		folders,
		onMoveItem,
		onOpenMarkdown,
		onStartApiSync,
	} = props;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label="Knowledgebase actions"
					className="shrink-0 rounded-md border border-border bg-card p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					onClick={(e) => e.stopPropagation()}
				>
					<MoreVertical className="size-3" />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent
					className="z-[2147483647] min-w-[13rem] rounded-md border border-border bg-card p-1 text-xs shadow-xl"
					style={{ zIndex: 2147483647 }}
					side="right"
					sideOffset={4}
					align="end"
					onClick={(e) => e.stopPropagation()}
				>
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onMoveItem(itemId, undefined);
						}}
					>
						Move to Knowledge Items
					</DropdownMenuItem>
					{folders.length > 0 && (
						<div className="px-2 pt-2 pb-1 text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
							Move to folder
						</div>
					)}
					{folders
						.slice()
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((folder) => (
							<DropdownMenuItem
								key={folder.id}
								disabled={currentFolderId === folder.id}
								className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-muted"
								onSelect={(e) => {
									e.preventDefault();
									onMoveItem(itemId, folder.id);
								}}
							>
								{folder.name}
							</DropdownMenuItem>
						))}
					<div className="my-1 h-px bg-border" />
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onOpenMarkdown
								? onOpenMarkdown()
								: console.debug("KB: open markdown");
						}}
					>
						Markdown actions
					</DropdownMenuItem>
					<DropdownMenuItem
						className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none data-[highlighted]:bg-muted"
						onSelect={(e) => {
							e.preventDefault();
							onStartApiSync
								? onStartApiSync()
								: console.debug("KB: start OAuth sync");
						}}
					>
						Live API actions
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}

function flattenTree(nodes: TreeViewElement[]): KnowledgeNode[] {
	const out: KnowledgeNode[] = [];
	const walk = (node: TreeViewElement) => {
		if (node.children?.length) {
			for (const child of node.children) walk(child);
			return;
		}
		out.push({ id: node.id, name: node.name, kind: "item" });
	};
	for (const node of nodes) walk(node);
	return out;
}

function toKnowledgeNode(node: TreeViewElement): KnowledgeNode {
	return {
		id: node.id,
		name: node.name,
		kind: node.children?.length ? "folder" : "item",
		children: node.children?.map(toKnowledgeNode),
	};
}

function sortTree(nodes: KnowledgeNode[]) {
	nodes.sort((a, b) => {
		if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
	for (const node of nodes) {
		if (node.children) sortTree(node.children);
	}
}
