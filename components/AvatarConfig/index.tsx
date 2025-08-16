import type { AgentConfig } from "@/lib/schemas/agent";

import React, { useEffect, useState } from "react";
import { AvatarQuality, StartAvatarRequest, VoiceChatTransport } from "@heygen/streaming-avatar";

import { STT_LANGUAGE_LIST } from "@/app/lib/constants";
import { useAgentStore } from "@/lib/stores/agent";

import { Input } from "../Input";
import { Select } from "../Select";
import { Field } from "./Field";
import { useAvatarOptions } from "./hooks/useAvatarOptions";
import VoiceSettings from "./components/VoiceSettings";
import STTSettings from "./components/STTSettings";
import StartSessionButton from "./components/StartSessionButton";

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
  isConnecting: boolean;
  startSession: () => void;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
  isConnecting,
  startSession,
}) => {
  const { currentAgent, updateAgent } = useAgentStore();

  const onChange = <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => {
    // Update the sidebar session config
    const nextConfig = { ...config, [key]: value } as StartAvatarRequest;
    onConfigChange(nextConfig);

    // Also reflect relevant fields into the agent store
    try {
      const patch: Partial<AgentConfig> = {};
      if (key === "language") {
        patch.language = value as string;
      } else if (key === "avatarName") {
        patch.avatarId = value as string;
      } else if (key === "knowledgeId") {
        patch.knowledgeBaseId = value as string;
      } else if (key === "voice") {
        const v = value as StartAvatarRequest["voice"];
        patch.voice = {
          ...(currentAgent?.voice ?? {}),
          voiceId: v?.voiceId,
          rate: v?.rate,
          emotion: v?.emotion as any,
          elevenlabs_settings: {
            ...(currentAgent?.voice?.elevenlabs_settings ?? {}),
            model_id: (v?.model as any) ?? currentAgent?.voice?.elevenlabs_settings?.model_id,
          },
        } as any;
        // Also mirror the top-level voiceId if present in schema
        if (v?.voiceId) {
          (patch as any).voiceId = v.voiceId;
        }
      }
      if (Object.keys(patch).length) updateAgent(patch);
    } catch {
      // noop; do not block UI if agent store update fails
    }
  };
  const [showMore, setShowMore] = useState<boolean>(false);
  const { avatarOptions, selectedAvatar, customIdValid } = useAvatarOptions(
    config.avatarName,
  );

  // When the agent store updates, reflect values into the sidebar session config
  useEffect(() => {
    if (!currentAgent) return;
    const merged: StartAvatarRequest = {
      ...config,
      language: currentAgent.language ?? config.language,
      avatarName: currentAgent.avatarId ?? config.avatarName,
      knowledgeId: currentAgent.knowledgeBaseId ?? config.knowledgeId,
      voice: {
        ...config.voice,
        voiceId: currentAgent.voiceId ?? config.voice?.voiceId,
        rate: currentAgent.voice?.rate ?? config.voice?.rate,
        emotion: (currentAgent.voice?.emotion as any) ?? config.voice?.emotion,
        model:
          (currentAgent.voice?.elevenlabs_settings?.model_id as any) ??
          (config.voice?.model as any),
      },
    } as StartAvatarRequest;
    onConfigChange(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAgent]);

  return (
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4">
      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
        />
      </Field>
      <Field label="Avatar ID">
        <Select
          isSelected={(option) =>
            typeof option === "string"
              ? !!selectedAvatar?.isCustom
              : option.avatar_id === selectedAvatar?.avatarId
          }
          options={[...avatarOptions, "CUSTOM"]}
          placeholder="Select Avatar"
          renderOption={(option) => {
            return typeof option === "string"
              ? "Custom Avatar ID"
              : option.name;
          }}
          value={
            selectedAvatar?.isCustom ? "Custom Avatar ID" : selectedAvatar?.name
          }
          onSelect={(option) => {
            if (typeof option === "string") {
              onChange("avatarName", "");
            } else {
              onChange("avatarName", option.avatar_id);
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
          {config.avatarName ? (
            customIdValid ? (
              <div className="text-green-400 text-xs mt-1">Avatar ID found</div>
            ) : (
              <div className="text-red-400 text-xs mt-1">Avatar ID not found in available avatars</div>
            )
          ) : null}
        </Field>
      )}
      <Field label="Language">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          renderOption={(option) => option.label}
          value={
            STT_LANGUAGE_LIST.find((option) => option.value === config.language)
              ?.label
          }
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      <Field label="Avatar Quality">
        <Select
          isSelected={(option) => option === config.quality}
          options={Object.values(AvatarQuality)}
          renderOption={(option) => option}
          value={config.quality}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>
      <Field label="Voice Chat Transport">
        <Select
          isSelected={(option) => option === config.voiceChatTransport}
          options={Object.values(VoiceChatTransport)}
          renderOption={(option) => option}
          value={config.voiceChatTransport}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>
      {showMore && (
        <>
          <VoiceSettings config={config} onChange={onChange} />
          <STTSettings config={config} onChange={onChange} />
        </>
      )}
      <div className="mt-2 flex items-center gap-3">
        {(() => {
          const disabled =
            isConnecting ||
            (selectedAvatar?.isCustom && !!config.avatarName && !customIdValid);
          return (
            <StartSessionButton
              disabled={disabled}
              isConnecting={isConnecting}
              onClick={() => startSession()}
            />
          );
        })()}
      </div>

      <button
        className="text-zinc-400 text-sm cursor-pointer w-full text-center bg-transparent"
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? "Show less" : "Show more..."}
      </button>
    </div>
  );
};
