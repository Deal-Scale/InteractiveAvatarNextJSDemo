"use client";

import type { Agent } from "./AgentCard";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AgentPreview from "./AgentPreview";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AutoForm } from "@/components/forms/AutoForm";
import { AgentConfigSchema } from "@/lib/schemas/agent";

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

  // Combined schema: full AgentConfig + sidebar-only fields
  const AgentFormSchema = useMemo(() => {
    const base = AgentConfigSchema as unknown as z.ZodObject<any>;
    return base.extend({
      role: z.string().optional(),
      avatarUrl: z.string().url().optional().or(z.literal("")).optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });
  }, []);

  // Single form instance used for both edit and create
  const form = useForm<z.infer<typeof AgentFormSchema>>({
    resolver: zodResolver(AgentFormSchema),
    mode: "onChange",
    defaultValues: {
      id: (working as any)?.id || `new-${Date.now()}`,
      name: working?.name || "",
      avatarId: (undefined as any),
      role: working?.role || "",
      avatarUrl: working?.avatarUrl || "",
      description: working?.description || "",
      tags: working?.tags || [],
    },
  });

  React.useEffect(() => {
    // Sync form defaults when switching target or mode
    form.reset({
      id: (working as any)?.id || `new-${Date.now()}`,
      name: working?.name || "",
      avatarId: (undefined as any),
      role: working?.role || "",
      avatarUrl: working?.avatarUrl || "",
      description: working?.description || "",
      tags: working?.tags || [],
    });
  }, [working?.id, effectiveMode, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] md:w-[640px] max-w-[96vw] p-4 md:p-6 bg-card text-foreground flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            <span className="mr-2 font-semibold">{working.name || (isCreate ? "New Agent" : "Agent")}</span>
            <span className="text-xs text-muted-foreground capitalize">{effectiveMode}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isView ? (
            <div className="space-y-4">
              <AgentPreview agent={working as Agent} />
              <div className="flex justify-end gap-2">
                {(agent?.isOwnedByUser ?? false) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onRequestEdit?.()}
                  >
                    Edit
                  </Button>
                )}
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
            <AutoForm
              className="space-y-3"
              schema={AgentFormSchema}
              form={form as any}
              fields={{
                name: { label: "Name" },
                role: { label: "Role" },
                avatarUrl: { label: "Avatar URL" },
                description: { label: "Description", widget: "textarea" },
                tags: { label: "Tags" },
              }}
              submitLabel={isCreate ? "Create" : "Save"}
              onSubmit={(values: z.infer<typeof AgentFormSchema>) => {
                const name = String(values.name ?? "");
                const role = values.role != null ? String(values.role) : "";
                const avatarUrl = values.avatarUrl != null ? String(values.avatarUrl) : "";
                const description = values.description != null ? String(values.description) : "";
                const tags: string[] = Array.isArray(values.tags)
                  ? (values.tags as string[])
                  : typeof (values as any).tags === "string"
                    ? ((values as any).tags as string)
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean)
                    : [];

                const next: Agent = {
                  id: (values as any)?.id || working?.id || `new-${Date.now()}`,
                  name,
                  role,
                  avatarUrl,
                  description,
                  tags,
                  isOwnedByUser: isCreate ? true : working?.isOwnedByUser,
                };
                onSave?.(next);
                onOpenChange(false);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
