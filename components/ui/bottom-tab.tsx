"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Maximize2Icon, Minimize2Icon } from "lucide-react";

import { usePlacementStore } from "@/lib/stores/placement";
import { safeWindow } from "@/lib/utils";

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
  actions?: React.ReactNode; // optional action buttons to render on the top bar (right side)
}

export function BottomTab({
  minFrac = 0,
  defaultFrac = 0.35,
  className = "",
  label = "Chat",
  children,
  actions,
}: BottomTabProps) {
  // Avoid SSR/CSR mismatch from window-dependent sizing by rendering after mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dockMode = usePlacementStore((s) => s.dockMode);
  const heightFrac = usePlacementStore((s) => s.bottomHeightFrac);
  const setHeightFrac = usePlacementStore((s) => s.setBottomHeightFrac);
  const setRightWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);
  const sidebarCollapsed = usePlacementStore((s) => s.sidebarCollapsed);

  const isBottom = dockMode === "bottom";
  const isClosed = heightFrac <= 0.01;

  const heightPx = useMemo(() => {
    const w = safeWindow();

    if (!w) return 0;
    return Math.round((heightFrac || 0) * w.innerHeight);
  }, [heightFrac]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const startY = e.clientY;
    const startFrac = heightFrac;
    let movingFrac = startFrac;

    const onMove = (ev: PointerEvent) => {
      const w = safeWindow();
      const vh = (w?.innerHeight || 1);
      const dy = startY - ev.clientY; // dragging up increases height
      const newFrac = Math.max(0, Math.min(0.95, startFrac + dy / vh));

      movingFrac = newFrac;
      setHeightFrac(newFrac);
    };
    const onUp = () => {
      const w = safeWindow();

      if (w) {
        w.removeEventListener("pointermove", onMove);
        w.removeEventListener("pointerup", onUp);
      }
      // Snap to fully closed if near the bottom to overcome visual min-height
      // Snap threshold: 56px or 6% of viewport height, whichever is larger
      try {
        const w = safeWindow();
        const vh = (w?.innerHeight || 1);
        const px = Math.round(movingFrac * vh);
        const thresholdPx = Math.max(56, Math.round(0.06 * vh));

        if (px <= thresholdPx) {
          setHeightFrac(0);
        }
      } catch {}
    };

    const w = safeWindow();

    if (w) {
      w.addEventListener("pointermove", onMove, { passive: true });
      w.addEventListener("pointerup", onUp, { once: true });
    }
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
  if (!isBottom || !mounted) return null;

  if (!isClosed) {
    return (
      <div
        aria-label="Chat drawer"
        className={
          // When sidebar is open, start at 320px to avoid covering it
          (sidebarCollapsed
            ? "fixed inset-x-0 "
            : "fixed left-[320px] right-0 ") +
          "bottom-0 z-30 border-t border-border bg-background text-foreground shadow-lg " +
          "flex min-h-[48px] flex-col overflow-hidden " +
          className
        }
        role="region"
        style={{ height: heightPx }}
      >
        <div className="relative flex h-9 w-full items-center justify-center border-b border-border/60">
          {/* Resize handle area (full bar) */}
          <div
            aria-label="Resize chat"
            className="absolute inset-y-0 left-0 right-40 cursor-ns-resize"
            role="separator"
            onPointerDown={onPointerDown}
          />
          {/* Grip */}
          <span className="pointer-events-none h-1 w-12 rounded-full bg-muted-foreground/50" />
          {/* Actions on the right */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1">
            <button
              aria-label="Maximize chat height"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 text-foreground/75 shadow-sm hover:bg-muted/60"
              title="Maximize"
              type="button"
              onClick={() => setHeightFrac(1)}
            >
              <Maximize2Icon className="h-4 w-4" />
            </button>
            <button
              aria-label="Minimize chat"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/80 text-foreground/75 shadow-sm hover:bg-muted/60"
              title="Minimize"
              type="button"
              onClick={() => {
                if (dockMode === "bottom") setHeightFrac(0);
                else if (dockMode === "right") setRightWidthFrac(0);
              }}
            >
              <Minimize2Icon className="h-4 w-4" />
            </button>
            {actions}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    );
  }

  // Collapsed tab
  return (
    <div
      aria-label="Open chat drawer"
      className={
        (sidebarCollapsed
          ? "fixed bottom-0 left-1/2 -translate-x-1/2 "
          : "fixed bottom-0 left-[328px] ") + // small offset past the sidebar edge
        "z-40 select-none flex items-center gap-2 rounded-t-md border border-border bg-background/95 px-3 py-1.5 " +
        "shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/70 " +
        className
      }
      role="button"
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      <span className="h-1.5 w-8 rounded-full bg-muted-foreground/60" />
      <span className="text-xs text-foreground/80">{label}</span>
    </div>
  );
}
