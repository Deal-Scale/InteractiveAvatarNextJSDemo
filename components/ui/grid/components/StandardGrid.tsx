"use client";
import React from "react";
import type { GridItem } from "@/types/component-grid";
import type { GridItemRendererProps } from "../types";

type Props<TItem extends GridItem> = {
	items: TItem[];
	isFetching: boolean;
	total: number | undefined;
	gridTemplate: string;
	computedColumns: number;
	ItemComponent: React.ComponentType<GridItemRendererProps<TItem>>;
	onItemClick?: (item: TItem) => void;
};

export function StandardGrid<TItem extends GridItem = GridItem>({
	items,
	isFetching,
	total,
	gridTemplate,
	computedColumns,
	ItemComponent,
	onItemClick,
}: Props<TItem>) {
	return (
		<div
			role="grid"
			aria-rowcount={total}
			className={
				"grid gap-4 transition-opacity duration-150 " +
				(isFetching ? "opacity-60" : "")
			}
			style={{ gridTemplateColumns: gridTemplate }}
		>
			{items.map((item, idx) => (
				<div
					role="gridcell"
					key={(item as any).id ?? idx}
					className="aspect-[4/3] min-h-[148px] sm:min-h-[164px]"
				>
					<ItemComponent item={item} index={idx} onSelect={onItemClick} />
				</div>
			))}

			{isFetching && items.length > 0 && (
				<>
					{Array.from({ length: Math.min(6, computedColumns) }).map((_, i) => (
						<div
							key={"skeleton-" + i}
							aria-hidden
							className="aspect-[4/3] min-h-[148px] sm:min-h-[164px] animate-pulse rounded-md border bg-gray-100 dark:bg-gray-800"
						/>
					))}
				</>
			)}
		</div>
	);
}
