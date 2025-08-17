"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Agent } from "./AgentCard";

export default function AgentModal(props: {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (agent: Agent) => void;
}) {
  const { agent, open, onOpenChange, onSave } = props;

  const [tab, setTab] = useState<"details" | "edit">("details");

  const [draft, setDraft] = useState<Agent | null>(null);
  const isOwnedByUser = !!agent?.isOwnedByUser;

  const working = useMemo(() => draft ?? agent, [draft, agent]);

  React.useEffect(() => {
    // Reset UI when opening on a different agent
    setTab("details");
    setDraft(null);
  }, [agent?.id, open]);

  if (!working) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{working.name}</DialogTitle>
        </DialogHeader>

        {/* Simple tabs header */}
        <div className="mb-3 flex items-center gap-2 border-b pb-2 text-sm">
          <button
            className={`rounded px-2 py-1 ${tab === "details" ? "bg-muted" : "hover:bg-muted"}`}
            onClick={() => setTab("details")}
            type="button"
          >
            Details
          </button>
          {isOwnedByUser && (
            <button
              className={`rounded px-2 py-1 ${tab === "edit" ? "bg-muted" : "hover:bg-muted"}`}
              onClick={() => setTab("edit")}
              type="button"
            >
              Edit
            </button>
          )}
        </div>

        {tab === "details" ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-20 w-32 overflow-hidden rounded bg-muted/50">
                {working.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={working.name} className="h-full w-full object-cover" src={working.avatarUrl} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    {working.name?.substring(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm text-muted-foreground">{working.role || "Agent"}</div>
                {working.description && <p className="mt-1 text-sm">{working.description}</p>}
                {working.tags && working.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {working.tags.map((t) => (
                      <span key={t} className="rounded bg-muted px-1.5 py-0.5">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!working) return;
              onSave?.(working);
              onOpenChange(false);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">
                <div className="mb-1 text-muted-foreground">Name</div>
                <input
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  value={working.name}
                  onChange={(e) => setDraft({ ...(working as Agent), name: e.target.value })}
                />
              </label>
              <label className="text-xs">
                <div className="mb-1 text-muted-foreground">Role</div>
                <input
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  value={working.role || ""}
                  onChange={(e) => setDraft({ ...(working as Agent), role: e.target.value })}
                />
              </label>
              <label className="col-span-2 text-xs">
                <div className="mb-1 text-muted-foreground">Avatar URL</div>
                <input
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  value={working.avatarUrl || ""}
                  onChange={(e) => setDraft({ ...(working as Agent), avatarUrl: e.target.value })}
                />
              </label>
              <label className="col-span-2 text-xs">
                <div className="mb-1 text-muted-foreground">Description</div>
                <textarea
                  className="min-h-[80px] w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  value={working.description || ""}
                  onChange={(e) => setDraft({ ...(working as Agent), description: e.target.value })}
                />
              </label>
              <label className="col-span-2 text-xs">
                <div className="mb-1 text-muted-foreground">Tags (comma separated)</div>
                <input
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                  value={(working.tags || []).join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...(working as Agent),
                      tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="default">
                Save
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
