"use client";

import React, { useMemo } from "react";
import { Minimize2Icon, Maximize2Icon } from "lucide-react";

import { usePlacementStore } from "@/lib/stores/placement";

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
  const widthFrac = usePlacementStore((s) => s.rightWidthFrac);
  const setWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);

  const isClosed = widthFrac <= 0.01;

  const widthPx = useMemo(() => {
    if (typeof window === "undefined") return 0;

    return Math.round((widthFrac || 0) * window.innerWidth);
  }, [widthFrac]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const startX = e.clientX;
    const startFrac = widthFrac;
    let moving = startFrac;

    const onMove = (ev: PointerEvent) => {
      const vw = window.innerWidth || 1;
      const dx = startX - ev.clientX; // dragging left increases width
      const next = Math.max(0, Math.min(0.95, startFrac + dx / vw));

      moving = next;
      setWidthFrac(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      try {
        const vw = window.innerWidth || 1;
        const px = Math.round(moving * vw);
        const thresholdPx = Math.max(56, Math.round(0.06 * vw));

        if (px <= thresholdPx) setWidthFrac(0);
      } catch {}
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const onClick = () => {
    if (widthFrac <= minFrac + 0.001 || widthFrac < defaultFrac * 0.9) {
      setWidthFrac(defaultFrac);
    }
  };

  if (!isClosed) {
    return (
      <div
        aria-label="Chat right drawer"
        className={
          "fixed right-0 top-0 bottom-0 z-30 border-l border-border bg-background text-foreground shadow-lg " +
          "flex flex-row min-w-[48px] overflow-hidden " +
          className
        }
        role="region"
        style={{ width: widthPx }}
      >
        {/* Left rail with actions */}
        <div className="relative flex w-12 shrink-0 flex-col items-stretch justify-start border-r border-border/60 bg-background/80">
          {/* Resize handle area (left edge) */}
          <div
            aria-label="Resize chat"
            className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize bg-primary/30 hover:bg-primary/60 transition-colors"
            role="separator"
            onPointerDown={onPointerDown}
          />
          {/* Actions stack */}
          <div className="flex flex-col items-center gap-2 px-1">
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
      </div>
    );
  }

  // Collapsed tab (centered vertically at right edge)
  return (
    <div
      aria-label="Open chat drawer"
      className={
        "fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none " +
        "flex items-center gap-2 rounded-l-md border border-primary/40 bg-primary/10 px-2 py-2 text-primary shadow-md " +
        "hover:bg-primary/15 backdrop-blur supports-[backdrop-filter]:bg-primary/10"
      }
      role="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      <span className="h-1.5 w-8 rounded-full bg-primary/50" />
      <span className="text-xs">{label}</span>
    </div>
  );
}
