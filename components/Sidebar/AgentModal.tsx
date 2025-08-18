"use client";

import type { Agent } from "./AgentCard";

import React, { useMemo, useState } from "react";

import AgentPreview from "./AgentPreview";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AgentModal(props: {
  mode: "view" | "edit" | "create";
  agent?: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (agent: Agent) => void; // used for edit and create
  onStartPreview?: (agent: Agent) => void; // optional action in view mode
  onRequestEdit?: () => void; // request parent to switch to edit mode
}) {
  const { mode, agent, open, onOpenChange, onSave, onStartPreview, onRequestEdit } = props;

  const [draft, setDraft] = useState<Agent | null>(null);

  // initial blank for create mode
  const initialCreate: Agent = useMemo(
    () => ({ id: `new-${Date.now()}`, name: "", avatarUrl: "", role: "", description: "", tags: [] }),
    [],
  );

  const effectiveMode = mode;
  const working = useMemo<Agent | null>(() => {
    if (effectiveMode === "create") return draft ?? initialCreate;
    return (draft as Agent | null) ?? (agent ?? null);
  }, [effectiveMode, draft, agent, initialCreate]);

  React.useEffect(() => {
    // Reset when opening or target agent changes
    setDraft(null);
  }, [agent?.id, open, mode]);

  if (!working) return null;

  const isView = effectiveMode === "view";
  const isEdit = effectiveMode === "edit";
  const isCreate = effectiveMode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <span className="mr-2 font-semibold">{working.name || (isCreate ? "New Agent" : "Agent")}</span>
            <span className="text-xs text-muted-foreground capitalize">{effectiveMode}</span>
          </DialogTitle>
        </DialogHeader>

        {isView ? (
          <div className="space-y-4">
            <AgentPreview agent={working as Agent} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onRequestEdit?.()}
              >
                Edit
              </Button>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => onStartPreview?.(working as Agent)}
              >
                Start / Preview
              </Button>
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
                {isCreate ? "Create" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
