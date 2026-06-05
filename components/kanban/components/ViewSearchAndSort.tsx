"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLeadListStore } from "@/lib/stores/leadList";
import { useUserLeadsStore } from "@/lib/stores/user/leads/leads";
import { useKanbanView } from "../utils/viewStore";
import type { Status, Priority, KanbanTask } from "../utils/types";
import type { SortField, SortDirection } from "../utils/viewStore";
import { useTaskStore } from "../utils/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import SuggestModal from "./SuggestModal";

type ToolbarMenuKey =
	| "status"
	| "priority"
	| "assignee"
	| "lead"
	| "leadList"
	| "quickActions";

type ToolbarSelectKey = "sortField" | "sortDirection";

export default function ViewSearchAndSort() {
	// View store state and actions
	// Suggest modal state
	const [suggestOpen, setSuggestOpen] = useState(false);
	const [openMenu, setOpenMenu] = useState<ToolbarMenuKey | null>(null);
	const [openSelect, setOpenSelect] = useState<ToolbarSelectKey | null>(null);
	const toolbarRef = useRef<HTMLDivElement | null>(null);
	const searchQuery = useKanbanView((s) => s.searchQuery);
	const setSearchQuery = useKanbanView((s) => s.setSearchQuery);
	const sort = useKanbanView((s) => s.sort);
	const setSort = useKanbanView((s) => s.setSort);
	const filters = useKanbanView((s) => s.filters);
	const setFilters = useKanbanView((s) => s.setFilters);
	const clearFilters = useKanbanView((s) => s.clearFilters);
	const savedFilters = useKanbanView((s) => s.savedFilters);
	const saveCurrentFilters = useKanbanView((s) => s.saveCurrentFilters);
	const loadSavedFilters = useKanbanView((s) => s.loadSavedFilters);
	const clearSavedFilters = useKanbanView((s) => s.clearSavedFilters);
	const previewFields = useKanbanView((s) => s.previewFields);
	const setPreviewFields = useKanbanView((s) => s.setPreviewFields);
	const resetView = useKanbanView((s) => s.resetView);

	// Future: Save filters to shared DB (admin/global). Safe no-op if API not implemented yet.
	const handleSaveFiltersToDb = async () => {
		try {
			const res = await fetch("/api/kanban/saved-filters", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ filters }),
			});
			if (!res.ok) {
				console.warn("Save filters to DB failed with status", res.status);
			}
		} catch (err) {
			console.warn("Save filters to DB not available:", err);
		}
	};

	// AI submenu actions
	const setTasks = useTaskStore((s) => s.setTasks);

	const getMissingAiParams = (task: KanbanTask) => {
		const missing: string[] = [];
		if (!task.title?.trim()) missing.push("title");
		if (!task.dueDate?.trim()) missing.push("dueDate");
		if (!task.assignedToTeamMember?.trim())
			missing.push("assignedToTeamMember");
		// Require either a leadId or a leadListId
		if (!task.leadId && !task.leadListId) missing.push("leadOrLeadList");
		return missing;
	};

	const handleAiScanBoard = () => {
		console.log("[Kanban] AI: Scan Board triggered");
		setTasks(
			tasks.map((t) => {
				if (String(t.status) !== "TODO") return t;
				const missing = getMissingAiParams(t);
				const withWf = t.mcpWorkflow
					? t
					: {
							...t,
							mcpWorkflow: {
								id: String(t.id),
								title: "AI Workflow",
								prompts: [
									{
										text: "",
										description: "Default AI workflow created by Scan Board",
									},
								],
								functions: [],
								resources: [],
							},
						};
				if (missing.length === 0) {
					return { ...withWf, aiState: "pending", aiMissingParams: [] };
				}
				return { ...withWf, aiState: "blocked", aiMissingParams: missing };
			}),
		);
	};

	const handleAiEnableAll = () => {
		console.log("[Kanban] AI: Enable AI for all pending completable tasks");
		setTasks(
			tasks.map((t) => {
				if (String(t.status) !== "TODO") return t;
				const missing = getMissingAiParams(t);
				// Only enable tasks with no missing fields
				if (missing.length === 0) {
					const withWf = t.mcpWorkflow
						? t
						: {
								...t,
								mcpWorkflow: {
									id: String(t.id),
									title: "AI Workflow",
									prompts: [
										{
											text: "",
											description: "Default AI workflow created by bulk enable",
										},
									],
									functions: [],
									resources: [],
								},
							};
					return { ...withWf, aiState: "pending", aiMissingParams: [] };
				}
				return t;
			}),
		);
	};

	const handleAiSuggest = () => {
		console.log("[Kanban] AI: Suggest triggered");
		setSuggestOpen(true);
	};

	// Data sources to build options
	const columns = useTaskStore((s) => s.columns);
	const tasks = useTaskStore((s) => s.tasks);
	const leadLists = useLeadListStore((s) => s.leadLists);
	const userLeads = useUserLeadsStore((s) => s.leads);

	const statusOptions: Status[] = useMemo(
		() => columns.map((c) => String(c.id) as Status),
		[columns],
	);
	const priorityOptions: readonly Priority[] = [
		"high",
		"medium",
		"low",
	] as const;
	const assigneeOptions = useMemo(() => {
		const set = new Set<string>();
		tasks.forEach(
			(t) => t.assignedToTeamMember && set.add(String(t.assignedToTeamMember)),
		);
		return Array.from(set);
	}, [tasks]);
	const leadOptions = useMemo(() => {
		const activeLeadIds = new Set(
			tasks
				.map((task) => task.leadId)
				.filter((leadId): leadId is string => Boolean(leadId))
				.map(String),
		);
		const options = new Map<string, string>();
		for (const lead of userLeads) {
			if (!lead?.id || !activeLeadIds.has(String(lead.id))) continue;
			const fullName = [lead.contactInfo?.firstName, lead.contactInfo?.lastName]
				.filter(Boolean)
				.join(" ")
				.trim();
			const label =
				fullName ||
				lead.contactInfo?.address ||
				lead.address1?.fullStreetLine ||
				String(lead.id);
			options.set(String(lead.id), label);
		}
		for (const leadList of leadLists) {
			for (const lead of leadList.leads ?? []) {
				if (
					!lead?.id ||
					!activeLeadIds.has(String(lead.id)) ||
					options.has(String(lead.id))
				) {
					continue;
				}
				const fullName = [lead.contactInfo?.firstName, lead.contactInfo?.lastName]
					.filter(Boolean)
					.join(" ")
					.trim();
				const label =
					fullName ||
					lead.contactInfo?.address ||
					lead.address1?.fullStreetLine ||
					String(lead.id);
				options.set(String(lead.id), label);
			}
		}
		return Array.from(options.entries()).map(([id, label]) => ({ id, label }));
	}, [leadLists, tasks, userLeads]);
	const leadListOptions = useMemo(() => {
		const activeLeadListIds = new Set(
			tasks
				.map((task) => task.leadListId)
				.filter((leadListId): leadListId is string => Boolean(leadListId))
				.map(String),
		);
		return leadLists
			.filter((leadList) => activeLeadListIds.has(String(leadList.id)))
			.map((leadList) => ({
				id: String(leadList.id),
				label: leadList.listName || String(leadList.id),
			}));
	}, [leadLists, tasks]);

	const sortField: SortField = sort.field;
	const sortDirection: SortDirection = sort.direction;

	const toggleInArray = <T extends string>(arr: T[], value: T): T[] =>
		arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
	const selectedLeadIds = filters.leadId ?? [];
	const selectedLeadListIds = filters.leadListId ?? [];
	const dismissToolbarOverlays = () => {
		setOpenMenu(null);
		setOpenSelect(null);
	};
	const overlayAnchorProps = {
		"data-toolbar-overlay-anchor": "true",
	} as const;
	const menuProps = (menu: ToolbarMenuKey) => ({
		open: openMenu === menu,
		onOpenChange: (nextOpen: boolean) =>
			setOpenMenu(nextOpen ? menu : openMenu === menu ? null : openMenu),
	});
	const menuContentProps = (menu: ToolbarMenuKey) => ({
		"data-toolbar-overlay-surface": "true",
		onInteractOutside: dismissToolbarOverlays,
		onEscapeKeyDown: dismissToolbarOverlays,
	});
	const selectProps = (select: ToolbarSelectKey) => ({
		open: openSelect === select,
		onOpenChange: (nextOpen: boolean) =>
			setOpenSelect(nextOpen ? select : openSelect === select ? null : openSelect),
	});

	useEffect(() => {
		if (!openMenu && !openSelect) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (
				target.closest("[data-toolbar-overlay-anchor='true']") ||
				target.closest("[data-toolbar-overlay-surface='true']")
			) {
				return;
			}
			dismissToolbarOverlays();
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [openMenu, openSelect]);

	// Preview fields options (subset of KanbanTask keys that make sense on cards)
	const previewOptions: Array<keyof KanbanTask> = [
		"priority",
		"scheduledDate",
		"dueDate",
		"assignedToTeamMember",
		"leadId",
		"leadListId",
		"attachments",
		"youtubeUrl",
	];

	return (
		<div
			ref={toolbarRef}
			className="flex w-full flex-wrap items-end gap-3 py-2"
		>
			{/* Search */}
			<div className="flex min-w-[220px] flex-col gap-1">
				<Label htmlFor="kanban-search">Search</Label>
				<Input
					id="kanban-search"
					placeholder="Search tasks..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{/* Status filter (multi) */}
			<div className="flex min-w-[200px] flex-col gap-1">
				<Label>Status</Label>
				<DropdownMenu {...menuProps("status")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="outline"
							className="justify-between w-[220px]"
						>
							{filters.status.length
								? `${filters.status.length} selected`
								: "All"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-56"
						{...menuContentProps("status")}
					>
						<DropdownMenuLabel>Select status</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{statusOptions.map((s) => (
							<DropdownMenuCheckboxItem
								key={s}
								checked={filters.status.includes(s)}
								onCheckedChange={() =>
									setFilters({
										status: toggleInArray<Status>(filters.status, s),
									})
								}
							>
								{s}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Priority filter (multi) */}
			<div className="flex min-w-[200px] flex-col gap-1">
				<Label>Priority</Label>
				<DropdownMenu {...menuProps("priority")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="outline"
							className="justify-between w-[180px]"
						>
							{filters.priority.length
								? `${filters.priority.length} selected`
								: "All"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-56"
						{...menuContentProps("priority")}
					>
						<DropdownMenuLabel>Select priority</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{priorityOptions.map((p) => (
							<DropdownMenuCheckboxItem
								key={p}
								checked={filters.priority.includes(p)}
								onCheckedChange={() =>
									setFilters({
										priority: toggleInArray<Priority>(filters.priority, p),
									})
								}
							>
								{p}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Assignee filter (multi) */}
			<div className="flex min-w-[220px] flex-col gap-1">
				<Label>Assignee</Label>
				<DropdownMenu {...menuProps("assignee")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="outline"
							className="justify-between w-[220px]"
						>
							{filters.assignedToTeamMember.length
								? `${filters.assignedToTeamMember.length} selected`
								: "All"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-64"
						{...menuContentProps("assignee")}
					>
						<DropdownMenuLabel>Select assignees</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{assigneeOptions.map((a) => (
							<DropdownMenuCheckboxItem
								key={a}
								checked={filters.assignedToTeamMember.includes(a)}
								onCheckedChange={() =>
									setFilters({
										assignedToTeamMember: toggleInArray(
											filters.assignedToTeamMember,
											a,
										),
									})
								}
							>
								{a}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex min-w-[220px] flex-col gap-1">
				<Label>Lead</Label>
				<DropdownMenu {...menuProps("lead")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="outline"
							className="justify-between w-[220px]"
						>
							{selectedLeadIds.length ? `${selectedLeadIds.length} selected` : "All"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64" {...menuContentProps("lead")}>
						<DropdownMenuLabel>Select leads</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{leadOptions.map(({ id, label }) => (
							<DropdownMenuCheckboxItem
								key={id}
								checked={selectedLeadIds.includes(id)}
								onCheckedChange={() =>
									setFilters({
										leadId: toggleInArray(selectedLeadIds, id),
									})
								}
							>
								{label}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="flex min-w-[220px] flex-col gap-1">
				<Label>Lead List</Label>
				<DropdownMenu {...menuProps("leadList")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="outline"
							className="justify-between w-[220px]"
						>
							{selectedLeadListIds.length
								? `${selectedLeadListIds.length} selected`
								: "All"}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64" {...menuContentProps("leadList")}>
						<DropdownMenuLabel>Select lead lists</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{leadListOptions.map(({ id, label }) => (
							<DropdownMenuCheckboxItem
								key={id}
								checked={selectedLeadListIds.includes(id)}
								onCheckedChange={() =>
									setFilters({
										leadListId: toggleInArray(selectedLeadListIds, id),
									})
								}
							>
								{label}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Sort field */}
			<div className="flex min-w-[180px] flex-col gap-1">
				<Label>Sort field</Label>
				<Select
					{...selectProps("sortField")}
					value={sortField}
					onValueChange={(v) => setSort({ field: v as SortField })}
				>
					<SelectTrigger
						{...overlayAnchorProps}
						className="w-[200px] bg-card text-card-foreground"
					>
						<SelectValue placeholder="Sort field" />
					</SelectTrigger>
					<SelectContent
						className="bg-card text-card-foreground"
						data-toolbar-overlay-surface="true"
					>
						<SelectItem value="dueDate">Due date</SelectItem>
						<SelectItem value="scheduledDate">Scheduled date</SelectItem>
						<SelectItem value="priority">Priority</SelectItem>
						<SelectItem value="title">Title</SelectItem>
						<SelectItem value="status">Status</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Direction */}
			<div className="flex min-w-[160px] flex-col gap-1">
				<Label>Direction</Label>
				<Select
					{...selectProps("sortDirection")}
					value={sortDirection}
					onValueChange={(v) => setSort({ direction: v as SortDirection })}
				>
					<SelectTrigger
						{...overlayAnchorProps}
						className="w-[160px] bg-card text-card-foreground"
					>
						<SelectValue placeholder="Direction" />
					</SelectTrigger>
					<SelectContent
						className="bg-card text-card-foreground"
						data-toolbar-overlay-surface="true"
					>
						<SelectItem value="asc">Ascending</SelectItem>
						<SelectItem value="desc">Descending</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Quick actions menu: includes preview, Filters submenu, and AI submenu */}
			<div className="flex items-end gap-2 pb-0">
				<DropdownMenu {...menuProps("quickActions")} modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							{...overlayAnchorProps}
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Quick actions"
						>
							<MoreVertical className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-64"
						{...menuContentProps("quickActions")}
					>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>Preview fields</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								{previewOptions.map((k) => (
									<DropdownMenuCheckboxItem
										key={String(k)}
										checked={previewFields.includes(k)}
										onCheckedChange={() =>
											setPreviewFields(toggleInArray(previewFields, k))
										}
									>
										{String(k)}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSeparator />
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>Filters</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										saveCurrentFilters();
									}}
								>
									Save to browser (just me)
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={async (e) => {
										e.preventDefault();
										await handleSaveFiltersToDb();
									}}
								>
									Save for everyone (DB)
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									disabled={!savedFilters}
									onSelect={(e) => {
										e.preventDefault();
										if (savedFilters) loadSavedFilters();
									}}
								>
									Load saved
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										clearFilters();
									}}
								>
									Clear filters
								</DropdownMenuItem>
								<DropdownMenuItem
									disabled={!savedFilters}
									onSelect={(e) => {
										e.preventDefault();
										clearSavedFilters();
									}}
								>
									Clear saved
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										resetView();
									}}
								>
									Reset view to defaults
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>AI</DropdownMenuSubTrigger>
							<DropdownMenuSubContent>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										handleAiScanBoard();
									}}
								>
									Scan Board
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										handleAiEnableAll();
									}}
								>
									Enable AI for all
								</DropdownMenuItem>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										handleAiSuggest();
									}}
								>
									Suggest
								</DropdownMenuItem>
							</DropdownMenuSubContent>
						</DropdownMenuSub>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<SuggestModal open={suggestOpen} onOpenChange={setSuggestOpen} />
		</div>
	);
}
