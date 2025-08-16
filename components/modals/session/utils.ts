import type { StartAvatarRequest } from "@heygen/streaming-avatar";

export function mapAgentAndSettingsToConfig(
  base: StartAvatarRequest,
  latestAgent: any,
  userSettings?: any,
): StartAvatarRequest {
  let finalConfig: StartAvatarRequest = {
    ...base,
    language: latestAgent?.language ?? base.language,
    avatarName: latestAgent?.avatarId ?? base.avatarName,
    knowledgeId: latestAgent?.knowledgeBaseId ?? base.knowledgeId,
    quality: (latestAgent as any)?.quality ?? base.quality,
    voiceChatTransport: latestAgent?.voiceChatTransport ?? base.voiceChatTransport,
    sttSettings: {
      ...base.sttSettings,
      provider: latestAgent?.stt?.provider ?? base.sttSettings?.provider,
    },
    voice: {
      ...base.voice,
      voiceId: latestAgent?.voiceId ?? base.voice?.voiceId,
      rate: latestAgent?.voice?.rate ?? base.voice?.rate,
      emotion: (latestAgent?.voice?.emotion as any) ?? base.voice?.emotion,
      model:
        (latestAgent?.voice as any)?.model ??
        (latestAgent?.voice?.elevenlabs_settings?.model_id as any) ??
        base.voice?.model,
    },
  } as StartAvatarRequest;

  if (userSettings) {
    const q = (userSettings as any).quality;
    const mappedQuality =
      typeof q === "string" ? q[0].toUpperCase() + q.slice(1).toLowerCase() : q;

    finalConfig = {
      ...finalConfig,
      quality: (mappedQuality as any) ?? finalConfig.quality,
      language: userSettings.language ?? finalConfig.language,
    } as StartAvatarRequest;
  }

  return finalConfig;
}

export function applyUserSettingsToConfig(
  prev: StartAvatarRequest,
  userSettings?: any,
): StartAvatarRequest {
  if (!userSettings) return prev;

  const q = (userSettings as any).quality;
  const mappedQuality =
    typeof q === "string" ? q[0].toUpperCase() + q.slice(1).toLowerCase() : q;

  return {
    ...prev,
    quality: (mappedQuality as any) ?? prev.quality,
    language: userSettings.language ?? prev.language,
  } as StartAvatarRequest;
}

export function initFormsFromStorage(options: {
  globalForm: any;
  userForm: any;
  agentForm: any;
  globalSettings?: any;
  userSettings?: any;
  currentAgent?: any;
  agentSettings?: any;
}) {
  if (typeof window === "undefined") return;

  const {
    globalForm,
    userForm,
    agentForm,
    globalSettings,
    userSettings,
    currentAgent,
    agentSettings,
  } = options;

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
}
