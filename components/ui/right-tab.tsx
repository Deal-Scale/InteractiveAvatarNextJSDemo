"use client";

import React, { useMemo } from "react";

import { usePlacementStore } from "@/lib/stores/placement";

interface RightTabProps {
  minFrac?: number; // fraction considered collapsed
  defaultFrac?: number; // width when expanding via click
  className?: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export function RightTab({
  minFrac = 0,
  defaultFrac = 0.32,
  className = "",
  label = "Chat",
  children,
}: RightTabProps) {
  const dockMode = usePlacementStore((s) => s.dockMode);
  const widthFrac = usePlacementStore((s) => s.rightWidthFrac);
  const setWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);

  const isRight = dockMode === "right";
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

  if (!isRight) return null;

  if (!isClosed) {
    return (
      <div
        aria-label="Chat right drawer"
        className={
          "fixed right-0 top-0 bottom-0 z-30 border-l border-border bg-background text-foreground shadow-lg " +
          "flex min-w-[48px] flex-col overflow-hidden " +
          className
        }
        role="region"
        style={{ width: widthPx }}
      >
        <div className="relative flex w-8 shrink-0 items-center justify-center border-l-0 border-border/60">
          {/* Resize handle area (left edge) */}
          <div
            aria-label="Resize chat"
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize"
            onPointerDown={onPointerDown}
            role="separator"
          />
          {/* Minimize */}
          <button
            aria-label="Minimize chat"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-foreground/70 hover:bg-muted/50"
            onClick={() => setWidthFrac(0)}
            type="button"
          >
            Minimize
          </button>
        </div>
        <div className="min-w-0 flex-1 overflow-auto">{children}</div>
      </div>
    );
  }

  // Collapsed tab (vertical near right edge)
  return (
    <div
      aria-label="Open chat drawer"
      className={
        "fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none " +
        "flex items-center gap-2 rounded-l-md border border-border bg-background/95 px-2 py-2 shadow-md " +
        "backdrop-blur supports-[backdrop-filter]:bg-background/70 rotate-[-90deg] origin-right"
      }
      onClick={onClick}
      onPointerDown={onPointerDown}
      role="button"
    >
      <span className="h-1.5 w-8 rounded-full bg-muted-foreground/60" />
      <span className="text-xs text-foreground/80">{label}</span>
    </div>
  );
}
