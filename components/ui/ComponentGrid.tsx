"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
	columns?: number; // acts as a fallback when width unknown
	minItemWidth?: number; // default 220px; used to compute responsive column count
	className?: string;
	// Virtualization
	virtualized?: boolean; // default false
	scrollHeight?: number | string; // e.g., 480 or "60vh"
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
		minItemWidth = 220,
		className,
		virtualized = false,
		scrollHeight = 480,
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

	// Responsive columns calculation via ResizeObserver
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [containerWidth, setContainerWidth] = React.useState(0);
	useEffect(() => {
		if (!containerRef.current) return;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cw = entry.contentRect.width;
				setContainerWidth(cw);
			}
		});
		ro.observe(containerRef.current);
		return () => ro.disconnect();
	}, []);

	const computedColumns = useMemo(() => {
		if (containerWidth > 0) {
			const count = Math.max(1, Math.floor(containerWidth / minItemWidth));
			return count;
		}
		return Math.max(1, columns);
	}, [containerWidth, minItemWidth, columns]);

	const gridTemplate = useMemo(
		() => `repeat(${computedColumns}, minmax(0, 1fr))`,
		[computedColumns],
	);

	// Virtualization setup (rows-based)
	const scrollParentRef = useRef<HTMLDivElement | null>(null);
	const rowCount = Math.max(1, Math.ceil(grid.items.length / computedColumns));
	const estimateRowSize = 184; // approx for aspect-[4/3] cells with gaps
	const rowVirtualizer = useVirtualizer({
		count: virtualized ? rowCount : 0,
		getScrollElement: () => scrollParentRef.current,
		estimateSize: () => estimateRowSize,
		overscan: 4,
	});

	// Infinite fetch trigger for virtualized scrolling
	useEffect(() => {
		if (!virtualized) return;
		if (mode !== "infinite") return;
		if (!grid.hasNextPage) return;
		const vItems = rowVirtualizer.getVirtualItems();
		if (!vItems.length) return;
		const last = vItems[vItems.length - 1];
		// If the last rendered row is within 2 rows of the end, fetch next page
		if (last.index >= rowCount - 2) {
			grid.fetchNextPage?.();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [virtualized, mode, grid.hasNextPage, rowVirtualizer, rowCount]);

	return (
		<div
			ref={containerRef}
			className={"relative flex flex-col gap-4 " + (className ?? "")}
			aria-busy={grid.isFetching}
			data-mode={mode}
			data-fetching={grid.isFetching ? "true" : "false"}
		>
			{/* Thin progress bar while fetching to avoid jumpy feel */}
			{grid.isFetching && (
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
				>
					<div className="h-full w-1/3 animate-pulse rounded-r bg-muted-foreground/40" />
				</div>
			)}
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
			{!virtualized && (
				<div
					role="grid"
					aria-rowcount={grid.total}
					className={
						"grid gap-4 transition-opacity duration-150 " +
						(grid.isFetching ? "opacity-60" : "")
					}
					style={{ gridTemplateColumns: gridTemplate }}
				>
					{grid.items.map((item, idx) => (
						<div
							role="gridcell"
							key={(item as any).id ?? idx}
							className="aspect-[4/3] min-h-[148px] sm:min-h-[164px]"
						>
							<ItemComponent item={item} index={idx} onSelect={onItemClick} />
						</div>
					))}

					{/* Skeleton placeholders to stabilize layout while fetching */}
					{grid.isFetching && grid.items.length > 0 && (
						<>
							{Array.from({ length: Math.min(6, computedColumns) }).map(
								(_, i) => (
									<div
										key={"skeleton-" + i}
										aria-hidden
										className="aspect-[4/3] min-h-[148px] sm:min-h-[164px] animate-pulse rounded-md border bg-gray-100 dark:bg-gray-800"
									/>
								),
							)}
						</>
					)}
				</div>
			)}

			{virtualized && (
				<div
					ref={scrollParentRef}
					className={
						"relative overflow-auto transition-opacity duration-150 " +
						(grid.isFetching ? "opacity-60" : "")
					}
					style={{
						maxHeight:
							typeof scrollHeight === "number"
								? `${scrollHeight}px`
								: scrollHeight,
					}}
					aria-label="Virtualized Grid Scroll Container"
				>
					<div
						style={{
							height: rowVirtualizer.getTotalSize(),
							position: "relative",
						}}
						role="grid"
						aria-rowcount={grid.total}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const rowIndex = virtualRow.index;
							const start = rowIndex * computedColumns;
							const end = Math.min(start + computedColumns, grid.items.length);
							return (
								<div
									key={virtualRow.key}
									data-index={rowIndex}
									className="grid gap-4"
									style={{
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: virtualRow.size,
										transform: `translateY(${virtualRow.start}px)`,
										gridTemplateColumns: gridTemplate,
									}}
									role="row"
								>
									{Array.from({ length: end - start }).map((_, ci) => {
										const idx = start + ci;
										const item = grid.items[idx];
										return (
											<div
												role="gridcell"
												key={(item as any)?.id ?? idx}
												className="aspect-[4/3] min-h-[148px] sm:min-h-[164px]"
											>
												<ItemComponent
													item={item}
													index={idx}
													onSelect={onItemClick}
												/>
											</div>
										);
									})}
								</div>
							);
						})}
					</div>
				</div>
			)}

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
