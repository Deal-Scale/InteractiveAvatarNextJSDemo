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

import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import { useSessionStore } from "@/lib/stores/session";
import { useSettingsStore } from "@/lib/stores/settings";
import { useAgentStore } from "@/lib/stores/agent";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import type { UserSettings, AppGlobalSettings } from "@/lib/schemas/global";
import {
  UserSettingsSchema,
  AppGlobalSettingsSchema,
} from "@/lib/schemas/global";

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
  const { isConfigModalOpen, closeConfigModal, agentSettings } = useSessionStore();
  const {
    userSettings,
    setUserSettings,
    globalSettings,
    setGlobalSettings,
  } = useSettingsStore();
  const { currentAgent, setAgent, setLastStarted, markClean } = useAgentStore();
  const [config, setConfig] = useState<StartAvatarRequest>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    "session" | "global" | "user" | "agent"
  >("session");

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Prefill/merge settings into session config whenever settings change
  useEffect(() => {
    setConfig((prev) => {
      let next = { ...prev } as StartAvatarRequest;
      if (userSettings) {
        const q = (userSettings as any).quality;
        const mappedQuality = typeof q === "string" ? (q[0].toUpperCase() + q.slice(1).toLowerCase()) : q;
        next = {
          ...next,
          voiceChatTransport: userSettings.voiceChatTransport ?? next.voiceChatTransport,
          quality: (mappedQuality as any) ?? next.quality,
          language: userSettings.language ?? next.language,
          sttSettings: {
            ...next.sttSettings,
            provider: userSettings.stt?.provider ?? next.sttSettings?.provider,
          },
        } as StartAvatarRequest;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettings, globalSettings]);

  const handleStartSession = () => {
    // Capture the latest agent form values and merge into session config
    let finalConfig = config;
    try {
      const latestAgent = agentForm.getValues();
      // Persist the agent config used to start
      setLastStarted(latestAgent as any);
      markClean();

      // Map AgentConfig -> StartAvatarRequest fields where applicable
      finalConfig = {
        ...config,
        // agent.language -> session.language
        language: latestAgent.language ?? config.language,
        // agent.avatarId -> session.avatarName
        avatarName: latestAgent.avatarId ?? config.avatarName,
        // agent.knowledgeBaseId -> session.knowledgeId
        knowledgeId: latestAgent.knowledgeBaseId ?? config.knowledgeId,
        voice: {
          ...config.voice,
          voiceId: latestAgent.voiceId ?? config.voice?.voiceId,
          rate: latestAgent.voice?.rate ?? config.voice?.rate,
          emotion: (latestAgent.voice?.emotion as any) ?? config.voice?.emotion,
          // Prefer explicit voice.model on agent.voice; fallback to elevenlabs_settings.model_id
          model:
            (latestAgent.voice as any)?.model ??
            (latestAgent.voice?.elevenlabs_settings?.model_id as any) ??
            config.voice?.model,
        },
      } as typeof config;

      // Merge user/global settings into API request (transport, quality, language, stt)
      if (userSettings) {
        // map string quality to enum if necessary
        const q = (userSettings as any).quality;
        const mappedQuality = typeof q === "string" ? (q[0].toUpperCase() + q.slice(1).toLowerCase()) : q;
        finalConfig = {
          ...finalConfig,
          voiceChatTransport: userSettings.voiceChatTransport ?? finalConfig.voiceChatTransport,
          quality: (mappedQuality as any) ?? finalConfig.quality,
          language: userSettings.language ?? finalConfig.language,
          sttSettings: {
            ...finalConfig.sttSettings,
            provider: userSettings.stt?.provider ?? finalConfig.sttSettings?.provider,
          },
        } as typeof finalConfig;
      }
    } catch {
      // if form not ready, use current config
    }

    startSession(finalConfig);
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

  // Global (App) Settings form instance
  const globalForm = useZodForm(AppGlobalSettingsSchema, {
    defaultValues: {
      theme: "system",
      telemetryEnabled: false,
      apiBaseUrl: "https://api.heygen.com",
    } as Partial<AppGlobalSettings>,
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
      setUserSettings(values as UserSettings);
      // Keep the modal open; provide a subtle confirmation via console for now
      console.log("User settings saved:", values);
    } catch (e) {
      console.warn("Failed to persist user settings", e);
    }
  };

  const saveGlobalSettings = (
    values: z.infer<typeof AppGlobalSettingsSchema>,
  ) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("globalSettings", JSON.stringify(values));
      }
      setGlobalSettings(values as AppGlobalSettings);
      console.log("Global settings saved:", values);
    } catch (e) {
      console.warn("Failed to persist global settings", e);
    }
  };

  const saveAgentSettings = (values: z.infer<typeof AgentConfigSchema>) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("agentSettings", JSON.stringify(values));
      }
      // Sync to dedicated agent store as current editable config
      setAgent(values as any);
      console.log("Agent settings saved:", values);
    } catch (e) {
      console.warn("Failed to persist agent settings", e);
    }
  };

  // Load saved settings on mount from store first, then localStorage fallback
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (globalSettings) {
        globalForm.reset(globalSettings);
      } else {
        const savedGlobal = localStorage.getItem("globalSettings");
        if (savedGlobal) globalForm.reset(JSON.parse(savedGlobal));
      }

      if (userSettings) {
        userForm.reset(userSettings);
      } else {
        const savedUser = localStorage.getItem("userSettings");
        if (savedUser) userForm.reset(JSON.parse(savedUser));
      }
      // Load agent from the dedicated agent store first, fallback to legacy session store or localStorage
      if (currentAgent) {
        agentForm.reset(currentAgent as any);
      } else if (agentSettings) {
        agentForm.reset(agentSettings as any);
      } else {
        const savedAgent = localStorage.getItem("agentSettings");
        if (savedAgent) agentForm.reset(JSON.parse(savedAgent));
      }
    } catch (e) {
      console.warn("Failed to load saved settings", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={closeConfigModal}>
      <DialogContent
        className="w-[96vw] md:w-[92vw] max-w-[1280px] p-0 overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold">
              Session Configuration
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400">
              Adjust your avatar and voice settings before starting the session.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tabs Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950">
          <div
            role="tablist"
            aria-label="Session configuration sections"
            className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-6"
          >
            {([
              { key: "session", label: "Session" },
              { key: "global", label: "Global Settings" },
              { key: "user", label: "User Settings" },
              { key: "agent", label: "Agent" },
            ] as const).map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                className={`relative -mb-px px-3 md:px-4 py-3 text-sm font-medium outline-none transition-colors ${
                  activeTab === t.key
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
                type="button"
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
                <span
                  className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity ${
                    activeTab === t.key
                      ? "bg-blue-500 opacity-100"
                      : "opacity-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tabs Content */}
        <div className="max-h-[70vh] overflow-y-auto p-4 md:p-6">
          {activeTab === "session" && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
              <AvatarConfig
                config={config}
                isConnecting={isConnecting}
                startSession={handleStartSession}
                onConfigChange={setConfig}
              />
            </div>
          )}

          {activeTab === "user" && (
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                Configure your preferences. These persist locally in your browser.
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

          {activeTab === "global" && (
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                Configure app-wide options (theme, telemetry, API base URL). These persist locally in your browser.
              </p>
              <AutoForm
                className="space-y-3"
                form={globalForm}
                schema={AppGlobalSettingsSchema}
                submitLabel="Save Global Settings"
                onSubmit={saveGlobalSettings}
              />
            </div>
          )}

          {activeTab === "agent" && (
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                Configure your agent’s defaults. These persist locally in your browser.
              </p>
              <AutoForm
                className="space-y-3"
                form={agentForm}
                schema={AgentConfigSchema}
                fields={{
                  temperature: { label: "Temperature", widget: "slider", min: 0, max: 2, step: 0.1 },
                }}
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
