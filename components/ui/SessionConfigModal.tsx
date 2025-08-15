import { useEffect, useState } from "react";
import type { StartAvatarRequest } from "@heygen/streaming-avatar";

import { useSessionStore } from "@/lib/stores/session";

import { AvatarConfig } from "../AvatarConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface SessionConfigModalProps {
  isConnecting: boolean;
  initialConfig: StartAvatarRequest;
  startSession: (config: StartAvatarRequest) => void;
}

export function SessionConfigModal({
  isConnecting,
  initialConfig,
  startSession,
}: SessionConfigModalProps) {
  const { isConfigModalOpen, closeConfigModal } = useSessionStore();
  const [config, setConfig] = useState<StartAvatarRequest>(initialConfig);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleStartSession = () => {
    startSession(config);
    closeConfigModal();
  };

  return (
    <Dialog open={isConfigModalOpen} onOpenChange={closeConfigModal}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Session Configuration</DialogTitle>
          <DialogDescription>
            Adjust your avatar and voice settings before starting the session.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <AvatarConfig
            config={config}
            isConnecting={isConnecting}
            startSession={handleStartSession}
            onConfigChange={setConfig}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
