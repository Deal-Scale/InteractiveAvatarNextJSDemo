"use client";

import React, { useMemo } from "react";
import { usePlacementStore } from "@/lib/stores/placement";

// A persistent bottom tab for reopening/resizing the bottom drawer.
// - Appears only when fully closed (height <= 0)
// - Drag to resize height
// - Click to toggle to default height

interface BottomTabProps {
  minFrac?: number; // fraction considered collapsed; set to 0 to require fully closed
  defaultFrac?: number; // height when expanding via click (default store default 0.35)
  className?: string;
  label?: React.ReactNode;
  children?: React.ReactNode;
}

export function BottomTab({
  minFrac = 0,
  defaultFrac = 0.35,
  className = "",
  label = "Chat",
  children,
}: BottomTabProps) {
  const dockMode = usePlacementStore((s) => s.dockMode);
  const heightFrac = usePlacementStore((s) => s.bottomHeightFrac);
  const setHeightFrac = usePlacementStore((s) => s.setBottomHeightFrac);

  const isBottom = dockMode === "bottom";
  const isClosed = heightFrac <= 0.001;

  const heightPx = useMemo(() => {
    if (typeof window === "undefined") return 0;
    return Math.round((heightFrac || 0) * window.innerHeight);
  }, [heightFrac]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const startY = e.clientY;
    const startFrac = heightFrac;

    const onMove = (ev: PointerEvent) => {
      const vh = window.innerHeight || 1;
      const dy = startY - ev.clientY; // dragging up increases height
      const newFrac = Math.max(0, Math.min(0.95, startFrac + dy / vh));
      setHeightFrac(newFrac);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { once: true });
  };

  const onClick = () => {
    // If collapsed, expand to default; if already expanded slightly, snap to default
    if (heightFrac <= minFrac + 0.001) {
      setHeightFrac(defaultFrac);
    } else if (heightFrac < defaultFrac * 0.9) {
      setHeightFrac(defaultFrac);
    }
  };

  // When open, render the drawer panel. When closed, render the reopen tab.
  if (!isBottom) return null;

  if (!isClosed) {
    return (
      <div
        role="region"
        aria-label="Chat drawer"
        style={{ height: heightPx }}
        className={
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background text-foreground shadow-lg " +
          "flex min-h-[48px] flex-col overflow-hidden " +
          className
        }
      >
        <div className="relative flex h-8 w-full items-center justify-center border-b border-border/60">
          {/* Resize handle area (top bar) */}
          <div
            role="separator"
            aria-label="Resize chat"
            className="absolute inset-0 cursor-ns-resize"
            onPointerDown={onPointerDown}
          />
          <span className="pointer-events-none h-1 w-12 rounded-full bg-muted-foreground/50" />
          {/* Close button */}
          <button
            type="button"
            aria-label="Close chat drawer"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-foreground/70 hover:bg-muted/50"
            onClick={() => setHeightFrac(0)}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    );
  }

  // Collapsed tab
  return (
    <div
      role="button"
      aria-label="Open chat drawer"
      className={
        "fixed bottom-0 left-1/2 z-40 -translate-x-1/2 select-none " +
        "flex items-center gap-2 rounded-t-md border border-border bg-background/95 px-3 py-1.5 " +
        "shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/70 " +
        className
      }
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <span className="h-1.5 w-8 rounded-full bg-muted-foreground/60" />
      <span className="text-xs text-foreground/80">{label}</span>
    </div>
  );
}
