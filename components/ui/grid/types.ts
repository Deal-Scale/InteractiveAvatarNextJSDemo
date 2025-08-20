import React from "react";
import type {
	GridFetcher,
	GridItem,
	UseGridDataOptions,
} from "@/types/component-grid";

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
