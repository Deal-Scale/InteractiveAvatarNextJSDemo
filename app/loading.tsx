"use client"

import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader variant="classic" size="lg" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
