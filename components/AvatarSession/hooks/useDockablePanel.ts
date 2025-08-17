import { useCallback, useEffect, useRef, useState } from "react";

export type DockMode = "right" | "bottom" | "floating";

const MIN_BOTTOM_SIZE_PCT = 8;
const MIN_RIGHT_SIZE_PCT = 16;
const MAX_RIGHT_SIZE_PCT = 60;

export function useDockablePanel(
  rootRef: React.RefObject<HTMLDivElement | null>,
  panelRef: React.RefObject<HTMLDivElement | null>,
) {
  const [dock, setDock] = useState<DockMode>("bottom");
  const [expanded, setExpanded] = useState(false);
  const [floatingPos, setFloatingPos] = useState({ x: 24, y: 24 });
  const [floatingSize, setFloatingSize] = useState({ w: 360, h: 340 });

  const [bottomSize, setBottomSize] = useState<number>(15);
  const [rightSize, setRightSize] = useState<number>(24);
  const [resizing, setResizing] = useState<
    null | "bottom" | "right" | "floating"
  >(null);

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
      setFloatingPos({ x, y });
    },
    [dock, panelRef],
  );

  const onGlobalPointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onGlobalPointerMove);
    window.addEventListener("pointerup", onGlobalPointerUp);
    return () => {
      window.removeEventListener("pointermove", onGlobalPointerMove);
      window.removeEventListener("pointerup", onGlobalPointerUp);
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
        setBottomSize(Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, chatPct)));
      } else if (resizing === "right") {
        const chatPct = ((rect.right - e.clientX) / rect.width) * 100;
        setRightSize(
          Math.max(
            MIN_RIGHT_SIZE_PCT,
            Math.min(MAX_RIGHT_SIZE_PCT, chatPct),
          ),
        );
      } else if (resizing === "floating") {
        const state = floatingResizeState.current;
        if (!state) return;
        const deltaX = e.clientX - state.startX;
        const deltaY = e.clientY - state.startY;
        const maxW = rect.width - floatingPos.x - 16;
        const maxH = rect.height - floatingPos.y - 16;
        const nextW = Math.max(320, Math.min(maxW, state.startW + deltaX));
        const nextH = Math.max(220, Math.min(maxH, state.startH + deltaY));
        setFloatingSize({ w: nextW, h: nextH });
        if (expanded) setExpanded(false);
      }
    };
    const onUp = () => setResizing(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing, rootRef, floatingPos, expanded]);

  // Ensure a visible size when switching docks so overlays render
  useEffect(() => {
    if (dock === "right" && rightSize <= 0) {
      setRightSize(24);
    } else if (dock === "bottom" && bottomSize <= 0) {
      setBottomSize(15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dock]);

  // Snap when switching to floating
  useEffect(() => {
    if (dock !== "floating") return;
    const parent = panelRef.current?.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const width = expanded ? 520 : floatingSize.w;
    const height = expanded ? 520 : floatingSize.h;
    const x = Math.max(0, parentRect.width - width - 24);
    const y = Math.max(0, parentRect.height - height - 24);
    setFloatingPos({ x, y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dock]);

  const toggleExpand = useCallback(() => {
    if (dock === "floating") {
      setExpanded((e) => !e);
      return;
    }
    if (dock === "bottom") {
      if (!expanded) {
        prevBottomSizeRef.current = bottomSize;
        setBottomSize(100);
        setExpanded(true);
      } else {
        const restore = prevBottomSizeRef.current ?? 15;
        setBottomSize(Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, restore)));
        setExpanded(false);
      }
      return;
    }
    if (dock === "right") {
      if (!expanded) {
        prevRightSizeRef.current = rightSize;
        setRightSize(100);
        setExpanded(true);
      } else {
        const restore = prevRightSizeRef.current ?? 24;
        setRightSize(Math.max(MIN_RIGHT_SIZE_PCT, Math.min(100, restore)));
        setExpanded(false);
      }
    }
  }, [dock, expanded, bottomSize, rightSize]);

  const startFloatingResize = (e: React.PointerEvent) => {
    floatingResizeState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: expanded ? 520 : floatingSize.w,
      startH: expanded ? 520 : floatingSize.h,
    };
    setResizing("floating");
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  return {
    // state
    dock,
    expanded,
    floatingPos,
    floatingSize,
    bottomSize,
    rightSize,

    // setters/actions
    setDock,
    setBottomSize,
    setRightSize,
    toggleExpand,
    setResizing,
    startFloatingResize,

    // event handlers
    handlePointerDown,
  };
}
