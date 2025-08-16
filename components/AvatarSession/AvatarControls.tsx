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
      {/* Floating controls in the top-center over the video */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-2 items-center">
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
