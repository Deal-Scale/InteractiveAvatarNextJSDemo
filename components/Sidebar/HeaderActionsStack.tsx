"use client";

import { PanelLeft, Settings, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSessionStore } from "@/lib/stores/session";

export default function HeaderActionsStack({ onAssetsClick }: { onAssetsClick?: () => void }) {
  const { openConfigModal } = useSessionStore();
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        className="size-8 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        aria-label="Assets"
        onClick={onAssetsClick}
      >
        <ImageIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        className="size-8 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        aria-label="Avatar settings"
        onClick={openConfigModal}
      >
        <Settings className="size-4" />
      </Button>
      <SidebarTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60">
        <PanelLeft className="size-4" />
      </SidebarTrigger>
    </div>
  );
}
