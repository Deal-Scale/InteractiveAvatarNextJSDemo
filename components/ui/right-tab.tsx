"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Minimize2Icon, Maximize2Icon } from "lucide-react";

import { usePlacementStore } from "@/lib/stores/placement";
import { safeWindow } from "@/lib/utils";

interface RightTabProps {
	minFrac?: number; // fraction considered collapsed
	defaultFrac?: number; // width when expanding via click
	className?: string;
	label?: React.ReactNode;
	children?: React.ReactNode;
	actions?: React.ReactNode; // optional action buttons to render in left rail
}

export function RightTab({
	minFrac = 0,
	defaultFrac = 0.32,
	className = "",
	label = "Chat",
	children,
	actions,
}: RightTabProps) {
	// Avoid SSR/CSR mismatch from window-dependent sizing by rendering after mount
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const widthFrac = usePlacementStore((s) => s.rightWidthFrac);
	const setWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);

	const isClosed = widthFrac <= 0.01;

	const widthPx = useMemo(() => {
		const w = safeWindow();

		if (!w) return 0;
		return Math.round((widthFrac || 0) * w.innerWidth);
	}, [widthFrac]);

	const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
		if (e.button !== 0) return;
		const startX = e.clientX;
		const startFrac = widthFrac;
		let moving = startFrac;

		const onMove = (ev: PointerEvent) => {
			const w = safeWindow();
			const vw = w?.innerWidth || 1;
			const dx = startX - ev.clientX; // dragging left increases width
			const next = Math.max(0, Math.min(0.95, startFrac + dx / vw));

			moving = next;
			setWidthFrac(next);
		};
		const onUp = () => {
			const w = safeWindow();

			if (w) {
				w.removeEventListener("pointermove", onMove);
				w.removeEventListener("pointerup", onUp);
			}
			try {
				const w = safeWindow();
				const vw = w?.innerWidth || 1;
				const px = Math.round(moving * vw);
				const thresholdPx = Math.max(56, Math.round(0.06 * vw));

				if (px <= thresholdPx) setWidthFrac(0);
			} catch {}
		};

		const w = safeWindow();

		if (w) {
			w.addEventListener("pointermove", onMove, { passive: true });
			w.addEventListener("pointerup", onUp, { once: true });
		}
	};

	const onClick = () => {
		if (widthFrac <= minFrac + 0.001 || widthFrac < defaultFrac * 0.9) {
			setWidthFrac(defaultFrac);
		}
	};

	if (!mounted) return null;

	if (!isClosed) {
		return (
			<section
				aria-label="Chat right drawer"
				className={
					"fixed right-0 top-0 bottom-0 z-30 border-l border-border bg-background text-foreground shadow-lg " +
					"flex flex-row min-w-[48px] overflow-hidden " +
					className
				}
				style={{ width: widthPx }}
			>
				{/* Left rail with actions */}
				<div className="relative flex w-12 shrink-0 flex-col items-stretch justify-start border-r border-border/60 bg-background/80">
					{/* Resize handle area (left edge) */}
					<hr
						className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-muted/20 hover:bg-muted/40 transition-colors"
						onPointerDown={onPointerDown}
					/>
					{/* Actions stack */}
					<div className="flex flex-col items-center gap-2 px-1 py-2">
						<button
							aria-label="Maximize chat width"
							className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 text-foreground/75 shadow-sm hover:bg-muted/60"
							title="Maximize"
							type="button"
							onClick={() => setWidthFrac(0.95)}
						>
							<Maximize2Icon className="h-4 w-4" />
						</button>
						<button
							aria-label="Minimize chat"
							className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 text-foreground/75 shadow-sm hover:bg-muted/60"
							title="Minimize"
							type="button"
							onClick={() => setWidthFrac(0)}
						>
							<Minimize2Icon className="h-4 w-4" />
						</button>
						{actions}
					</div>
				</div>
				<div className="min-w-0 flex-1 overflow-auto">{children}</div>
			</section>
		);
	}

	// Collapsed tab (centered vertically at right edge) - themed like BottomTab
	return (
		<button
			type="button"
			aria-label="Open chat drawer"
			className={
				"fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none " +
				"flex items-center gap-2 rounded-l-md border border-border bg-background/95 px-2 py-2 text-foreground shadow-md " +
				"hover:bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-background/70"
			}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
			onPointerDown={onPointerDown}
		>
			<span className="h-1.5 w-8 rounded-full bg-muted-foreground/60" />
			<span className="text-xs text-foreground/80">{label}</span>
		</button>
	);
}
