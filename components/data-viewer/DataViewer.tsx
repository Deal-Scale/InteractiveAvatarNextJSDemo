"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { Responsive, useContainerWidth } from "react-grid-layout";

import PlatformList from "./analytics/PlatformList";
import TargetAudienceList from "./analytics/TargetAudienceList";
import TrafficList from "./analytics/TrafficList";
import { DataViewerProvider } from "./data/context";
import type { MNode } from "./types";

export interface DataViewerProps {
	initialNodeTree?: MNode;
}

const STORAGE_KEY = "data-viewer-chart-layouts";
type ChartLayouts = ResponsiveLayouts<string>;

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

export function DataViewer({ initialNodeTree }: DataViewerProps) {
	const [layouts, setLayouts] = useState<ChartLayouts>(getInitialLayouts);
	const [editable, setEditable] = useState(false);
	const { containerRef, mounted, width } = useContainerWidth({
		initialWidth: 1200,
	});
	const chartItems = useMemo(
		() => [
			{ id: "platforms", content: <PlatformList /> },
			{ id: "traffic", content: <TrafficList /> },
			{ id: "audience", content: <TargetAudienceList /> },
		],
		[],
	);

	const resetLayouts = () => {
		setLayouts(defaultLayouts);
		saveLayouts(defaultLayouts);
	};

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
							cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
							breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
							layouts={layouts}
							rowHeight={48}
							margin={[16, 16]}
							containerPadding={[0, 0]}
							dragConfig={{
								enabled: editable,
								handle: ".chart-grid-drag-handle",
								cancel: "select,button,input,textarea,a",
							}}
							resizeConfig={{ enabled: editable, handles: ["se"] }}
							onLayoutChange={(_layout: Layout, allLayouts: ChartLayouts) => {
								setLayouts(allLayouts);
								saveLayouts(allLayouts);
							}}
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
