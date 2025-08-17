import React from "react";
import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { AvatarConfig } from "../../AvatarConfig";

interface SessionTabProps {
  config: StartAvatarRequest;
  isConnecting: boolean;
  onConfigChange: (c: StartAvatarRequest) => void;
  onStart: () => void;
}

export function SessionTab({ config, isConnecting, onConfigChange, onStart }: SessionTabProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
      <AvatarConfig
        config={config}
        isConnecting={isConnecting}
        startSession={onStart}
        onConfigChange={onConfigChange}
      />
    </div>
  );
}
