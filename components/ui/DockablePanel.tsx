import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Maximize2Icon,
  Minimize2Icon,
  MoveIcon,
  PanelBottomOpenIcon,
  PanelRightOpenIcon,
} from "lucide-react";

import { Button } from "./button";

import { cn } from "@/lib/utils";

export type DockMode = "right" | "bottom" | "floating";

interface DockablePanelProps {
  children: React.ReactNode;
  className?: string;
  dock: DockMode;
  expanded: boolean;
  // Floating position relative to parent container
  floatingPos?: { x: number; y: number };
  onDockChange: (dock: DockMode) => void;
  onFloatingPosChange?: (pos: { x: number; y: number }) => void;
  onToggleExpand: () => void;
}

/**
 * DockablePanel renders a panel that can be docked right/bottom or float inside its relatively positioned parent.
 * Parent must have position: relative.
 */
export const DockablePanel: React.FC<DockablePanelProps> = ({
  children,
  className,
  dock,
  expanded,
  floatingPos = { x: 24, y: 24 },
  onDockChange,
  onFloatingPosChange,
  onToggleExpand,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, offsetX: 0, offsetY: 0 });

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
    [dock],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.current.dragging || dock !== "floating") return;
      const parent = panelRef.current?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      let x = e.clientX - parentRect.left - dragState.current.offsetX;
      let y = e.clientY - parentRect.top - dragState.current.offsetY;
      // clamp within parent
      const el = panelRef.current;
      const width = el?.offsetWidth ?? 0;
      const height = el?.offsetHeight ?? 0;
      x = Math.max(0, Math.min(x, parentRect.width - width));
      y = Math.max(0, Math.min(y, parentRect.height - height));
      onFloatingPosChange?.({ x, y });
    },
    [dock, onFloatingPosChange],
  );

  const handlePointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const wrapperStyle: React.CSSProperties = useMemo(() => {
    if (dock === "floating") {
      return {
        height: expanded ? 520 : 340,
        left: floatingPos.x,
        position: "absolute",
        top: floatingPos.y,
        width: expanded ? 520 : 360,
      };
    }
    if (dock === "right") {
      return { width: expanded ? 520 : 380 };
    }

    // bottom
    return { height: expanded ? 380 : 240 };
  }, [dock, expanded, floatingPos]);

  return (
    <div
      ref={panelRef}
      className={cn(
        "bg-gray-800/95 text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden",
        dock === "right" && "flex flex-col w-[380px]",
        dock === "bottom" && "absolute left-0 right-0 bottom-0",
        dock === "floating" && "",
        className,
      )}
      style={wrapperStyle}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-700 bg-gray-900/80",
          dock === "floating" && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={handlePointerDown}
      >
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <MoveIcon className="h-4 w-4" />
          <span>Chat & Voice</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            title="Dock bottom"
            variant="ghost"
            onClick={() => onDockChange("bottom")}
          >
            <PanelBottomOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            title="Dock right"
            variant="ghost"
            onClick={() => onDockChange("right")}
          >
            <PanelRightOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            title="Float"
            variant="ghost"
            onClick={() => onDockChange("floating")}
          >
            <MoveIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            title={expanded ? "Collapse" : "Expand"}
            variant="ghost"
            onClick={onToggleExpand}
          >
            {expanded ? (
              <Minimize2Icon className="h-4 w-4" />
            ) : (
              <Maximize2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col",
          // Reserve header (44px) and ensure body gets height in all modes
          "h-[calc(100%-44px)]",
          // Let inner containers manage their own scrolling (StickToBottom)
          "min-h-0",
        )}
      >
        {children}
      </div>
    </div>
  );
};
