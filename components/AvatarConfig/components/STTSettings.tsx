import React from "react";
import { StartAvatarRequest, STTProvider } from "@heygen/streaming-avatar";
import { Field } from "../Field";
import { Select } from "../../Select";

type Props = {
  config: StartAvatarRequest;
  onChange: <T extends keyof StartAvatarRequest>(key: T, value: StartAvatarRequest[T]) => void;
};

const STTSettings: React.FC<Props> = ({ config, onChange }) => {
  return (
    <>
      <h1 className="text-foreground w-full text-center mt-5">STT Settings</h1>
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
  );
};

export default STTSettings;
