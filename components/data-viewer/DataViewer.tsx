"use client";

import { RotateCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import { Responsive, useContainerWidth } from "react-grid-layout";

import { LiveMermaidChart } from "@/components/ui/live-mermaid-chart";
import { Mermaid } from "@/components/ui/mermaid";
import { useDataGridStore } from "@/lib/stores/dataGrid";
import PlatformList from "./analytics/PlatformList";
import TargetAudienceList from "./analytics/TargetAudienceList";
import TrafficList from "./analytics/TrafficList";
import { DataViewerProvider } from "./data/context";
import type { MNode } from "./types";

export interface DataViewerProps {
	initialNodeTree?: MNode;
}

const STORAGE_KEY = "data-viewer-chart-layouts";
const GRID_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const GRID_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const GRID_MARGIN: [number, number] = [16, 16];
const GRID_CONTAINER_PADDING: [number, number] = [0, 0];
type ChartLayouts = ResponsiveLayouts<string>;
type Breakpoint = keyof ChartLayouts;
type ChartItemKind = "builtin" | "mermaid";
type ChartItem = {
	id: string;
	kind: ChartItemKind;
	content: React.ReactNode;
};

const defaultLayouts: ChartLayouts = {
	lg: [
		{ i: "platforms", x: 0, y: 0, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "traffic", x: 4, y: 0, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "audience", x: 8, y: 0, w: 4, h: 7, minW: 3, minH: 5 },
	],
	md: [
		{ i: "platforms", x: 0, y: 0, w: 5, h: 7, minW: 3, minH: 5 },
		{ i: "traffic", x: 5, y: 0, w: 5, h: 7, minW: 3, minH: 5 },
		{ i: "audience", x: 0, y: 7, w: 5, h: 7, minW: 3, minH: 5 },
	],
	sm: [
		{ i: "platforms", x: 0, y: 0, w: 6, h: 7, minW: 3, minH: 5 },
		{ i: "traffic", x: 0, y: 7, w: 6, h: 7, minW: 3, minH: 5 },
		{ i: "audience", x: 0, y: 14, w: 6, h: 7, minW: 3, minH: 5 },
	],
	xs: [
		{ i: "platforms", x: 0, y: 0, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "traffic", x: 0, y: 7, w: 4, h: 7, minW: 3, minH: 5 },
		{ i: "audience", x: 0, y: 14, w: 4, h: 7, minW: 3, minH: 5 },
	],
};

const getInitialLayouts = () => {
	if (typeof window === "undefined") return defaultLayouts;

	try {
		const saved = window.localStorage.getItem(STORAGE_KEY);
		return saved ? (JSON.parse(saved) as ChartLayouts) : defaultLayouts;
	} catch {
		return defaultLayouts;
	}
};

const saveLayouts = (layouts: ChartLayouts) => {
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
	} catch {
		// Persistence is best-effort; the grid still works without storage.
	}
};

const areLayoutsEqual = (first: ChartLayouts, second: ChartLayouts) => {
	const breakpoints: Breakpoint[] = ["lg", "md", "sm", "xs", "xxs"];

	return breakpoints.every((breakpoint) => {
		const firstLayout = first[breakpoint] ?? [];
		const secondLayout = second[breakpoint] ?? [];

		if (firstLayout.length !== secondLayout.length) return false;

		return firstLayout.every((firstItem, index) => {
			const secondItem = secondLayout[index];
			return (
				secondItem &&
				firstItem.i === secondItem.i &&
				firstItem.x === secondItem.x &&
				firstItem.y === secondItem.y &&
				firstItem.w === secondItem.w &&
				firstItem.h === secondItem.h &&
				firstItem.minW === secondItem.minW &&
				firstItem.minH === secondItem.minH
			);
		});
	});
};

const getLayoutForItem = (
	id: string,
	breakpoint: Breakpoint,
	index: number,
	kind: ChartItemKind,
): LayoutItem => {
	const columns =
		breakpoint === "lg"
			? 12
			: breakpoint === "md"
				? 10
				: breakpoint === "xxs"
					? 2
					: 6;
	const width =
		breakpoint === "lg"
			? 6
			: breakpoint === "md"
				? 5
				: breakpoint === "xxs"
					? 2
					: 6;
	const cardsPerRow = breakpoint === "lg" ? 2 : 1;
	const x = breakpoint === "lg" ? (index % cardsPerRow) * 6 : 0;
	const y = Math.floor(index / cardsPerRow) * 8;

	return {
		i: id,
		x,
		y,
		w: Math.min(width, columns),
		h: kind === "mermaid" ? 9 : 7,
		minW: Math.min(3, columns),
		minH: 5,
	};
};

const ensureLayoutsForItems = (
	currentLayouts: ChartLayouts,
	items: Array<{ id: string; kind: ChartItemKind }>,
): ChartLayouts => {
	const breakpoints: Breakpoint[] = ["lg", "md", "sm", "xs", "xxs"];
	let changed = false;
	const nextLayouts: ChartLayouts = { ...currentLayouts };
	const itemIds = items.map((item) => item.id);
	const shouldRegenerateLayouts = breakpoints.some((breakpoint) => {
		const current = currentLayouts[breakpoint] ?? [];
		const currentIds = new Set(current.map((item) => item.i));
		const currentOrder = current.map((item) => item.i).join("|");
		const desiredOrder = itemIds.join("|");
		return (
			itemIds.some((id) => !currentIds.has(id)) || currentOrder !== desiredOrder
		);
	});

	for (const breakpoint of breakpoints) {
		const current = currentLayouts[breakpoint] ?? [];
		const currentById = new Map(current.map((item) => [item.i, item]));
		const next = items.map((item, index) => {
			const id = item.id;
			const existing = currentById.get(id);
			if (existing && !shouldRegenerateLayouts) return existing;
			changed = true;
			return getLayoutForItem(id, breakpoint, index, item.kind);
		});

		if (next.length !== current.length) changed = true;
		nextLayouts[breakpoint] = next;
	}

	return changed ? nextLayouts : currentLayouts;
};

function MermaidGridCard({
	code,
	id,
	liveData,
	onRemove,
	title,
}: {
	code: string;
	id: string;
	liveData?: {
		kind: "mockPipeline";
		intervalMs: number;
		seed: number;
	};
	onRemove: (id: string) => void;
	title: string;
}) {
	return (
		<div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-sm">
			<div className="chart-grid-drag-handle flex cursor-move items-center justify-between gap-2 border-b border-border px-4 py-3 text-sm font-medium">
				<span className="truncate">{title}</span>
				<button
					type="button"
					className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
					aria-label={`Remove ${title}`}
					onClick={() => onRemove(id)}
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
			<div className="min-h-0 flex-1 overflow-hidden p-3">
				{liveData?.kind === "mockPipeline" ? (
					<LiveMermaidChart
						className="h-full min-h-0"
						intervalMs={liveData.intervalMs}
						seed={liveData.seed}
						showControls={false}
						title=""
					/>
				) : (
					<Mermaid
						chart={code}
						className="h-full min-h-0"
						showControls={false}
					/>
				)}
			</div>
		</div>
	);
}

export function DataViewer({ initialNodeTree }: DataViewerProps) {
	const [layouts, setLayouts] = useState<ChartLayouts>(getInitialLayouts);
	const [editable, setEditable] = useState(false);
	const mermaidCharts = useDataGridStore((state) => state.mermaidCharts);
	const removeMermaidChart = useDataGridStore(
		(state) => state.removeMermaidChart,
	);
	const { containerRef, mounted, width } = useContainerWidth({
		initialWidth: 1200,
	});
	const dragConfig = useMemo(
		() => ({
			enabled: editable,
			handle: ".chart-grid-drag-handle",
			cancel: "select,button,input,textarea,a",
		}),
		[editable],
	);
	const resizeConfig = useMemo(
		() => ({ enabled: editable, handles: ["se"] as const }),
		[editable],
	);
	const chartItems = useMemo<ChartItem[]>(
		() => [
			...mermaidCharts.map((chart) => ({
				id: chart.id,
				kind: "mermaid" as const,
				content: (
					<MermaidGridCard
						code={chart.code}
						id={chart.id}
						liveData={chart.liveData}
						title={chart.title}
						onRemove={removeMermaidChart}
					/>
				),
			})),
			{ id: "platforms", kind: "builtin", content: <PlatformList /> },
			{ id: "traffic", kind: "builtin", content: <TrafficList /> },
			{ id: "audience", kind: "builtin", content: <TargetAudienceList /> },
		],
		[mermaidCharts, removeMermaidChart],
	);
	const chartLayoutItems = useMemo(
		() => chartItems.map((item) => ({ id: item.id, kind: item.kind })),
		[chartItems],
	);

	useEffect(() => {
		setLayouts((current) => {
			const next = ensureLayoutsForItems(current, chartLayoutItems);
			if (next !== current) saveLayouts(next);
			return next;
		});
	}, [chartLayoutItems]);

	const resetLayouts = () => {
		const next = ensureLayoutsForItems({}, chartLayoutItems);
		setLayouts(next);
		saveLayouts(next);
	};
	const handleLayoutChange = useCallback(
		(_layout: Layout, allLayouts: ChartLayouts) => {
			setLayouts((current) => {
				if (areLayoutsEqual(current, allLayouts)) return current;
				saveLayouts(allLayouts);
				return allLayouts;
			});
		},
		[],
	);

	return (
		<DataViewerProvider initialNodeTree={initialNodeTree}>
			<div className="h-full w-full overflow-y-auto bg-background px-4 pb-4 pt-16 text-foreground">
				<div ref={containerRef} className="mx-auto w-full max-w-6xl">
					<div className="mb-3 flex items-center justify-end gap-2">
						<button
							type="button"
							className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm shadow-sm ${
								editable
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-card text-card-foreground hover:bg-muted"
							}`}
							onClick={() => setEditable((current) => !current)}
						>
							<SlidersHorizontal className="h-4 w-4" />
							Layout
						</button>
						<button
							type="button"
							className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-card-foreground shadow-sm hover:bg-muted"
							onClick={resetLayouts}
						>
							<RotateCcw className="h-4 w-4" />
							Reset
						</button>
					</div>
					{mounted && (
						<Responsive
							className="layout"
							width={width}
							cols={GRID_COLS}
							breakpoints={GRID_BREAKPOINTS}
							layouts={layouts}
							rowHeight={48}
							margin={GRID_MARGIN}
							containerPadding={GRID_CONTAINER_PADDING}
							dragConfig={dragConfig}
							resizeConfig={resizeConfig}
							onLayoutChange={handleLayoutChange}
						>
							{chartItems.map((item) => (
								<div key={item.id} className="min-h-0 overflow-hidden">
									{item.content}
								</div>
							))}
						</Responsive>
					)}
				</div>
			</div>
		</DataViewerProvider>
	);
}

export default DataViewer;
