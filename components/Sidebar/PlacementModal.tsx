"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { usePlacementStore } from "@/lib/stores/placement";

interface PlacementModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const PRESETS = {
  default: {
    sidebarCollapsed: false,
    dockMode: "bottom" as const,
    bottomHeightFrac: 0.35,
  },
  focusChat: {
    sidebarCollapsed: true,
    dockMode: "bottom" as const,
    bottomHeightFrac: 0.7,
  },
  // For video, prefer a right dock to give vertical space to the canvas
  focusVideo: {
    sidebarCollapsed: true,
    dockMode: "right" as const,
    rightWidthFrac: 0.38,
    activeVideoTab: "video" as const,
  },
  // Minimal uses a small floating window
  minimal: {
    sidebarCollapsed: true,
    dockMode: "floating" as const,
    floating: { width: 420, height: 280, x: 24, y: 24, visible: true } as const,
  },
};

export default function PlacementModal({ open, onOpenChange }: PlacementModalProps) {
  const {
    dockMode,
    setDockMode,
    bottomHeightFrac,
    setBottomHeightFrac,
    rightWidthFrac,
    setRightWidthFrac,
    sidebarCollapsed,
    setSidebarCollapsed,
    setActiveVideoTab,
    floating,
    setFloating,
  } = usePlacementStore();

  const applyPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setSidebarCollapsed(p.sidebarCollapsed);
    setDockMode(p.dockMode);
    if ("bottomHeightFrac" in p && typeof p.bottomHeightFrac === "number") {
      setBottomHeightFrac(p.bottomHeightFrac);
    }
    if ("rightWidthFrac" in p && typeof p.rightWidthFrac === "number") {
      setRightWidthFrac(p.rightWidthFrac);
    }
    if ("activeVideoTab" in p && p.activeVideoTab) {
      setActiveVideoTab(p.activeVideoTab as any);
    }
    if ("floating" in p && p.floating) {
      setFloating({ ...p.floating });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Placement</DialogTitle>
          <DialogDescription>Adjust layout to fit your current task.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => applyPreset("default")}>Default</Button>
            <Button variant="secondary" onClick={() => applyPreset("focusChat")}>Focus Chat</Button>
            <Button variant="secondary" onClick={() => applyPreset("focusVideo")}>Focus Video</Button>
            <Button variant="secondary" onClick={() => applyPreset("minimal")}>Minimal</Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Sidebar collapsed</span>
            <Button
              aria-pressed={sidebarCollapsed}
              variant={sidebarCollapsed ? "default" : "outline"}
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? "On" : "Off"}
            </Button>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-foreground">Dock mode</div>
            <div className="flex gap-2">
              <Button
                variant={dockMode === "bottom" ? "default" : "outline"}
                size="sm"
                onClick={() => setDockMode("bottom")}
              >
                Bottom
              </Button>
              <Button
                variant={dockMode === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => setDockMode("right")}
              >
                Right
              </Button>
              <Button
                variant={dockMode === "floating" ? "default" : "outline"}
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setDockMode("floating")}
              >
                Floating
              </Button>
            </div>
          </div>

          {dockMode === "bottom" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Bottom height</span>
                <span className="text-xs text-muted-foreground">{Math.round(bottomHeightFrac * 100)}%</span>
              </div>
              <Slider
                id="bottom-height"
                value={[Math.round(bottomHeightFrac * 100)]}
                min={20}
                max={80}
                step={1}
                onValueChange={(v) => setBottomHeightFrac((v?.[0] ?? 35) / 100)}
              />
            </div>
          )}

          {dockMode === "right" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Left distance</span>
                <span className="text-xs text-muted-foreground">{Math.round((1 - rightWidthFrac) * 100)}%</span>
              </div>
              <Slider
                id="left-distance"
                value={[Math.round((1 - rightWidthFrac) * 100)]}
                min={0}
                max={80}
                step={1}
                onValueChange={(v) => {
                  const left = (v?.[0] ?? 68) / 100;
                  setRightWidthFrac(1 - left);
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
