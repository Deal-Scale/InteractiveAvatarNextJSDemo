import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { PromptBar } from "./PromptBar";

interface AvatarControlsProps {
  stopSession: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({ stopSession }) => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      {/* Removed Voice/Text toggle UI per request; keep behavior via existing controls */}
    
      <div className="absolute top-[-70px] right-3">
        <div className="flex gap-2">
          <Button className="!bg-zinc-700 !text-white" onClick={interrupt}>
            Interrupt
          </Button>
          <Button className="!bg-red-600 !text-white" onClick={stopSession}>
            Stop
          </Button>
        </div>
      </div>
    </div>
  );
};
