"use client";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { GridItem } from "@/types/component-grid";
import type { GridItemRendererProps } from "../types";

type Props<TItem extends GridItem> = {
	items: TItem[];
	total: number | undefined;
	gridTemplate: string;
	computedColumns: number;
	ItemComponent: React.ComponentType<GridItemRendererProps<TItem>>;
	onItemClick?: (item: TItem) => void;
	scrollHeight: number | string;
	isFetching: boolean;
	onNearEnd?: () => void;
};

export function VirtualizedGrid<TItem extends GridItem = GridItem>({
	items,
	total,
	gridTemplate,
	computedColumns,
	ItemComponent,
	onItemClick,
	scrollHeight,
	isFetching,
	onNearEnd,
}: Props<TItem>) {
	const scrollParentRef = React.useRef<HTMLDivElement | null>(null);
	const rowCount = Math.max(1, Math.ceil(items.length / computedColumns));
	const estimateRowSize = 184;
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => scrollParentRef.current,
		estimateSize: () => estimateRowSize,
		overscan: 4,
	});

	React.useEffect(() => {
		if (!onNearEnd) return;
		const vItems = rowVirtualizer.getVirtualItems();
		if (!vItems.length) return;
		const last = vItems[vItems.length - 1];
		if (last.index >= rowCount - 2) onNearEnd();
	}, [onNearEnd, rowVirtualizer, rowCount, items.length]);

	return (
		<div
			ref={scrollParentRef}
			className={
				"relative overflow-auto transition-opacity duration-150 " +
				(isFetching ? "opacity-60" : "")
			}
			style={{
				maxHeight:
					typeof scrollHeight === "number" ? `${scrollHeight}px` : scrollHeight,
			}}
			aria-label="Virtualized Grid Scroll Container"
		>
			<div
				style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
				role="grid"
				aria-rowcount={total}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const rowIndex = virtualRow.index;
					const start = rowIndex * computedColumns;
					const end = Math.min(start + computedColumns, items.length);
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
								const item = items[idx];
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
	);
}
