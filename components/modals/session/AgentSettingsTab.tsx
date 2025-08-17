import type { UseFormReturn } from "react-hook-form";
import type { Option } from "@/data/options";

import React from "react";

import { AutoForm } from "@/components/forms/AutoForm";

interface AgentSettingsTabProps {
  form: UseFormReturn<any>;
  schema: any;
  avatarOptions: Option[];
  voiceOptions: Option[];
  knowledgeBaseOptions: Option[];
  mcpServerOptions: Option[];
  languagesOptions: Option[];
  onSubmit: (values: any) => void;
  onPublish?: () => void;
}

export function AgentSettingsTab({
  form,
  schema,
  avatarOptions,
  voiceOptions,
  knowledgeBaseOptions,
  mcpServerOptions,
  languagesOptions,
  onSubmit,
  onPublish,
}: AgentSettingsTabProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Configure your agent’s defaults. These persist locally in your browser.
      </p>
      <AutoForm
        className="space-y-3"
        fields={{
          quality: { label: "Quality" },
          temperature: {
            label: "Temperature",
            widget: "slider",
            min: 0,
            max: 2,
            step: 0.1,
          },
          avatarId: {
            label: "Avatar",
            widget: "select",
            options: avatarOptions,
          },
          voiceId: { label: "Voice", widget: "select", options: voiceOptions },
          knowledgeBaseId: {
            label: "Knowledge Base",
            widget: "select",
            options: knowledgeBaseOptions,
          },
          voiceChatTransport: { label: "Voice Chat Transport" },
          disableIdleTimeout: {
            label: "Disable Idle Timeout",
            widget: "select",
            options: [
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ],
          },
          activityIdleTimeout: {
            label: "Activity Idle Timeout (sec)",
            widget: "slider",
            min: 30,
            max: 3600,
            step: 10,
          },
          stt: { label: "STT Settings" },
          language: {
            label: "Language",
            widget: "select",
            options: languagesOptions,
          },
          systemPrompt: {
            label: "System Prompt / Knowledge Base Text",
            widget: "textarea",
          },
          // Array<string> -> AutoForm will render as multi-select when options are provided
          mcpServers: {
            label: "MCP Servers",
            widget: "select",
            options: mcpServerOptions,
          },
        }}
        form={form as any}
        schema={schema}
        submitLabel="Save Agent"
        onSubmit={onSubmit}
      />
      <div className="flex items-center justify-end">
        <button
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          type="button"
          onClick={() => onPublish?.()}
        >
          Publish Agent
        </button>
      </div>
    </div>
  );
}
