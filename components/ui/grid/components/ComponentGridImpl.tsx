"use client";
import React, { useEffect, useRef } from "react";
import { useGridData } from "@/components/ui/hooks/useGridData";
import type { GridItem } from "@/types/component-grid";
import ComponentGridControls from "@/components/ui/grid/components/ComponentGridControls";
import type { ComponentGridProps } from "../types";
import { useIntersection } from "../utils/useIntersection";
import { useResponsiveColumns } from "../utils/useResponsiveColumns";
import { ProgressBar } from "./ProgressBar";
import { LoadingStatus, ErrorStatus } from "./Status";
import { StandardGrid } from "./StandardGrid";
import { VirtualizedGrid } from "./VirtualizedGrid";
import { PagedControls } from "./PagedControls";

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

	// Trigger next page when sentinel visible in infinite mode (non-virtualized)
	useEffect(() => {
		if (mode !== "infinite") return;
		if (!atBottom) return;
		if (!grid.hasNextPage) return;
		grid.fetchNextPage?.();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [atBottom, mode, grid.hasNextPage]);

	// Responsive columns and grid template
	const {
		containerRef,
		columns: computedColumns,
		gridTemplate,
	} = useResponsiveColumns(minItemWidth, columns);

	return (
		<div
			ref={containerRef}
			className={"relative flex flex-col gap-4 " + (className ?? "")}
			aria-busy={grid.isFetching}
			data-mode={mode}
			data-fetching={grid.isFetching ? "true" : "false"}
		>
			<ProgressBar active={grid.isFetching} />
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
			<LoadingStatus show={grid.isLoading && grid.items.length === 0} />

			{grid.isError && <ErrorStatus onRetry={() => grid.refetch() as any} />}

			{/* Grid */}
			{!virtualized && (
				<StandardGrid
					items={grid.items}
					isFetching={grid.isFetching}
					total={grid.total}
					gridTemplate={gridTemplate}
					computedColumns={computedColumns}
					ItemComponent={ItemComponent}
					onItemClick={onItemClick}
				/>
			)}

			{virtualized && (
				<VirtualizedGrid
					items={grid.items}
					total={grid.total}
					gridTemplate={gridTemplate}
					computedColumns={computedColumns}
					ItemComponent={ItemComponent}
					onItemClick={onItemClick}
					scrollHeight={scrollHeight}
					isFetching={grid.isFetching}
					onNearEnd={() => {
						if (mode === "infinite" && grid.hasNextPage) grid.fetchNextPage?.();
					}}
				/>
			)}

			{/* Paged controls */}
			{mode === "paged" && (
				<PagedControls
					page={grid.page}
					pageSize={grid.pageSize}
					total={grid.total}
					hasNextPage={grid.hasNextPage}
					setPage={grid.setPage}
				/>
			)}

			{/* Infinite sentinel */}
			{mode === "infinite" && (
				<div ref={sentinelRef} aria-hidden className="h-1 w-full" />
			)}
		</div>
	);
}
