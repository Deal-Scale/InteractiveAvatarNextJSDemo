import React, { useEffect, useMemo, useState } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";

import { AVATARS, STT_LANGUAGE_LIST } from "@/app/lib/constants";
import { useAgentStore } from "@/lib/stores/agent";
import type { AgentConfig } from "@/lib/schemas/agent";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const [avatarOptions, setAvatarOptions] = useState(AVATARS);

  useEffect(() => {
    let cancelled = false;
    const fetchAvatars = async () => {
      try {
        const res = await fetch("/api/avatars", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];
        const mapped = list.map((a: any) => ({
          avatar_id: a.avatar_id,
          name: a.pose_name || a.normal_preview || a.default_voice || a.avatar_id,
        }));
        if (!cancelled && mapped.length) setAvatarOptions(mapped);
      } catch (_err) {
        // fallback to built-in AVATARS already in state
      }
    };
    fetchAvatars();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const selectedAvatar = useMemo(() => {
    const avatar = avatarOptions.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

    if (!avatar) {
      return {
        isCustom: true,
        name: "Custom Avatar ID",
        avatarId: null,
      };
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      };
    }
  }, [config.avatarName, avatarOptions]);

  const customIdValid = useMemo(() => {
    if (!selectedAvatar?.isCustom) return true;
    if (!config.avatarName) return false;
    return avatarOptions.some((a) => a.avatar_id === config.avatarName);
  }, [selectedAvatar?.isCustom, config.avatarName, avatarOptions]);

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
          <h1 className="text-zinc-100 w-full text-center mt-5">
            Voice Settings
          </h1>
          <Field label="Custom Voice ID">
            <Input
              placeholder="Enter custom voice ID"
              value={config.voice?.voiceId}
              onChange={(value) =>
                onChange("voice", { ...config.voice, voiceId: value })
              }
            />
          </Field>
          <Field label="Emotion">
            <Select
              isSelected={(option) => option === config.voice?.emotion}
              options={Object.values(VoiceEmotion)}
              renderOption={(option) => option}
              value={config.voice?.emotion}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, emotion: option })
              }
            />
          </Field>
          <Field label="ElevenLabs Model">
            <Select
              isSelected={(option) => option === config.voice?.model}
              options={Object.values(ElevenLabsModel)}
              renderOption={(option) => option}
              value={config.voice?.model}
              onSelect={(option) =>
                onChange("voice", { ...config.voice, model: option })
              }
            />
          </Field>
          <h1 className="text-zinc-100 w-full text-center mt-5">
            STT Settings
          </h1>
          <Field label="Provider">
            <Select
              isSelected={(option) => option === config.sttSettings?.provider}
              options={Object.values(STTProvider)}
              renderOption={(option) => option}
              value={config.sttSettings?.provider}
              onSelect={(option) =>
                onChange("sttSettings", {
                  ...config.sttSettings,
                  provider: option,
                })
              }
            />
          </Field>
        </>
      )}
      <div className="mt-2 flex items-center gap-3">
        <div className="relative w-full overflow-hidden rounded-md inline-flex">
          {(() => {
            const isDisabled =
              isConnecting || (selectedAvatar?.isCustom && !!config.avatarName && !customIdValid);
            if (isDisabled) {
              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="inline-flex w-full">
                        <button
                          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 w-full"
                          onClick={() => startSession()}
                          disabled
                        >
                          {isConnecting ? "Connecting..." : "Start Session"}
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Set up your agent and settings first
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }
            return (
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50 w-full"
                onClick={() => startSession()}
              >
                {isConnecting ? "Connecting..." : "Start Session"}
              </button>
            );
          })()}
          <BorderBeam borderWidth={2} duration={8} size={90} />
        </div>
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
