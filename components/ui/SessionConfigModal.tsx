import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import type { UserSettings, AppGlobalSettings } from "@/lib/schemas/global";

import { useEffect, useState } from "react";
import { z } from "zod";

import { TabsHeader } from "../modals/session/Tabs";
import { SessionTab } from "../modals/session/SessionTab";
import { UserSettingsTab } from "../modals/session/UserSettingsTab";
import { GlobalSettingsTab } from "../modals/session/GlobalSettingsTab";
import { AgentSettingsTab } from "../modals/session/AgentSettingsTab";
import { useDynamicOptions } from "../modals/session/hooks";
import { PublishAgentModal } from "../modals/session/PublishAgentModal";
import {
  applyUserSettingsToConfig,
  initFormsFromStorage,
  mapAgentAndSettingsToConfig,
} from "../modals/session/utils";
import { SessionConfigHeader } from "../modals/session/Header";

import { Dialog, DialogContent } from "./dialog";

import { useZodForm } from "@/components/forms/useZodForm";
import { useSessionStore } from "@/lib/stores/session";
import { useSettingsStore } from "@/lib/stores/settings";
import { useAgentStore } from "@/lib/stores/agent";
import { useThemeStore } from "@/lib/stores/theme";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import {
  UserSettingsSchema,
  AppGlobalSettingsSchema,
} from "@/lib/schemas/global";
import { languagesOptions } from "@/data/options";

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
  const { isConfigModalOpen, closeConfigModal, agentSettings } =
    useSessionStore();
  const { userSettings, setUserSettings, globalSettings, setGlobalSettings } =
    useSettingsStore();
  const setThemeMode = useThemeStore((s) => s.setMode);
  const { currentAgent, setAgent, updateAgent, setLastStarted, markClean } =
    useAgentStore();
  const [config, setConfig] = useState<StartAvatarRequest>(initialConfig);
  const [activeTab, setActiveTab] = useState<
    "session" | "global" | "user" | "agent"
  >("session");
  const [isPublishOpen, setPublishOpen] = useState(false);
  const {
    avatarOptions,
    voiceOptions,
    mcpServerOptions,
    knowledgeBaseOptions,
  } = useDynamicOptions();

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  // Prefill/merge settings into session config whenever settings change
  useEffect(() => {
    setConfig((prev) => applyUserSettingsToConfig(prev, userSettings));
  }, [userSettings, globalSettings]);

  // Sync global theme to theme store (ThemeBridge will apply next-themes + emotion class)
  useEffect(() => {
    if (globalSettings?.theme) {
      setThemeMode(globalSettings.theme as any);
    }
  }, [globalSettings?.theme, setThemeMode]);

  const handleStartSession = () => {
    let finalConfig = config;

    try {
      const latestAgent = agentForm.getValues();

      setLastStarted(latestAgent as any);
      markClean();
      finalConfig = mapAgentAndSettingsToConfig(
        config,
        latestAgent,
        userSettings,
      );
    } catch {
      // fallback to current config
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

  // Live-sync agent form -> agent store so sidebar reflects changes immediately
  useEffect(() => {
    const subscription = agentForm.watch((values) => {
      try {
        updateAgent(values as any);
      } catch {
        // noop
      }
    });

    return () => {
      try {
        // RHF returns a subscription object with unsubscribe
        (subscription as any)?.unsubscribe?.();
      } catch {
        // noop
      }
    };
  }, [agentForm, updateAgent]);

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
    initFormsFromStorage({
      globalForm,
      userForm,
      agentForm,
      globalSettings,
      userSettings,
      currentAgent,
      agentSettings,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={closeConfigModal}>
      <DialogContent className="w-[96vw] md:w-[92vw] max-w-[1280px] p-0 bg-card text-foreground flex flex-col max-h-[90vh]">
        <SessionConfigHeader />

        {/* Tabs Header */}
        <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tabs Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "session" && (
            <SessionTab
              config={config}
              isConnecting={isConnecting}
              onConfigChange={setConfig}
              onStart={handleStartSession}
            />
          )}

          {activeTab === "user" && (
            <UserSettingsTab
              form={userForm as any}
              languagesOptions={languagesOptions}
              schema={UserSettingsSchema as any}
              onSubmit={saveUserSettings as any}
            />
          )}

          {activeTab === "global" && (
            <GlobalSettingsTab
              form={globalForm as any}
              schema={AppGlobalSettingsSchema as any}
              onSubmit={saveGlobalSettings as any}
            />
          )}

          {activeTab === "agent" && (
            <AgentSettingsTab
              avatarOptions={avatarOptions}
              form={agentForm as any}
              knowledgeBaseOptions={knowledgeBaseOptions}
              languagesOptions={languagesOptions}
              mcpServerOptions={mcpServerOptions}
              schema={AgentConfigSchema as any}
              voiceOptions={voiceOptions}
              onPublish={() => setPublishOpen(true)}
              onSubmit={saveAgentSettings as any}
            />
          )}
        </div>
        <PublishAgentModal
          open={isPublishOpen}
          onOpenChange={setPublishOpen}
          onSubmit={(values) => {
            try {
              // Placeholder: integrate with your publish API or persistence
              console.log("Publishing agent with public metadata:", values);
            } finally {
              setPublishOpen(false);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
