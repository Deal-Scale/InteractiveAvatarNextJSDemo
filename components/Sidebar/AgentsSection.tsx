"use client";

import {
	ChevronLeft,
	ChevronRight,
	LayoutGrid,
	List,
	Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useAgentStore } from "@/lib/stores/agent";
import AgentCard, { type Agent } from "./AgentCard";
import AgentModal from "./AgentModal";

export default function AgentsSection(props: {
	agents: Array<Agent | { id: string; name: string }>;
	collapsedAgents: boolean;
	setCollapsedAgents: (fn: (v: boolean) => boolean) => void;
	onFavorite?: (id: string, next: boolean) => void;
	onDelete?: (id: string) => void;
	onEdit?: (agent: Agent) => void;
	onAdd?: () => void;
	onStartPreview?: (agent: Agent) => void;
}) {
	const {
		agents,
		collapsedAgents,
		setCollapsedAgents,
		onFavorite,
		onDelete,
		onEdit,
		onAdd,
		onStartPreview,
	} = props;

	const starredAgentIds = useAgentStore((s) => s.starredAgentIds || []);

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
				abilities: (a as any).abilities,
				modalities: (a as any).modalities,
				sessionType: (a as any).sessionType,
				promptStarter: (a as any).promptStarter,
				conversationStarters: (a as any).conversationStarters,
				isOwnedByUser: (a as any).isOwnedByUser,
				avatarId: (a as any).avatarId,
				voiceId: (a as any).voiceId,
				language: (a as any).language,
				model: (a as any).model,
				temperature: (a as any).temperature,
				quality: (a as any).quality,
				voiceChatTransport: (a as any).voiceChatTransport,
				stt: (a as any).stt,
				disableIdleTimeout: (a as any).disableIdleTimeout,
				activityIdleTimeout: (a as any).activityIdleTimeout,
				video: (a as any).video,
				audio: (a as any).audio,
				voice: (a as any).voice,
				knowledgeBaseId: (a as any).knowledgeBaseId,
				mcpServers: (a as any).mcpServers,
				systemPrompt: (a as any).systemPrompt,
			})),
		[agents],
	);

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [open, setOpen] = useState(false);
	const [mode, setMode] = useState<"view" | "edit" | "create">("view");
	const [search, setSearch] = useState("");
	const [selectedRole, setSelectedRole] = useState("all");
	const [layout, setLayout] = useState<"comfortable" | "dense">("dense");
	const [page, setPage] = useState(1);
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

	const filteredAgents = useMemo(() => {
		const q = search.trim().toLowerCase();
		return normalizedAgents.filter((a) => {
			const matchesSearch =
				!q ||
				a.name?.toLowerCase().includes(q) ||
				a.role?.toLowerCase().includes(q) ||
				a.description?.toLowerCase().includes(q) ||
				a.promptStarter?.toLowerCase().includes(q) ||
				(a.conversationStarters || []).some((starter) =>
					starter.toLowerCase().includes(q),
				) ||
				(a.abilities || []).some((ability) =>
					ability.toLowerCase().includes(q),
				) ||
				(a.tags || []).some((t) => t.toLowerCase().includes(q));
			const matchesRole = selectedRole === "all" || a.role === selectedRole;
			return matchesSearch && matchesRole;
		});
	}, [normalizedAgents, search, selectedRole]);

	// Sort starred agents to the top
	const sortedAgents = useMemo(() => {
		return filteredAgents.slice().sort((a, b) => {
			const aStarred = starredAgentIds.includes(a.id);
			const bStarred = starredAgentIds.includes(b.id);
			if (aStarred && !bStarred) return -1;
			if (!aStarred && bStarred) return 1;
			return 0;
		});
	}, [filteredAgents, starredAgentIds]);

	const pageSize = layout === "dense" ? 8 : 4;
	const visibleAbilityCount = layout === "dense" ? 1 : 3;
	const pageCount = Math.max(1, Math.ceil(sortedAgents.length / pageSize));
	const safePage = Math.min(page, pageCount);
	const pagedAgents = useMemo(() => {
		const start = (safePage - 1) * pageSize;
		return sortedAgents.slice(start, start + pageSize);
	}, [sortedAgents, pageSize, safePage]);

	const resetPage = () => setPage(1);

	const openAgent = (agent: Agent) => {
		setSelectedId(agent.id);
		setMode("view");
		setOpen(true);
	};

	const openCreate = useCallback(() => {
		onAdd?.();
		setSelectedId(null);
		setMode("create");
		setOpen(true);
	}, [onAdd]);

	useEffect(() => {
		const handleOpenAgentCreate = () => {
			setCollapsedAgents(() => false);
			openCreate();
		};
		const handleCloseAgentCreate = () => {
			setOpen(false);
		};

		window.addEventListener(
			"tour-open-agent-create-modal",
			handleOpenAgentCreate,
		);
		window.addEventListener(
			"tour-close-agent-create-modal",
			handleCloseAgentCreate,
		);
		return () => {
			window.removeEventListener(
				"tour-open-agent-create-modal",
				handleOpenAgentCreate,
			);
			window.removeEventListener(
				"tour-close-agent-create-modal",
				handleCloseAgentCreate,
			);
		};
	}, [setCollapsedAgents, openCreate]);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
				type="button"
				onClick={() => setCollapsedAgents((v) => !v)}
			>
				<SidebarGroupLabel className="border-violet-400/35 bg-violet-500/10 text-violet-700 dark:text-violet-300">
					Agents
				</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`}
				/>
			</button>

			{!collapsedAgents && (
				<div className="px-2 pb-2">
					<div className="mb-2 flex items-center gap-2">
						<Button
							data-tour="agent-create"
							onClick={openCreate}
							size="sm"
							variant="outline"
						>
							<Plus className="mr-1 size-3" />
							Add New
						</Button>
						<div className="ml-auto flex rounded-md border border-border bg-background p-0.5">
							<button
								type="button"
								aria-label="Comfortable agent layout"
								className={`rounded px-1.5 py-1 text-xs ${layout === "comfortable" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
								onClick={() => {
									setLayout("comfortable");
									resetPage();
								}}
							>
								<List className="size-3.5" />
							</button>
							<button
								type="button"
								aria-label="Dense agent layout"
								className={`rounded px-1.5 py-1 text-xs ${layout === "dense" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
								onClick={() => {
									setLayout("dense");
									resetPage();
								}}
							>
								<LayoutGrid className="size-3.5" />
							</button>
						</div>
					</div>

					<div className="mb-2 space-y-2">
						<input
							aria-label="Search agents"
							className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Search agents..."
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
								resetPage();
							}}
						/>
						{categories.length > 0 ? (
							<select
								aria-label="Filter agents by role"
								className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								value={selectedRole}
								onChange={(event) => {
									setSelectedRole(event.target.value);
									resetPage();
								}}
							>
								<option value="all">All roles</option>
								{categories.map((role) => (
									<option key={role} value={role}>
										{role}
									</option>
								))}
							</select>
						) : null}
					</div>

					{pagedAgents.length > 0 ? (
						<div
							className={
								layout === "dense"
									? "grid grid-cols-2 gap-2"
									: "grid grid-cols-1 gap-2"
							}
						>
							{pagedAgents.map((agent) => (
								<div
									key={agent.id}
									className={
										layout === "dense" ? "h-44 min-w-0" : "h-52 min-w-0"
									}
								>
									<AgentCard
										agent={agent}
										onDelete={onDelete}
										onFavorite={onFavorite}
										isFavorite={starredAgentIds.includes(agent.id)}
										onOpen={openAgent}
										visibleAbilityCount={visibleAbilityCount}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-md border border-dashed border-border px-2 py-4 text-center text-xs text-muted-foreground">
							No agents found
						</div>
					)}

					<div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
						<button
							type="button"
							className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							disabled={safePage <= 1}
							onClick={() => setPage((value) => Math.max(1, value - 1))}
						>
							<ChevronLeft className="size-3" />
							Prev
						</button>
						<span>
							Page {safePage} / {pageCount}
						</span>
						<button
							type="button"
							className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							disabled={safePage >= pageCount}
							onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
						>
							Next
							<ChevronRight className="size-3" />
						</button>
					</div>

					<AgentModal
						mode={mode}
						agent={selected}
						open={open}
						onOpenChange={(o) => setOpen(o)}
						onRequestEdit={() => setMode("edit")}
						onStartPreview={(agent) => {
							onStartPreview?.(agent);
							setOpen(false);
						}}
						onSave={(updated) => {
							onEdit?.(updated);
						}}
					/>
				</div>
			)}
		</SidebarGroup>
	);
}
