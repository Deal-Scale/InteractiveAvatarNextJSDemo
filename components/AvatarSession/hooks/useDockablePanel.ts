"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { safeWindow } from "@/lib/utils";

import { usePlacementStore } from "@/lib/stores/placement";

// Local typing for Zustand persist middleware API injected at runtime
type PersistAPI = {
  hasHydrated?: () => boolean;
  onFinishHydration?: (cb: () => void) => void;
};

export type DockMode = "right" | "bottom" | "floating";

const MIN_BOTTOM_SIZE_PCT = 8;
const MIN_RIGHT_SIZE_PCT = 16;
const MAX_RIGHT_SIZE_PCT = 60;

export function useDockablePanel(
  rootRef: React.RefObject<HTMLDivElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
) {
  // Persistent placement store bindings
  const dock = usePlacementStore((s) => s.dockMode) as DockMode;
  const setDockMode = usePlacementStore((s) => s.setDockMode);
  const bottomHeightFrac = usePlacementStore((s) => s.bottomHeightFrac);
  const setBottomHeightFrac = usePlacementStore((s) => s.setBottomHeightFrac);
  const rightWidthFrac = usePlacementStore((s) => s.rightWidthFrac);
  const setRightWidthFrac = usePlacementStore((s) => s.setRightWidthFrac);
  // Select primitives to avoid object identity changes on every render
  const posX = usePlacementStore((s) => s.floating.x);
  const posY = usePlacementStore((s) => s.floating.y);
  const setWindowPosition = usePlacementStore((s) => s.setWindowPosition);
  const sizeW = usePlacementStore((s) => s.floating.width);
  const sizeH = usePlacementStore((s) => s.floating.height);
  const setWindowSize = usePlacementStore((s) => s.setWindowSize);

  // Persist hydration guard to avoid overwriting rehydrated values with defaults
  const [hydrated, setHydrated] = useState<boolean>(() => {
    // Zustand persist API may exist; if not, assume hydrated to avoid blocking
    try {
      const api = (usePlacementStore as unknown as { persist?: PersistAPI }).persist;

      return !!api?.hasHydrated?.();
    } catch {
      return true;
    }
  });
  useEffect(() => {
    try {
      const api = (usePlacementStore as unknown as { persist?: PersistAPI }).persist;

      if (api?.hasHydrated?.()) {
        setHydrated(true);
      }
      api?.onFinishHydration?.(() => setHydrated(true));
    } catch {}
  }, []);

  // Local-only UI state
  const [expanded, setExpanded] = useState(false);
  const [resizing, setResizing] = useState<
    null | "bottom" | "right" | "floating"
  >(null);

  // Detect mobile viewport to restrict modal/floating behavior
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    const w = safeWindow();
    try {
      return !!w?.matchMedia?.("(max-width: 640px)")?.matches; // Tailwind sm breakpoint
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const w = safeWindow();
    if (!w?.matchMedia) return;
    const mq = w.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(!!e.matches);
    // Initial sync in case SSR hydration mismatch
    setIsMobile(!!mq.matches);
    try {
      mq.addEventListener("change", handler);
    } catch {
      // Safari fallback
      mq.addListener(handler as any);
    }
    return () => {
      try {
        mq.removeEventListener("change", handler);
      } catch {
        mq.removeListener(handler as any);
      }
    };
  }, []);

  const dragState = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const floatingResizeState = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const prevBottomSizeRef = useRef<number | null>(null);
  const prevRightSizeRef = useRef<number | null>(null);

  // Drag handlers for floating panel
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (dock !== "floating") return;
      const el = panelRef.current;

      if (!el) return;
      dragState.current.dragging = true;
      const rect = el.getBoundingClientRect();

      dragState.current.offsetX = e.clientX - rect.left;
      dragState.current.offsetY = e.clientY - rect.top;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [dock, panelRef],
  );

  const onGlobalPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.current.dragging || dock !== "floating") return;
      const parent = panelRef.current?.parentElement;

      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      const el = panelRef.current;
      const width = el?.offsetWidth ?? 0;
      const height = el?.offsetHeight ?? 0;
      let x = e.clientX - parentRect.left - dragState.current.offsetX;
      let y = e.clientY - parentRect.top - dragState.current.offsetY;

      x = Math.max(0, Math.min(x, parentRect.width - width));
      y = Math.max(0, Math.min(y, parentRect.height - height));
      console.debug("[dockable] drag move -> setWindowPosition", { x, y });
      setWindowPosition({ x, y });
    },
    [dock, panelRef, setWindowPosition],
  );

  const onGlobalPointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    console.debug("[dockable] mount listeners");
    const w = safeWindow();

    if (w) {
      w.addEventListener("pointermove", onGlobalPointerMove);
      w.addEventListener("pointerup", onGlobalPointerUp);
    }

    return () => {
      const w = safeWindow();

      if (w) {
        w.removeEventListener("pointermove", onGlobalPointerMove);
        w.removeEventListener("pointerup", onGlobalPointerUp);
      }
    };
  }, [onGlobalPointerMove, onGlobalPointerUp]);

  // Resize logic for docked and floating
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!resizing) return;
      const root = rootRef.current;

      if (!root) return;
      const rect = root.getBoundingClientRect();

      if (resizing === "bottom") {
        const chatPct = ((rect.bottom - e.clientY) / rect.height) * 100;
        const clamped = Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, chatPct));

        const nextFrac = clamped / 100;
        if (Math.abs((bottomHeightFrac || 0) - nextFrac) > 0.001) {
          console.debug("[dockable] resize bottom -> setBottomHeightFrac", { nextFrac });
          setBottomHeightFrac(nextFrac);
        }
      } else if (resizing === "right") {
        const chatPct = ((rect.right - e.clientX) / rect.width) * 100;
        const clamped = Math.max(
          MIN_RIGHT_SIZE_PCT,
          Math.min(MAX_RIGHT_SIZE_PCT, chatPct),
        );

        const nextFrac = clamped / 100;
        if (Math.abs(rightWidthFrac - nextFrac) > 0.001) {
          console.debug("[dockable] resize right -> setRightWidthFrac", { nextFrac });
          setRightWidthFrac(nextFrac);
        }
      } else if (resizing === "floating") {
        const state = floatingResizeState.current;

        if (!state) return;
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;
        const maxW = rect.width - posX - 16;
        const maxH = rect.height - posY - 16;
        const nextW = Math.max(320, Math.min(maxW, state.startW + deltaX));
        const nextH = Math.max(220, Math.min(maxH, state.startH + deltaY));

        if (Math.abs(sizeW - nextW) > 0.5 || Math.abs(sizeH - nextH) > 0.5) {
          console.debug("[dockable] floating resize -> setWindowSize", { nextW, nextH });
          setWindowSize({ width: nextW, height: nextH });
        }
        if (expanded) setExpanded(false);
      }
    };
    const onUp = () => setResizing(null);

    const w = safeWindow();

    if (w) {
      w.addEventListener("pointermove", onMove);
      w.addEventListener("pointerup", onUp);
    }

    return () => {
      const w = safeWindow();

      if (w) {
        w.removeEventListener("pointermove", onMove);
        w.removeEventListener("pointerup", onUp);
      }
    };
  }, [
    resizing,
    rootRef,
    posX,
    posY,
    expanded,
    bottomHeightFrac,
    rightWidthFrac,
    sizeW,
    sizeH,
    setBottomHeightFrac,
    setRightWidthFrac,
    setWindowSize,
  ]);

  // Ensure a visible size when switching docks so overlays render
  // Guarded until persistence hydration is complete to prevent overwriting restored values
  useEffect(() => {
    if (!hydrated) return;
    const rightPct = Math.round((rightWidthFrac || 0) * 100);
    const bottomPct = Math.round((bottomHeightFrac || 0) * 100);

    if (dock === "right" && rightPct <= 0) {
      const next = 24 / 100;
      if (Math.abs((rightWidthFrac || 0) - next) > 0.001) {
        console.debug("[dockable] ensure visible -> right setRightWidthFrac", { next });
        setRightWidthFrac(next);
      }
    } else if (dock === "bottom" && bottomPct <= 0) {
      const next = 15 / 100;
      if (Math.abs((bottomHeightFrac || 0) - next) > 0.001) {
        console.debug("[dockable] ensure visible -> bottom setBottomHeightFrac", { next });
        setBottomHeightFrac(next);
      }
    }
  }, [hydrated, dock, rightWidthFrac, bottomHeightFrac, setRightWidthFrac, setBottomHeightFrac]);

  // Enforce: on mobile, do not allow floating. If currently floating, switch to bottom and expand.
  useEffect(() => {
    if (!hydrated) return;
    if (isMobile && dock === "floating") {
      console.debug("[dockable] mobile restriction -> force bottom expanded");
      setDockMode("bottom");
      // Ensure visible and expanded input
      setBottomHeightFrac(1);
      if (!expanded) setExpanded(true);
    }
  }, [isMobile, dock, hydrated, setDockMode, setBottomHeightFrac, expanded]);

  // Snap when switching to floating
  useEffect(() => {
    if (dock !== "floating") return;
    const parent = panelRef.current?.parentElement;

    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const width = expanded ? 520 : sizeW;
    const height = expanded ? 520 : sizeH;
    const x = Math.max(0, parentRect.width - width - 24);
    const y = Math.max(0, parentRect.height - height - 24);

    if (Math.abs(posX - x) > 0.5 || Math.abs(posY - y) > 0.5) {
      console.debug("[dockable] snap floating -> setWindowPosition", { x, y });
      setWindowPosition({ x, y });
    }
  }, [dock, expanded, sizeW, sizeH, posX, posY, setWindowPosition, panelRef]);

  const toggleExpand = useCallback(() => {
    if (dock === "floating") {
      setExpanded((e) => !e);

      return;
    }
    if (dock === "bottom") {
      if (!expanded) {
        prevBottomSizeRef.current = Math.round((bottomHeightFrac || 0) * 100);
        setBottomHeightFrac(1);
        setExpanded(true);
      } else {
        const restore = prevBottomSizeRef.current ?? 15;
        const clamped = Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, restore));
        setBottomHeightFrac(clamped / 100);
        setExpanded(false);
      }

      return;
    }
    if (dock === "right") {
      if (!expanded) {
        prevRightSizeRef.current = Math.round((rightWidthFrac || 0) * 100);
        setRightWidthFrac(1);
        setExpanded(true);
      } else {
        const restore = prevRightSizeRef.current ?? 24;
        const clamped = Math.max(MIN_RIGHT_SIZE_PCT, Math.min(100, restore));
        setRightWidthFrac(clamped / 100);
        setExpanded(false);
      }
    }
  }, [dock, expanded, bottomHeightFrac, rightWidthFrac, setBottomHeightFrac, setRightWidthFrac]);

  const startFloatingResize = (e: React.PointerEvent) => {
    floatingResizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: expanded ? 520 : sizeW,
      startH: expanded ? 520 : sizeH,
    };
    setResizing("floating");
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  return {
    // state
    dock,
    expanded,
    floatingPos: { x: posX, y: posY },
    floatingSize: { w: sizeW, h: sizeH },
    bottomSize: Math.round((bottomHeightFrac || 0) * 100),
    rightSize: Math.round((rightWidthFrac || 0) * 100),

    // setters/actions
    setDock: (mode: DockMode) => {
      // Coerce forbidden modes on mobile
      const next = isMobile && mode === "floating" ? "bottom" : mode;
      if (next !== mode) {
        console.debug("[dockable] mobile restriction: coerce setDock", { requested: mode, next });
      }
      setDockMode(next);
      if (isMobile && next === "bottom") {
        // Favor an expanded bottom chat on mobile for accessibility
        setBottomHeightFrac(1);
        if (!expanded) setExpanded(true);
      }
    },
    setBottomSize: (pct: number) => setBottomHeightFrac(Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, pct)) / 100),
    setRightSize: (pct: number) =>
      setRightWidthFrac(
        Math.max(MIN_RIGHT_SIZE_PCT, Math.min(MAX_RIGHT_SIZE_PCT, pct)) / 100,
      ),
    toggleExpand,
    setResizing,
    startFloatingResize,

    // event handlers
    handlePointerDown,
  };
}
