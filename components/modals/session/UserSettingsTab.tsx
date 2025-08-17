import type { Option } from "@/data/options";
import React from "react";
import { AutoForm } from "@/components/forms/AutoForm";
import type { UseFormReturn } from "react-hook-form";

interface UserSettingsTabProps {
  form: UseFormReturn<any>;
  schema: any;
  languagesOptions: Option[];
  onSubmit: (values: any) => void;
}

export function UserSettingsTab({ form, schema, languagesOptions, onSubmit }: UserSettingsTabProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Configure your preferences. These persist locally in your browser.
      </p>
      <AutoForm
        className="space-y-3"
        form={form as any}
        schema={schema}
        fields={{
          language: { label: "Language", widget: "select", options: languagesOptions },
          quality: {
            label: "Quality",
            widget: "select",
            options: [
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ],
          },
        }}
        submitLabel="Save Preferences"
        onSubmit={onSubmit}
      />
    </div>
  );
}
