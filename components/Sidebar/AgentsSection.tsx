"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import AgentCard, { type Agent } from "./AgentCard";
import AgentModal from "./AgentModal";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import type { GridFetcher, GridResponse } from "@/types/component-grid";
import ComponentGrid from "@/components/ui/grid/components/ComponentGrid";
import type { GridItemRendererProps } from "@/components/ui/grid/types";

export default function AgentsSection(props: {
	agents: Array<Agent | { id: string; name: string }>;
	collapsedAgents: boolean;
	setCollapsedAgents: (fn: (v: boolean) => boolean) => void;
	onFavorite?: (id: string, next: boolean) => void;
	onDelete?: (id: string) => void;
	onEdit?: (agent: Agent) => void;
	onAdd?: () => void;
}) {
	const {
		agents,
		collapsedAgents,
		setCollapsedAgents,
		onFavorite,
		onDelete,
		onEdit,
		onAdd,
	} = props;

	// Normalize minimal agents
	const normalizedAgents: Agent[] = useMemo(
		() =>
			agents.map((a) => ({
				id: (a as any).id,
				name: (a as any).name,
				avatarUrl: (a as any).avatarUrl,
				role: (a as any).role,
				description: (a as any).description,
				tags: (a as any).tags,
				isOwnedByUser: (a as any).isOwnedByUser,
			})),
		[agents],
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<"view" | "edit" | "create">("view");
	const selected = useMemo(
		() => normalizedAgents.find((a) => a.id === selectedId) || null,
		[normalizedAgents, selectedId],
	);

	// Derive categories from roles (fallback to "Uncategorized")
	const categories = useMemo(() => {
		const set = new Set<string>();
		for (const a of normalizedAgents) {
			if (a.role) set.add(a.role);
		}
		return Array.from(set);
	}, [normalizedAgents]);

	// Local fetcher over in-memory list
	const fetchAgents: GridFetcher<Agent> = async ({
		page,
		pageSize,
		search,
		categories: cats,
	}) => {
		const q = (search || "").trim().toLowerCase();
		const filtered = normalizedAgents.filter((a) => {
			const matchesSearch =
				!q ||
				a.name?.toLowerCase().includes(q) ||
				a.role?.toLowerCase().includes(q) ||
				(a.tags || []).some((t) => t.toLowerCase().includes(q));
			const matchesCats =
				!cats || cats.length === 0 || (a.role && cats.includes(a.role));
			return matchesSearch && matchesCats;
		});
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		const items = filtered.slice(start, end);
		const resp: GridResponse<Agent> = {
			items,
			total: filtered.length,
			page,
			pageSize,
		};
		// Simulate async
		return new Promise((resolve) => setTimeout(() => resolve(resp), 50));
	};

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedAgents((v) => !v)}
			>
				<SidebarGroupLabel>Agents</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedAgents && (
				<div className="px-2 pb-2">
					<div className="mb-2 flex items-center gap-2">
						<Button
							onClick={() => {
								onAdd?.();
								setSelectedId(null);
								setMode("create");
								setOpen(true);
							}}
							size="sm"
							variant="outline"
						>
							<Plus className="mr-1 size-3" />
							Add New
						</Button>
					</div>

					<ComponentGrid<Agent>
						fetcher={fetchAgents}
						ItemComponent={({ item }: GridItemRendererProps<Agent>) => (
							<AgentCard
								agent={item}
								onDelete={onDelete}
								onFavorite={onFavorite}
								onOpen={(a) => {
									setSelectedId(a.id);
									setMode("view");
									setOpen(true);
								}}
							/>
						)}
						categories={categories}
						pageSize={12}
						mode="infinite"
						columns={2}
						queryKeyBase={["sidebar", "agents"]}
						className="[&_[role=grid]]:grid-cols-2 sm:[&_[role=grid]]:grid-cols-3"
					/>

					<AgentModal
						mode={mode}
						agent={selected}
						open={open}
						onOpenChange={(o) => setOpen(o)}
						onRequestEdit={() => setMode("edit")}
						onSave={(updated) => {
							onEdit?.(updated);
						}}
					/>
				</div>
			)}
		</SidebarGroup>
	);
}
