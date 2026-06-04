"use client";

import { ChevronRight, Plug, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { KB_CONNECTORS } from "../KnowledgeBase/connectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarGroup, SidebarGroupLabel } from "../ui/sidebar";
import { setChatDragData } from "@/lib/chat-drag";

const PAGE_SIZE = 3;
type ToolCategoryFilter = "all" | "oauth" | "apiKey";

export default function ToolsSection(props: {
	collapsedTools: boolean;
	setCollapsedTools: (fn: (v: boolean) => boolean) => void;
	onOpenTools?: (connectorKey?: string) => void;
}) {
	const { collapsedTools, setCollapsedTools, onOpenTools } = props;
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [category, setCategory] = useState<ToolCategoryFilter>("all");
	const filteredTools = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return KB_CONNECTORS.filter((connector) => {
			if (category !== "all" && connector.auth.type !== category) return false;
			if (!needle) return true;
			return (
				connector.name.toLowerCase().includes(needle) ||
				connector.description.toLowerCase().includes(needle) ||
				connector.key.toLowerCase().includes(needle)
			);
		});
	}, [category, query]);

	const categoryFilters: Array<{ value: ToolCategoryFilter; label: string }> = [
		{ value: "all", label: "All" },
		{ value: "oauth", label: "OAuth" },
		{ value: "apiKey", label: "API Key" },
	];

	function updateCategory(nextCategory: ToolCategoryFilter) {
		setCategory(nextCategory);
		setPage(1);
	}

	const pageCount = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
	const visibleTools = filteredTools.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE,
	);

	useEffect(() => {
		setPage(1);
	}, []);

	useEffect(() => {
		setPage((current) => Math.min(current, pageCount));
	}, [pageCount]);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedTools((v) => !v)}
			>
				<SidebarGroupLabel className="border-sky-400/35 bg-sky-500/10 text-sky-700 dark:text-sky-300">
					Tools
				</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedTools ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedTools && (
				<div className="space-y-2 px-2 pb-2">
					<div className="relative">
						<Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setPage(1);
							}}
							placeholder="Search tools"
							className="h-8 pl-7 text-xs"
						/>
					</div>
					<div className="grid grid-cols-3 gap-1">
						{categoryFilters.map((filter) => (
							<Button
								key={filter.value}
								type="button"
								variant={category === filter.value ? "default" : "outline"}
								size="sm"
								className="h-7 px-2 text-[0.68rem]"
								onClick={() => updateCategory(filter.value)}
							>
								{filter.label}
							</Button>
						))}
					</div>
					<div className="grid gap-2">
						{visibleTools.map((connector) => (
							<div
								key={connector.key}
								className="rounded-md border border-sky-400/20 bg-sky-500/5 p-2"
								draggable
								title="Drag tool to chat"
								onDragStart={(event) => {
									setChatDragData(event.dataTransfer, {
										id: `tool-${connector.key}`,
										name: connector.name,
										kind: "tool",
										mimeType: "application/x-tool",
										description: connector.description,
									});
								}}
							>
								<div className="flex min-w-0 items-start justify-between gap-2">
									<div className="min-w-0">
										<div className="truncate text-xs font-medium text-foreground">
											{connector.name}
										</div>
										<div className="line-clamp-2 text-[0.68rem] text-muted-foreground">
											{connector.description}
										</div>
									</div>
									<div className="flex shrink-0 flex-col items-end gap-1">
										<span className="rounded border border-border bg-card px-1.5 py-0.5 text-[0.62rem] uppercase leading-none text-muted-foreground">
											{connector.auth.type === "oauth" ? "OAuth" : "Key"}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-6 px-2 text-[0.68rem]"
											onClick={() => onOpenTools?.(connector.key)}
										>
											Configure
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
						<span>
							Page {page} of {pageCount}
						</span>
						<div className="flex gap-1">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 px-2 text-[0.68rem]"
								disabled={page <= 1}
								onClick={() => setPage((current) => Math.max(1, current - 1))}
							>
								Prev
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 px-2 text-[0.68rem]"
								disabled={page >= pageCount}
								onClick={() =>
									setPage((current) => Math.min(pageCount, current + 1))
								}
							>
								Next
							</Button>
						</div>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="w-full justify-center gap-2"
						onClick={() => onOpenTools?.()}
					>
						<Plug className="size-3" />
						<span className="text-xs">Connect tool</span>
					</Button>
				</div>
			)}
		</SidebarGroup>
	);
}
