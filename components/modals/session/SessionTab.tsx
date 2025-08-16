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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6 shadow-sm">
      <AvatarConfig
        config={config}
        isConnecting={isConnecting}
        startSession={onStart}
        onConfigChange={onConfigChange}
      />
    </div>
  );
}
