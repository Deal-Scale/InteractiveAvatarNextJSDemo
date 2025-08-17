"use client";

import { ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useSessionStore } from "@/lib/stores/session";

export default function CollapsedEdgeTrigger() {
  const { open, setOpen } = useSidebar();
  const { openConfigModal } = useSessionStore();
  if (open) return null;
  return (
    <div className="fixed left-3 bottom-3 z-50 flex flex-col items-start gap-2">
      <Button
        aria-label="Open sidebar"
        className="size-9 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90"
        onClick={() => setOpen(true)}
        variant="ghost"
      >
        <ChevronRight className="size-5" />
      </Button>
      <Button
        aria-label="Avatar settings"
        className="size-9 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90"
        onClick={openConfigModal}
        variant="ghost"
      >
        <Settings className="size-5" />
      </Button>
    </div>
  );
}
