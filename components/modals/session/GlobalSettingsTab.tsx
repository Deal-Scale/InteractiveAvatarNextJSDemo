import React from "react";
import { AutoForm } from "@/components/forms/AutoForm";
import type { UseFormReturn } from "react-hook-form";

interface GlobalSettingsTabProps {
  form: UseFormReturn<any>;
  schema: any;
  onSubmit: (values: any) => void;
}

export function GlobalSettingsTab({ form, schema, onSubmit }: GlobalSettingsTabProps) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
      <p className="text-sm text-zinc-700 dark:text-zinc-400">
        Configure app-wide options (theme, telemetry, API base URL). These persist locally in your browser.
      </p>
      <AutoForm
        className="space-y-3"
        form={form as any}
        schema={schema}
        submitLabel="Save Global Settings"
        onSubmit={onSubmit}
      />
    </div>
  );
}
