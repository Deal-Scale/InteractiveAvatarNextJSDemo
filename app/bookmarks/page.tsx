"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useBookmarkStore } from "@/lib/stores/bookmarks";

type Conversation = {
	id: string;
	title: string;
	lastMessage: string;
	timestamp: number;
};

type ConversationGroup = {
	period: string;
	conversations: Conversation[];
};

export default function BookmarksPage() {
	const { folders, meta, bookmarkedIds } = useBookmarkStore();
	const [convoIndex, setConvoIndex] = useState<Record<string, Conversation>>(
		{},
	);

	// Primary source: fetch from API (mocked by MSW in dev)
	const { data: bookmarksData } = useQuery({
		queryKey: ["bookmarks", "list"],
		queryFn: async () => {
			const res = await fetch("/api/mock/bookmarks");
			if (!res.ok) throw new Error("Failed to load bookmarks");
			return (await res.json()) as Array<{
				id: string;
				title: string;
				lastMessage?: string;
				timestamp?: number;
				tags?: string[];
			}>;
		},
		staleTime: 60_000,
	});

	useEffect(() => {
		if (bookmarksData?.length) {
			const idx: Record<string, Conversation> = {};
			bookmarksData.forEach((b) => {
				idx[b.id] = {
					id: b.id,
					title: b.title,
					lastMessage: b.lastMessage ?? "",
					timestamp: b.timestamp ?? Date.now(),
				};
			});
			setConvoIndex(idx);
		}
		// Fallback: localStorage cache if API not available
		try {
			const cc = localStorage.getItem("conversations.cache.v1");
			if (cc) {
				const { data } = JSON.parse(cc) as {
					at: number;
					data: ConversationGroup[];
				};
				const idx: Record<string, Conversation> = {};
				data.forEach((g) => {
					g.conversations.forEach((c) => {
						idx[c.id] = c;
					});
				});
				setConvoIndex(idx);
			}
		} catch {}
	}, [bookmarksData]);

	const items = useMemo(() => Array.from(bookmarkedIds), [bookmarkedIds]);

	return (
		<div className="mx-auto w-full max-w-3xl p-6 text-foreground">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-lg font-semibold">Bookmarks</h1>
				<Button
					asChild
					className="border-border hover:bg-muted"
					variant="outline"
				>
					<Link href="/">Back</Link>
				</Button>
			</div>

			{items.length === 0 ? (
				<div className="rounded-md border border-border p-6 text-sm text-muted-foreground">
					<div className="mb-2 flex items-center gap-2 font-medium text-foreground">
						<Bookmark className="size-4" /> No bookmarks yet
					</div>
					Use the bookmark icon in the sidebar to add bookmarks. They will
					appear here.
				</div>
			) : (
				<div className="space-y-6">
					{/* Group by folder for a simple view */}
					{folders.length > 0
						? folders.map((folder) => {
								const inFolder = items.filter(
									(id) => meta[id]?.folderId === folder.id,
								);

								if (inFolder.length === 0) return null;

								return (
									<SidebarGroup key={folder.id}>
										<div className="flex w-full items-center justify-between rounded-md px-2 py-1">
											<SidebarGroupLabel>{folder.name}</SidebarGroupLabel>
										</div>
										<SidebarMenu>
											{inFolder.map((id) => {
												const c = convoIndex[id];
												const tags = meta[id]?.tags ?? [];

												return (
													<SidebarMenuButton
														key={id}
														className="justify-between"
													>
														<div className="min-w-0 flex-1 truncate pr-2">
															{c?.title ?? id}
														</div>
														{tags.length > 0 && (
															<div className="truncate text-xs text-muted-foreground">
																{tags.join(", ")}
															</div>
														)}
													</SidebarMenuButton>
												);
											})}
										</SidebarMenu>
									</SidebarGroup>
								);
							})
						: null}

					{/* Unfiled */}
					{items.some((id) => !meta[id]?.folderId) && (
						<SidebarGroup>
							<div className="flex w-full items-center justify-between rounded-md px-2 py-1">
								<SidebarGroupLabel>Unfiled</SidebarGroupLabel>
							</div>
							<SidebarMenu>
								{items
									.filter((id) => !meta[id]?.folderId)
									.map((id) => {
										const c = convoIndex[id];
										const tags = meta[id]?.tags ?? [];

										return (
											<SidebarMenuButton key={id} className="justify-between">
												<div className="min-w-0 flex-1 truncate pr-2">
													{c?.title ?? id}
												</div>
												{tags.length > 0 && (
													<div className="truncate text-xs text-muted-foreground">
														{tags.join(", ")}
													</div>
												)}
											</SidebarMenuButton>
										);
									})}
							</SidebarMenu>
						</SidebarGroup>
					)}
				</div>
			)}
		</div>
	);
}
