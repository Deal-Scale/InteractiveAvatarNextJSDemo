"use client";

import { useState } from "react";
import { PanelLeft, Settings, Image as ImageIcon, LayoutGrid } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSessionStore } from "@/lib/stores/session";
import PlacementModal from "@/components/Sidebar/PlacementModal";

export default function HeaderActionsStack({
  onAssetsClick,
}: {
  onAssetsClick?: () => void;
}) {
  const { openConfigModal } = useSessionStore();
  const [placementOpen, setPlacementOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        aria-label="Placement"
        className="size-8 text-foreground hover:bg-muted"
        variant="ghost"
        onClick={() => setPlacementOpen(true)}
      >
        <LayoutGrid className="size-4" />
      </Button>
      <Button
        aria-label="Assets"
        className="size-8 text-foreground hover:bg-muted"
        variant="ghost"
        onClick={onAssetsClick}
      >
        <ImageIcon className="size-4" />
      </Button>
      <Button
        aria-label="Avatar settings"
        className="size-8 text-foreground hover:bg-muted"
        variant="ghost"
        onClick={openConfigModal}
      >
        <Settings className="size-4" />
      </Button>
      <SidebarTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted">
        <PanelLeft className="size-4" />
      </SidebarTrigger>
      <PlacementModal open={placementOpen} onOpenChange={setPlacementOpen} />
    </div>
  );
}
