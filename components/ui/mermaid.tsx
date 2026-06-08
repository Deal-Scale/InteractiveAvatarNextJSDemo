"use client";

import * as React from "react";
import { useDataGridStore } from "@/lib/stores/dataGrid";
import { cn } from "@/lib/utils";
import { MermaidActionsMenu } from "./mermaid-actions-menu";
import { MermaidPreviewModal } from "./mermaid-preview-modal";
import { normalizeMermaidSource } from "./mermaid-source";

export type MermaidProps = {
	chart?: string;
	children?: React.ReactNode;
	className?: string;
	liveData?: {
		kind: "mockPipeline";
		intervalMs: number;
		seed: number;
	};
	showControls?: boolean;
	title?: string;
	onAddToGrid?: (payload: { code: string; svg?: string }) => void;
};

type MermaidTourWindow = Window & {
	__mindStreamTourMermaidActionsOpen?: boolean;
};

const MAX_CACHED_SVGS = 50;
const renderedSvgCache = new Map<string, string>();

function getCachedSvg(cacheKey: string) {
	return renderedSvgCache.get(cacheKey);
}

function cacheRenderedSvg(cacheKey: string, svg: string) {
	renderedSvgCache.set(cacheKey, svg);
	if (renderedSvgCache.size <= MAX_CACHED_SVGS) return;

	const oldestKey = renderedSvgCache.keys().next().value;
	if (oldestKey) renderedSvgCache.delete(oldestKey);
}

export function Mermaid({
	chart,
	children,
	className,
	liveData,
	onAddToGrid,
	showControls = true,
	title,
}: MermaidProps) {
	const code = normalizeMermaidSource(chart, children);
	const addLiveMermaidChart = useDataGridStore(
		(state) => state.addLiveMermaidChart,
	);
	const addMermaidChart = useDataGridStore((state) => state.addMermaidChart);
	const [actionsOpen, setActionsOpen] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [viewOpen, setViewOpen] = React.useState(false);
	const [renderNonce, setRenderNonce] = React.useState(0);
	const [renderedSvg, setRenderedSvg] = React.useState(() =>
		code ? (getCachedSvg(`0:${code}`) ?? "") : "",
	);
	const [isRendering, setIsRendering] = React.useState(false);
	const latestSvgRef = React.useRef("");
	const renderIdRef = React.useRef(
		`mermaid-${Math.random().toString(36).slice(2, 11)}`,
	);
	const tourPinnedMenuRef = React.useRef(false);

	React.useEffect(() => {
		if (!code) {
			setRenderedSvg("");
			setError("No diagram source provided.");
			return;
		}

		const cacheKey = `${renderNonce}:${code}`;
		const cachedSvg = getCachedSvg(cacheKey);
		if (cachedSvg) {
			latestSvgRef.current = cachedSvg;
			setRenderedSvg(cachedSvg);
			setIsRendering(false);
			setError(null);
			return;
		}

		let cancelled = false;
		setIsRendering(true);
		setError(null);

		import("mermaid")
			.then(async (mermaidModule) => {
				const mermaid = mermaidModule.default;

				mermaid.initialize({
					startOnLoad: false,
					theme: "dark",
					themeVariables: {
						background: "#020617",
						darkMode: true,
						fontFamily: "ui-sans-serif, system-ui, sans-serif",
						lineColor: "#38bdf8",
						mainBkg: "#0f172a",
						primaryBorderColor: "#38bdf8",
						primaryColor: "#0f172a",
						primaryTextColor: "#f8fafc",
						secondaryColor: "#164e63",
						secondBkg: "#1e293b",
						tertiaryBkg: "#334155",
						tertiaryColor: "#1d4ed8",
					},
					flowchart: {
						curve: "basis",
						padding: 20,
					},
					securityLevel: "strict",
				});

				const { svg } = await mermaid.render(
					`${renderIdRef.current}-${renderNonce}`,
					code,
				);
				if (cancelled) return;
				latestSvgRef.current = svg;
				cacheRenderedSvg(cacheKey, svg);
				setRenderedSvg(svg);
			})
			.catch((renderError) => {
				if (cancelled) return;
				console.error("Mermaid rendering error:", renderError);
				setRenderedSvg("");
				setError("Unable to render this Mermaid diagram.");
			})
			.finally(() => {
				if (!cancelled) {
					setIsRendering(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [code, renderNonce]);

	React.useEffect(() => {
		const openForTour = () => {
			tourPinnedMenuRef.current = true;
			setActionsOpen(true);
		};
		const closeForTour = () => {
			tourPinnedMenuRef.current = false;
			setActionsOpen(false);
		};

		window.addEventListener("tour-open-mermaid-actions", openForTour);
		window.addEventListener("tour-close-mermaid-actions", closeForTour);
		return () => {
			window.removeEventListener("tour-open-mermaid-actions", openForTour);
			window.removeEventListener("tour-close-mermaid-actions", closeForTour);
		};
	}, []);

	const handleAddToGrid = () => {
		if (onAddToGrid) {
			onAddToGrid({ code, svg: latestSvgRef.current || undefined });
		} else if (liveData?.kind === "mockPipeline") {
			addLiveMermaidChart({
				intervalMs: liveData.intervalMs,
				title: title || "Live Mermaid",
			});
		} else if (code) {
			addMermaidChart({
				code,
				title,
			});
		}
		if (!(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen) {
			setActionsOpen(false);
		}
	};
	const reloadDiagram = () => {
		setRenderNonce((current) => current + 1);
	};
	const isTourPinned = tourPinnedMenuRef.current;

	return (
		<div
			className={cn(
				"relative flex min-h-52 flex-col rounded-md border border-border bg-background p-3",
				className,
			)}
		>
			<div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded border border-border/70 bg-slate-950 p-3">
				{showControls ? (
					<MermaidActionsMenu
						isOpen={actionsOpen}
						isTourPinned={isTourPinned}
						onAddToGrid={handleAddToGrid}
						onCopy={() => navigator.clipboard?.writeText(code)}
						onReload={reloadDiagram}
						onToggle={() => {
							tourPinnedMenuRef.current = false;
							setActionsOpen((open) => !open);
						}}
						onView={() => setViewOpen(true)}
						setOpen={setActionsOpen}
					/>
				) : null}
				{renderedSvg ? (
					<div
						className="flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:max-h-full [&_svg]:max-w-full"
						dangerouslySetInnerHTML={{ __html: renderedSvg }}
					/>
				) : (
					<div className="grid gap-2 text-center">
						<div className="text-muted-foreground text-sm">
							{isRendering ? "Rendering Mermaid diagram..." : error}
						</div>
						{error ? (
							<pre className="max-h-40 max-w-full overflow-auto whitespace-pre-wrap rounded bg-background p-2 text-left text-xs">
								{code}
							</pre>
						) : null}
					</div>
				)}
			</div>
			<MermaidPreviewModal
				isOpen={viewOpen}
				isRendering={isRendering}
				renderedSvg={renderedSvg}
				title={title}
				onClose={() => setViewOpen(false)}
			/>
		</div>
	);
}
