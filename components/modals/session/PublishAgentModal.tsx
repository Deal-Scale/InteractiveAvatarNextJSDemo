"use client";
import React from "react";
import { z } from "zod";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import { PublicAgentSchema } from "@/lib/schemas/public";

interface PublishAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof PublicAgentSchema>) => void;
}

export function PublishAgentModal({ open, onOpenChange, onSubmit }: PublishAgentModalProps) {
  const form = useZodForm(PublicAgentSchema, {
    defaultValues: {
      title: "",
      description: "",
      avatarImage: "",
      monetize: false,
      rateMultiplier: 1,
    } as Partial<z.infer<typeof PublicAgentSchema>>,
    mode: "onChange",
  });
  const monetize = (form as any)?.watch?.("monetize") ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] md:w-[640px] max-w-[96vw] p-4 md:p-6 overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Publish Agent</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Provide public-facing details for your agent.
          </p>
        </div>

        <AutoForm
          className="space-y-3"
          form={form as any}
          schema={PublicAgentSchema as any}
          fields={{
            title: { label: "Title" },
            description: { label: "Description", widget: "textarea", rows: 4 },
            avatarImage: { label: "Avatar Image URL", placeholder: "https://..." },
            monetize: { label: "Monetize" },
            ...(monetize
              ? {
                  rateMultiplier: {
                    label: "Rate Multiplier",
                    widget: "select",
                    options: [
                      { label: "1x", value: "1" },
                      { label: "2x", value: "2" },
                      { label: "3x", value: "3" },
                      { label: "4x", value: "4" },
                      { label: "5x", value: "5" },
                    ],
                  },
                }
              : {}),
          }}
          submitLabel="Publish"
          onSubmit={(values) => {
            const v = values as any;
            const payload = {
              ...v,
              // infer public on publish
              isPublic: true,
              // if not monetized, force base rate
              rateMultiplier: v.monetize ? Number(v.rateMultiplier ?? 1) : 1,
            };
            onSubmit(payload);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
