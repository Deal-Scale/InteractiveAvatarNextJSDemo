"use client";

import React, { useMemo } from "react";

import { usePlacementStore } from "@/lib/stores/placement";

// Bottom-docked drawer whose height is controlled by usePlacementStore.bottomHeightFrac.
// Includes a top grab handle for resizing. Hides itself when height ~ 0.

interface BottomDrawerProps {
  minFrac?: number; // considered collapsed when <= minFrac (default 0)
  className?: string;
  children?: React.ReactNode;
}

export function BottomDrawer({
  minFrac = 0,
  className = "",
  children,
}: BottomDrawerProps) {
  const dockMode = usePlacementStore((s) => s.dockMode);
  const heightFrac = usePlacementStore((s) => s.bottomHeightFrac);
  const setHeightFrac = usePlacementStore((s) => s.setBottomHeightFrac);

  const show = dockMode === "bottom" && heightFrac > 0.001;

  const heightPx = useMemo(() => {
    if (typeof window === "undefined") return 0;

    return Math.round((heightFrac || 0) * window.innerHeight);
  }, [heightFrac]);

  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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
      // Snap closed if near the closed threshold using latest store value
      const current = usePlacementStore.getState().bottomHeightFrac;
      const snapThreshold = Math.max(0.01, minFrac + 0.01);

      if (current <= snapThreshold) setHeightFrac(0);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { once: true });
  };

  if (!show) return null;

  return (
    <div
      aria-label="Chat drawer"
      className={
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background text-foreground shadow-lg " +
        "flex min-h-[48px] flex-col overflow-hidden " +
        className
      }
      role="region"
      style={{ height: heightPx }}
    >
      <div className="relative flex h-8 w-full items-center justify-center border-b border-border/60">
        {/* Resize handle area (top bar) */}
        <div
          aria-label="Resize chat"
          className="absolute inset-0 cursor-ns-resize"
          role="separator"
          onPointerDown={onHandlePointerDown}
        />
        <span className="pointer-events-none h-1 w-12 rounded-full bg-muted-foreground/50" />
        {/* Close button */}
        <button
          aria-label="Close chat drawer"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-foreground/70 hover:bg-muted/50"
          type="button"
          onClick={() => setHeightFrac(0)}
        >
          Close
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
