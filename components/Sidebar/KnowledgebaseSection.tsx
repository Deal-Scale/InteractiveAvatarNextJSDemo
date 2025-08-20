"use client";

import React, { useState } from "react";
import { ChevronRight, MoreVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
	File,
	Folder,
	Tree,
	type TreeViewElement,
} from "@/components/magicui/file-tree";

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
	} = props;

	const [selectedId, setSelectedId] = useState<string | null>(null);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedKnowledge((v) => !v)}
			>
				<SidebarGroupLabel>{title || "Knowledge Base"}</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedKnowledge ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedKnowledge && (
				<div className="px-2 pb-2">
					{/* Actions row: Add Knowledge Base */}
					<div className="flex items-center justify-end px-1 pb-2">
						<button
							type="button"
							data-testid="kb-add-btn"
							className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1 text-xs hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							onClick={(e) => {
								e.stopPropagation();
								onOpenAddKB
									? onOpenAddKB()
									: console.debug("KB: open add modal");
							}}
						>
							Add Knowledge Base
						</button>
					</div>
					{tree.length === 0 ? (
						<div className="px-1 py-2 text-xs text-muted-foreground">
							No knowledge items
						</div>
					) : (
						<Tree className="text-xs">
							{tree.map((folder) => (
								<Folder key={folder.id} element={folder.name} value={folder.id}>
									{(folder.children || []).map((child) => (
										<div key={child.id} className="flex flex-col gap-1">
											<div className="flex items-center justify-between gap-2">
												<div className="min-w-0 flex-1">
													<File
														value={child.id}
														onClick={() => {
															setSelectedId((prev) =>
																prev === child.id ? null : child.id,
															);
															onOpenItem?.(child.id);
														}}
													>
														<span className="block truncate whitespace-nowrap">
															{child.name}
														</span>
													</File>
												</div>
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
																onMoveItem
																	? onMoveItem(child.id)
																	: console.debug("KB: move item", child.id);
															}}
														>
															Move
														</DropdownMenuItem>
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
												</DropdownMenu>
											</div>
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
