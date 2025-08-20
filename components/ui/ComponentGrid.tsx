"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useGridData } from "@/components/ui/hooks/useGridData";
import type {
	GridFetcher,
	GridItem,
	UseGridDataOptions,
} from "@/types/component-grid";
import ComponentGridControls from "@/components/ui/ComponentGridControls";

export type GridItemRendererProps<TItem extends GridItem = GridItem> = {
	item: TItem;
	index: number;
	selected?: boolean;
	className?: string;
	onSelect?: (item: TItem) => void;
};

export type ComponentGridProps<TItem extends GridItem = GridItem> = {
	fetcher: GridFetcher<TItem>;
	pageSize?: number;
	mode?: UseGridDataOptions<TItem>["mode"];
	debounceMs?: number;
	categories?: string[]; // available categories
	initialCategories?: string[];
	initialSearch?: string;
	initialTags?: string[];
	initialPage?: number;
	enabled?: boolean;
	queryKeyBase?: (string | number)[];
	onItemClick?: (item: TItem) => void;
	ItemComponent: React.ComponentType<GridItemRendererProps<TItem>>;
	// Layout
	columns?: number; // default 4
	className?: string;
};

function useIntersection(
	ref: React.RefObject<Element | null>,
	options?: IntersectionObserverInit,
) {
	const [isIntersecting, setIntersecting] = React.useState(false);
	useEffect(() => {
		if (!ref.current) return;
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			setIntersecting(entry.isIntersecting);
		}, options);
		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [ref, options]);
	return isIntersecting;
}

export default function ComponentGrid<TItem extends GridItem = GridItem>(
	props: ComponentGridProps<TItem>,
) {
	const {
		fetcher,
		pageSize = 24,
		mode = "infinite",
		debounceMs = 250,
		categories = [],
		initialCategories = [],
		initialSearch = "",
		initialTags = [],
		initialPage = 1,
		enabled = true,
		queryKeyBase = [],
		onItemClick,
		ItemComponent,
		columns = 4,
		className,
	} = props;

	const grid = useGridData<TItem>({
		fetcher,
		pageSize,
		mode,
		debounceMs,
		initialCategories,
		initialSearch,
		initialTags,
		initialPage,
		enabled,
		queryKeyBase,
	});

	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const atBottom = useIntersection(sentinelRef, { rootMargin: "200px" });

	// Trigger next page when sentinel visible in infinite mode
	useEffect(() => {
		if (mode !== "infinite") return;
		if (!atBottom) return;
		if (!grid.hasNextPage) return;
		grid.fetchNextPage?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [atBottom, mode, grid.hasNextPage]);

	const gridTemplate = useMemo(
		() => `repeat(${columns}, minmax(0, 1fr))`,
		[columns],
	);

	return (
		<div
			className={"flex flex-col gap-4 " + (className ?? "")}
			aria-busy={grid.isFetching}
			data-mode={mode}
		>
			<ComponentGridControls
				search={grid.search}
				onSearchChange={grid.setSearch}
				categories={categories}
				selectedCategories={grid.categories}
				onCategoriesChange={grid.setCategories}
				mode={mode}
				onModeChange={undefined}
				onClearAll={grid.clearFilters}
			/>

			{/* Status states */}
			{grid.isLoading && grid.items.length === 0 && (
				<div role="status" aria-live="polite" className="text-sm text-gray-500">
					Loading…
				</div>
			)}

			{grid.isError && (
				<div role="alert" className="text-sm text-red-600">
					Failed to load items.
					<button
						className="ml-2 underline"
						onClick={() => grid.refetch() as any}
					>
						Retry
					</button>
				</div>
			)}

			{/* Grid */}
			<div
				role="grid"
				aria-rowcount={grid.total}
				className="grid gap-4"
				style={{ gridTemplateColumns: gridTemplate }}
			>
				{grid.items.map((item, idx) => (
					<div role="gridcell" key={(item as any).id ?? idx}>
						<ItemComponent item={item} index={idx} onSelect={onItemClick} />
					</div>
				))}
			</div>

			{/* Paged controls */}
			{mode === "paged" && (
				<div className="flex items-center justify-between gap-3">
					<button
						className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
						onClick={() => grid.setPage(Math.max(1, grid.page - 1))}
						disabled={grid.page <= 1}
					>
						Previous
					</button>
					<div className="text-sm">
						Page {grid.page} of{" "}
						{Math.max(1, Math.ceil(grid.total / grid.pageSize))}
					</div>
					<button
						className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
						onClick={() => grid.setPage(grid.page + 1)}
						disabled={!grid.hasNextPage}
					>
						Next
					</button>
				</div>
			)}

			{/* Infinite sentinel */}
			{mode === "infinite" && (
				<div ref={sentinelRef} aria-hidden className="h-1 w-full" />
			)}
		</div>
	);
}
