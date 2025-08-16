import { useEffect, useState } from "react";
import type { StartAvatarRequest } from "@heygen/streaming-avatar";

import { useSessionStore } from "@/lib/stores/session";

import { AvatarConfig } from "../AvatarConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { UserSettingsSchema } from "@/lib/schemas/global";
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
      quality: "high" as any,
      voiceChatTransport: (globalThis as any).VoiceChatTransport?.WEBSOCKET,
      disableIdleTimeout: false,
      activityIdleTimeout: 120,
      stt: {
        // provider left undefined by default
        confidenceThreshold: 0.6 as any,
      },
    },
    mode: "onChange",
  });

  const saveUserSettings = (values: any) => {
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
              onClick={() => setActiveTab("session")}
              type="button"
            >
              Session
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === "user"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              onClick={() => setActiveTab("user")}
              type="button"
            >
              User Settings
            </button>
            <button
              className={`px-3 py-2 text-sm ${
                activeTab === "agent"
                  ? "border-b-2 border-blue-500 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              onClick={() => setActiveTab("agent")}
              type="button"
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
              onConfigChange={setConfig}
              startSession={handleStartSession}
            />
          )}

          {activeTab === "user" && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Configure your preferences. These persist locally in your browser.
              </p>
              <AutoForm
                className="space-y-3"
                form={userForm}
                onSubmit={saveUserSettings}
                schema={UserSettingsSchema}
                submitLabel="Save Preferences"
              />
            </div>
          )}

          {activeTab === "agent" && (
            <div className="text-sm text-zinc-400">
              Agent configuration coming soon.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
