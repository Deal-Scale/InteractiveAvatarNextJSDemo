import React from "react";
import {
  ElevenLabsModel,
  VoiceEmotion,
  StartAvatarRequest,
} from "@heygen/streaming-avatar";
 
import { Field } from "../Field";
import { Input } from "../../Input";
import { Select } from "../../Select";

type Props = {
  config: StartAvatarRequest;
  onChange: <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => void;
};

const VoiceSettings: React.FC<Props> = ({ config, onChange }) => {
  return (
    <>
      <h1 className="text-foreground w-full text-center mt-5">
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
    </>
  );
};

export default VoiceSettings;
