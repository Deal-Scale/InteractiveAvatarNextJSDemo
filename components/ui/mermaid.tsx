"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useDataGridStore } from "@/lib/stores/dataGrid";
import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

export type MermaidProps = {
	chart?: string;
	children?: React.ReactNode; // allow array/text from JSX parser
	className?: string;
	config?: Record<string, unknown>; // mermaid.Config, typed lazily to avoid type dep on server
	idPrefix?: string;
	showControls?: boolean; // copy + expand
	onAddToGrid?: (payload: { code: string; svg?: string }) => void;
};

function normalizeMermaidCode(value: string): string {
	const lines = value.replaceAll("\r\n", "\n").split("\n");
	while (lines.length > 0 && lines[0].trim() === "") lines.shift();
	while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

	const indents = lines
		.filter((line) => line.trim().length > 0)
		.map((line) => line.match(/^\s*/)?.[0].length ?? 0);
	const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

	return lines
		.map((line) => line.slice(minIndent))
		.join("\n")
		.trim();
}

function hashCode(value: string): string {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = Math.imul(31, hash) + value.charCodeAt(index);
	}
	return Math.abs(hash).toString(36);
}

function stretchInjectedSvg(target: HTMLDivElement | null) {
	const svgElement = target?.querySelector("svg");
	if (!(svgElement instanceof SVGSVGElement)) return;

	svgElement.setAttribute("width", "100%");
	svgElement.setAttribute("height", "100%");
	svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
	svgElement.style.display = "block";
	svgElement.style.width = "100%";
	svgElement.style.height = "100%";
	svgElement.style.maxWidth = "none";
}

type MermaidTourWindow = Window & {
	__mindStreamTourMermaidActionsOpen?: boolean;
};

export function Mermaid({
	chart,
	children,
	className,
	config,
	idPrefix = "mermaid",
	showControls = true,
	onAddToGrid,
}: MermaidProps) {
	const [svg, setSvg] = React.useState<string>("");
	const [open, setOpen] = React.useState(false);
	const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle");
	const [zoom, setZoom] = React.useState(1);
	const [renderNonce, setRenderNonce] = React.useState(0);
	const [menuOpen, setMenuOpen] = React.useState(false);
	const [tourPinnedMenu, setTourPinnedMenu] = React.useState(false);
	const [gridAddState, setGridAddState] = React.useState<"idle" | "added">(
		"idle",
	);
	const [status, setStatus] = React.useState<
		"idle" | "rendering" | "success" | "error"
	>("idle");
	const menuRef = React.useRef<HTMLDivElement | null>(null);
	const tourPinnedMenuRef = React.useRef(false);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const modalViewportRef = React.useRef<HTMLDivElement | null>(null);
	const modalSvgRef = React.useRef<HTMLDivElement | null>(null);
	const overlayRef = React.useRef<HTMLDivElement | null>(null);
	const [pan, setPan] = React.useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const isPanningRef = React.useRef(false);
	const lastPointRef = React.useRef<{ x: number; y: number } | null>(null);
	const uid = React.useId().replace(":", "");
	const latestRenderRef = React.useRef(0);
	const lastRenderedCodeRef = React.useRef<string>("");
	const lastRenderNonceRef = React.useRef(renderNonce);
	const prevConfigRef = React.useRef(config);
	const addMermaidChart = useDataGridStore((state) => state.addMermaidChart);
	const setViewTab = useSessionStore((state) => state.setViewTab);
	// Recursively flatten arbitrary children (from react-jsx-parser) into plain text
	const childrenText = React.useMemo(() => {
		const toText = (node: React.ReactNode): string => {
			if (node === null || node === undefined || node === false) return "";
			const t = typeof node;
			if (t === "string" || t === "number") return String(node);
			if (Array.isArray(node)) return node.map(toText).join("");
			// Some parsers may produce elements/objects; try to read their children
			// React element
			if (React.isValidElement(node)) {
				return toText(
					(node as React.ReactElement<{ children?: React.ReactNode }>).props
						?.children,
				);
			}
			// Fallback: attempt generic props.children if present
			const potential = node as
				| { props?: { children?: React.ReactNode } }
				| null
				| undefined;
			if (potential?.props?.children) {
				return toText(potential.props.children);
			}
			// Last resort: avoid "[object Object]"; return empty
			return "";
		};
		const raw = toText(children);
		// Preserve line breaks as-is; trim overall to avoid accidental leading/trailing spaces
		return String(raw ?? "");
	}, [children]);

	const decodeHtml = React.useCallback(
		(s: string) =>
			s
				.replaceAll("&amp;", "&")
				.replaceAll("&lt;", "<")
				.replaceAll("&gt;", ">")
				.replaceAll("&quot;", '"')
				.replaceAll("&#39;", "'")
				.replaceAll("&nbsp;", " ")
				// Numeric character references (decimal and hex)
				.replace(/&#(\d+);/g, (_, d: string) => String.fromCharCode(Number(d)))
				.replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) =>
					String.fromCharCode(parseInt(h, 16)),
				),
		[],
	);

	const code = React.useMemo(() => {
		const raw = String(chart ?? childrenText ?? "");
		// Normalize newlines and decode HTML entities (JSX escaping)
		return normalizeMermaidCode(decodeHtml(raw));
	}, [chart, childrenText, decodeHtml]);

	const stableCode = React.useDeferredValue(code);
	const codeHash = React.useMemo(() => hashCode(stableCode), [stableCode]);
	const isMenuVisible = menuOpen || tourPinnedMenu;

	React.useEffect(() => {
		tourPinnedMenuRef.current = tourPinnedMenu;
	}, [tourPinnedMenu]);

	// Close quick actions menu on outside click or Escape
	React.useEffect(() => {
		if (!isMenuVisible) return;
		const onDown = (e: MouseEvent) => {
			if (!menuRef.current) return;
			if (tourPinnedMenuRef.current) return;
			if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				tourPinnedMenuRef.current = false;
				setTourPinnedMenu(false);
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [isMenuVisible]);

	React.useEffect(() => {
		const tourWindow = window as MermaidTourWindow;
		if (tourWindow.__mindStreamTourMermaidActionsOpen) {
			tourPinnedMenuRef.current = true;
			setTourPinnedMenu(true);
			setMenuOpen(true);
		}
		const openForTour = () => {
			tourWindow.__mindStreamTourMermaidActionsOpen = true;
			tourPinnedMenuRef.current = true;
			setTourPinnedMenu(true);
			setMenuOpen(true);
		};
		const closeForTour = () => {
			tourWindow.__mindStreamTourMermaidActionsOpen = false;
			tourPinnedMenuRef.current = false;
			setTourPinnedMenu(false);
			setMenuOpen(false);
		};
		window.addEventListener("tour-open-mermaid-actions", openForTour);
		window.addEventListener("tour-close-mermaid-actions", closeForTour);
		return () => {
			window.removeEventListener("tour-open-mermaid-actions", openForTour);
			window.removeEventListener("tour-close-mermaid-actions", closeForTour);
		};
	}, []);

	const initializedRef = React.useRef(false);
	React.useEffect(() => {
		if (containerRef.current) {
			containerRef.current.innerHTML = svg;
			stretchInjectedSvg(containerRef.current);
		}
		if (modalSvgRef.current) {
			modalSvgRef.current.innerHTML = svg;
		}
	}, [svg]);
	React.useEffect(() => {
		if (open && modalSvgRef.current) {
			modalSvgRef.current.innerHTML = svg;
		}
	}, [open, svg]);
	React.useEffect(() => {
		if (open) {
			overlayRef.current?.focus();
		}
	}, [open]);
	React.useEffect(() => {
		if (!stableCode) {
			setSvg("");
			lastRenderedCodeRef.current = "";
			setStatus("idle");
			return;
		}

		let cancelled = false;
		const runId = ++latestRenderRef.current;
		const nonceChanged = lastRenderNonceRef.current !== renderNonce;
		lastRenderNonceRef.current = renderNonce;
		if (
			nonceChanged ||
			stableCode !== lastRenderedCodeRef.current ||
			prevConfigRef.current !== config
		) {
			setStatus("rendering");
		}

		async function run() {
			if (!stableCode) return;
			const mermaid = (await import("mermaid")).default;
			const baseConfig = {
				startOnLoad: false,
				securityLevel: "loose" as const,
				...config,
			};
			if (!initializedRef.current || prevConfigRef.current !== config) {
				mermaid.initialize(baseConfig);
				initializedRef.current = true;
				prevConfigRef.current = config;
			}
			try {
				const { svg: renderedSvg } = await mermaid.render(
					`${idPrefix}-${codeHash}-${renderNonce}`,
					stableCode,
				);
				if (!cancelled && latestRenderRef.current === runId) {
					setSvg(renderedSvg);
					lastRenderedCodeRef.current = stableCode;
					setStatus("success");
				}
			} catch (err) {
				if (!cancelled && latestRenderRef.current === runId) {
					setSvg(
						`<pre class='text-red-500'>Mermaid render error: ${String(err)}</pre>`,
					);
					setStatus("error");
					lastRenderedCodeRef.current = "";
				}
			}
		}
		run();
		return () => {
			cancelled = true;
		};
	}, [stableCode, idPrefix, config, renderNonce, codeHash]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopyState("copied");
			setTimeout(() => setCopyState("idle"), 1200);
		} catch {}
	};
	const handleAddToGrid = () => {
		if (onAddToGrid) {
			onAddToGrid({ code, svg });
		} else {
			addMermaidChart({ code });
		}

		setViewTab("data");
		setGridAddState("added");
		window.setTimeout(() => setGridAddState("idle"), 1200);
	};

	const zoomIn = () => setZoom((z) => Math.min(5, +(z + 0.2).toFixed(2)));
	const zoomOut = () => setZoom((z) => Math.max(0.2, +(z - 0.2).toFixed(2)));
	const resetZoom = () => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	};
	const fitToViewport = React.useCallback(() => {
		const wrapper = modalViewportRef.current;
		const svgEl = modalSvgRef.current?.querySelector("svg");
		if (!wrapper || !svgEl) return;

		const w =
			(svgEl as SVGSVGElement).viewBox?.baseVal?.width ||
			(svgEl as SVGSVGElement).width?.baseVal?.value ||
			svgEl.clientWidth ||
			0;
		const h =
			(svgEl as SVGSVGElement).viewBox?.baseVal?.height ||
			(svgEl as SVGSVGElement).height?.baseVal?.value ||
			svgEl.clientHeight ||
			0;
		if (!w || !h) return;

		const containerW = Math.max(0, wrapper.clientWidth - 32);
		const containerH = Math.max(0, wrapper.clientHeight - 32);
		if (!containerW || !containerH) return;

		const nextZoom = Math.max(
			0.1,
			Math.min(5, +Math.min(containerW / w, containerH / h, 1).toFixed(2)),
		);
		const renderedW = w * nextZoom;
		const renderedH = h * nextZoom;

		setZoom(nextZoom);
		setPan({
			x: Math.max(16, (wrapper.clientWidth - renderedW) / 2),
			y: Math.max(16, (wrapper.clientHeight - renderedH) / 2),
		});
	}, []);

	React.useEffect(() => {
		if (!open || !svg) return;
		const frame = window.requestAnimationFrame(fitToViewport);

		return () => window.cancelAnimationFrame(frame);
	}, [fitToViewport, open, svg]);

	if (!code) return null;
	const Toolbar = showControls ? (
		<div className="flex items-center justify-between rounded-t border border-border bg-muted/40 px-2 py-1 text-xs">
			<div className="flex items-center gap-1">
				<Button
					size="sm"
					type="button"
					variant="ghost"
					disabled
					aria-label="Back"
				>
					◀︎
				</Button>
				<Button
					size="sm"
					type="button"
					variant="ghost"
					disabled
					aria-label="Forward"
				>
					▶︎
				</Button>
				<Button
					size="sm"
					type="button"
					variant="secondary"
					onClick={() => setRenderNonce((n) => n + 1)}
					aria-label="Reload"
					disabled={status === "rendering"}
				>
					{status === "error"
						? "Retry"
						: status === "rendering"
							? "Rendering…"
							: "Reload"}
				</Button>
			</div>
			<div className="relative" ref={menuRef}>
				<Button
					size="sm"
					variant="ghost"
					data-tour="mermaid-actions"
					aria-haspopup="menu"
					aria-expanded={isMenuVisible}
					aria-label="Quick actions"
					onClick={() => {
						tourPinnedMenuRef.current = false;
						setTourPinnedMenu(false);
						setMenuOpen((v) => !v);
					}}
				>
					⋯
				</Button>
				<div
					aria-hidden={!isMenuVisible}
					role="menu"
					className={cn(
						"absolute right-0 z-[2147483646] w-44 overflow-hidden rounded-md border border-border bg-popover shadow-md",
						tourPinnedMenu ? "bottom-full mb-1" : "mt-1",
						isMenuVisible ? "opacity-100" : "pointer-events-none opacity-0",
					)}
				>
					<button
						type="button"
						role="menuitem"
						className="block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-accent"
						onClick={() => {
							tourPinnedMenuRef.current = false;
							setTourPinnedMenu(false);
							setMenuOpen(false);
							handleCopy();
						}}
					>
						{copyState === "copied" ? "Copied" : "Copy"}
					</button>
					<button
						type="button"
						role="menuitem"
						className="block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-accent"
						onClick={() => {
							tourPinnedMenuRef.current = false;
							setTourPinnedMenu(false);
							setMenuOpen(false);
							setPan({ x: 0, y: 0 });
							setOpen(true);
						}}
					>
						View
					</button>
					<button
						type="button"
						role="menuitem"
						disabled={status === "rendering"}
						className={cn(
							"block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-accent",
							status === "rendering" && "cursor-not-allowed opacity-50",
						)}
						onClick={() => {
							if (status === "rendering") return;
							tourPinnedMenuRef.current = false;
							setTourPinnedMenu(false);
							setMenuOpen(false);
							setRenderNonce((n) => n + 1);
						}}
					>
						{status === "error"
							? "Retry"
							: status === "rendering"
								? "Rendering…"
								: "Reload"}
					</button>
					<button
						type="button"
						role="menuitem"
						data-tour="mermaid-add-to-grid"
						className={cn(
							"block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-accent",
						)}
						onClick={() => {
							tourPinnedMenuRef.current = false;
							setTourPinnedMenu(false);
							setMenuOpen(false);
							handleAddToGrid();
						}}
					>
						{gridAddState === "added" ? "Added" : "Add to Grid"}
					</button>
				</div>
			</div>
		</div>
	) : null;

	if (!svg) {
		return (
			<div className={cn("relative flex flex-col", className)}>
				{Toolbar}
				<pre
					className={cn(
						"min-h-0 flex-1 overflow-auto p-2 text-xs whitespace-pre-wrap text-muted-foreground",
					)}
				>
					{code}
				</pre>
			</div>
		);
	}
	return (
		<div
			className={cn("relative flex flex-col", className)}
			data-tour="mermaid-preview"
			data-mermaid-id={`${idPrefix}-${uid}`}
		>
			{Toolbar}
			<div
				ref={containerRef}
				className={cn(
					"mermaid-container min-h-0 flex-1 overflow-auto border border-border bg-card [&_svg]:h-full [&_svg]:min-h-full [&_svg]:w-full [&_svg]:max-w-none",
					showControls ? "rounded-b" : "rounded-md",
				)}
			/>
			{open && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="Mermaid preview"
					ref={overlayRef}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
					tabIndex={-1}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							setOpen(false);
							return;
						}
						const step = event.shiftKey ? 32 : 16;
						if (event.key === "ArrowUp") {
							event.preventDefault();
							setPan((p) => ({ x: p.x, y: p.y + step }));
						} else if (event.key === "ArrowDown") {
							event.preventDefault();
							setPan((p) => ({ x: p.x, y: p.y - step }));
						} else if (event.key === "ArrowLeft") {
							event.preventDefault();
							setPan((p) => ({ x: p.x + step, y: p.y }));
						} else if (event.key === "ArrowRight") {
							event.preventDefault();
							setPan((p) => ({ x: p.x - step, y: p.y }));
						} else if (event.key === "+" || event.key === "=") {
							event.preventDefault();
							zoomIn();
						} else if (event.key === "-" || event.key === "_") {
							event.preventDefault();
							zoomOut();
						}
					}}
					onClick={(event) => {
						if (event.target === event.currentTarget) {
							setOpen(false);
						}
					}}
				>
					<div className="max-h-[90vh] max-w-[90vw] overflow-hidden rounded bg-background p-3 shadow-xl w-full h-full md:w-auto md:h-auto">
						<div className="mb-2 flex items-center justify-between gap-2">
							<div className="text-sm text-muted-foreground">
								Mermaid Preview
							</div>
							<div className="flex items-center gap-1">
								<Button
									size="sm"
									type="button"
									variant="secondary"
									onClick={zoomOut}
									aria-label="Zoom out"
								>
									-
								</Button>
								<div className="px-2 text-xs tabular-nums">
									{Math.round(zoom * 100)}%
								</div>
								<Button
									size="sm"
									type="button"
									variant="secondary"
									onClick={zoomIn}
									aria-label="Zoom in"
								>
									+
								</Button>
								<Button
									size="sm"
									type="button"
									variant="ghost"
									onClick={resetZoom}
									aria-label="Reset zoom"
								>
									Reset
								</Button>
								<Button
									size="sm"
									type="button"
									variant="ghost"
									onClick={fitToViewport}
									aria-label="Fit diagram"
								>
									Fit
								</Button>
								<Button
									size="sm"
									type="button"
									variant="ghost"
									onClick={() => setOpen(false)}
								>
									Close
								</Button>
							</div>
						</div>
						{
							<div
								id={`mermaid-modal-${idPrefix}-${uid}`}
								ref={modalViewportRef}
								role="application"
								aria-label="Interactive Mermaid diagram"
								className="relative h-[calc(90vh-4.5rem)] w-[calc(90vw-1.5rem)] overflow-auto border border-border rounded bg-card cursor-grab"
								onWheel={(e) => {
									if (!e.ctrlKey && !e.metaKey) return;
									e.preventDefault();
									const delta = e.deltaY > 0 ? -0.2 : 0.2;
									setZoom((z) =>
										Math.max(0.2, Math.min(5, +(z + delta).toFixed(2))),
									);
								}}
								onMouseDown={(e) => {
									isPanningRef.current = true;
									(e.currentTarget as HTMLDivElement).classList.add(
										"cursor-grabbing",
									);
									lastPointRef.current = { x: e.clientX, y: e.clientY };
								}}
								onMouseMove={(e) => {
									if (!isPanningRef.current || !lastPointRef.current) return;
									const dx = e.clientX - lastPointRef.current.x;
									const dy = e.clientY - lastPointRef.current.y;
									lastPointRef.current = { x: e.clientX, y: e.clientY };
									setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
								}}
								onMouseUp={(e) => {
									isPanningRef.current = false;
									(e.currentTarget as HTMLDivElement).classList.remove(
										"cursor-grabbing",
									);
								}}
								onMouseLeave={(e) => {
									isPanningRef.current = false;
									(e.currentTarget as HTMLDivElement).classList.remove(
										"cursor-grabbing",
									);
								}}
							>
								<div
									ref={modalSvgRef}
									style={{
										transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
										transformOrigin: "top left",
									}}
									className="inline-block min-h-full min-w-full select-none"
								/>
							</div>
						}
					</div>
				</div>
			)}
		</div>
	);
}
