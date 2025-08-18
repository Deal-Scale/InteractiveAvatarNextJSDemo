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
  focusVideo: {
    sidebarCollapsed: true,
    dockMode: "bottom" as const,
    bottomHeightFrac: 0.35,
  },
  minimal: {
    sidebarCollapsed: true,
    dockMode: "bottom" as const,
    bottomHeightFrac: 0.3,
  },
};

export default function PlacementModal({ open, onOpenChange }: PlacementModalProps) {
  const {
    dockMode,
    setDockMode,
    bottomHeightFrac,
    setBottomHeightFrac,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = usePlacementStore();

  const applyPreset = (key: keyof typeof PRESETS) => {
    const p = PRESETS[key];
    setSidebarCollapsed(p.sidebarCollapsed);
    setDockMode(p.dockMode);
    setBottomHeightFrac(p.bottomHeightFrac);
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
                onClick={() => setDockMode("floating")}
              >
                Floating
              </Button>
            </div>
          </div>

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
