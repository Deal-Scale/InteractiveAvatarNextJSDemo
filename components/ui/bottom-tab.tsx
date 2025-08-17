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
  const setRightWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);
  const sidebarCollapsed = usePlacementStore((s) => s.sidebarCollapsed);

  const isBottom = dockMode === "bottom";
  const isClosed = heightFrac <= 0.01;

  const heightPx = useMemo(() => {
    if (typeof window === "undefined") return 0;

    return Math.round((heightFrac || 0) * window.innerHeight);
  }, [heightFrac]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const startY = e.clientY;
    const startFrac = heightFrac;
    let movingFrac = startFrac;

    const onMove = (ev: PointerEvent) => {
      const vh = window.innerHeight || 1;
      const dy = startY - ev.clientY; // dragging up increases height
      const newFrac = Math.max(0, Math.min(0.95, startFrac + dy / vh));
      movingFrac = newFrac;
      setHeightFrac(newFrac);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      // Snap to fully closed if near the bottom to overcome visual min-height
      // Snap threshold: 56px or 6% of viewport height, whichever is larger
      try {
        const vh = window.innerHeight || 1;
        const px = Math.round(movingFrac * vh);
        const thresholdPx = Math.max(56, Math.round(0.06 * vh));
        if (px <= thresholdPx) {
          setHeightFrac(0);
        }
      } catch {}
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
          // When sidebar is open, start at 320px to avoid covering it
          (sidebarCollapsed
            ? "fixed inset-x-0 "
            : "fixed left-[320px] right-0 ") +
          "bottom-0 z-30 border-t border-border bg-background text-foreground shadow-lg " +
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
          {/* Minimize button */}
          <button
            type="button"
            aria-label="Minimize chat"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-foreground/70 hover:bg-muted/50"
            onClick={() => {
              if (dockMode === "bottom") setHeightFrac(0);
              else if (dockMode === "right") setRightWidthFrac(0);
            }}
          >
            Minimize
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
        (sidebarCollapsed
          ? "fixed bottom-0 left-1/2 -translate-x-1/2 "
          : "fixed bottom-0 left-[328px] ") + // small offset past the sidebar edge
        "z-40 select-none flex items-center gap-2 rounded-t-md border border-border bg-background/95 px-3 py-1.5 " +
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
