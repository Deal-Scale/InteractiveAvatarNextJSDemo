import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { VoiceChatTransport } from "@heygen/streaming-avatar";
import { useEffect, useState } from "react";
import { z } from "zod";

import { AvatarConfig } from "../AvatarConfig";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

import { useSessionStore } from "@/lib/stores/session";
import { UserSettingsSchema } from "@/lib/schemas/global";
import type { UserSettings } from "@/lib/schemas/global";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import { useZodForm } from "@/components/forms/useZodForm";
import { AutoForm } from "@/components/forms/AutoForm";

interface SessionConfigModalProps {
  isConnecting: boolean;
  initialConfig: StartAvatarRequest;
  startSession: (config: StartAvatarRequest) => void;
}

export function SessionConfigModal({
  isConnecting,
  initialConfig,
  startSession,
}: SessionConfigModalProps) {
  const { isConfigModalOpen, closeConfigModal } = useSessionStore();
  const [config, setConfig] = useState<StartAvatarRequest>(initialConfig);
  const [activeTab, setActiveTab] = useState<"session" | "user" | "agent">(
    "session",
  );

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleStartSession = () => {
    startSession(config);
    closeConfigModal();
  };

  // User Settings form instance
  const userForm = useZodForm(UserSettingsSchema, {
    defaultValues: {
      userId: "local-user",
      language: "en-US",
      quality: "high",
      voiceChatTransport: VoiceChatTransport.WEBSOCKET,
      disableIdleTimeout: false,
      activityIdleTimeout: 120,
      stt: {
        // provider left undefined by default
        confidenceThreshold: 0.6,
      },
    } as Partial<UserSettings>,
    mode: "onChange",
  });

  // Agent Settings form instance
  const agentForm = useZodForm(AgentConfigSchema, {
    defaultValues: {
      id: "local-agent",
      name: "Local Agent",
      avatarId: "",
    } as z.infer<typeof AgentConfigSchema>,
    mode: "onChange",
  });

  const saveUserSettings = (values: z.infer<typeof UserSettingsSchema>) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("userSettings", JSON.stringify(values));
      }
      // Keep the modal open; provide a subtle confirmation via console for now
      console.log("User settings saved:", values);
    } catch (e) {
      console.warn("Failed to persist user settings", e);
    }
  };

  const saveAgentSettings = (values: z.infer<typeof AgentConfigSchema>) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("agentSettings", JSON.stringify(values));
      }
      console.log("Agent settings saved:", values);
    } catch (e) {
      console.warn("Failed to persist agent settings", e);
    }
  };

  // Load saved settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedUser = localStorage.getItem("userSettings");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        userForm.reset(parsed);
      }
      const savedAgent = localStorage.getItem("agentSettings");
      if (savedAgent) {
        const parsed = JSON.parse(savedAgent);
        agentForm.reset(parsed);
      }
    } catch (e) {
      console.warn("Failed to load saved settings", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={closeConfigModal}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Session Configuration</DialogTitle>
          <DialogDescription>
            Adjust your avatar and voice settings before starting the session.
          </DialogDescription>
        </DialogHeader>
        {/* Tabs Header */}
        <div className="px-4">
          <div className="mb-4 flex gap-2 border-b border-zinc-800">
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === "session"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("session")}
            >
              Session
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === "user"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("user")}
            >
              User Settings
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === "agent"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              type="button"
              onClick={() => setActiveTab("agent")}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4">
          {activeTab === "session" && (
            <AvatarConfig
              config={config}
              isConnecting={isConnecting}
              startSession={handleStartSession}
              onConfigChange={setConfig}
            />
          )}

          {activeTab === "user" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Configure your preferences. These persist locally in your
                browser.
              </p>
              <AutoForm
                className="space-y-3"
                form={userForm}
                schema={UserSettingsSchema}
                submitLabel="Save Preferences"
                onSubmit={saveUserSettings}
              />
            </div>
          )}

          {activeTab === "agent" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Configure your agent’s defaults. These persist locally in your
                browser.
              </p>
              <AutoForm
                className="space-y-3"
                form={agentForm}
                schema={AgentConfigSchema}
                submitLabel="Save Agent"
                onSubmit={saveAgentSettings}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
