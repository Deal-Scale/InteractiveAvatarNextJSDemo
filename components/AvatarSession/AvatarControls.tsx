import React from "react";

import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

interface AvatarControlsProps {
  stopSession: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({ stopSession }) => {
  const { interrupt } = useInterrupt();

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Floating controls in the bottom-right over the video */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
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
