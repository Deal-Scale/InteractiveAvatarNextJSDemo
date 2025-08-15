import { StartAvatarRequest } from "@heygen/streaming-avatar";
import { useMemo } from "react";

import { AvatarConfig } from "./AvatarConfig";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { Chat } from "./AvatarSession/Chat";
import { StreamingAvatarSessionState } from "./logic/context";
import ConnectionIndicator from "./AvatarSession/ConnectionIndicator";

interface AvatarSessionProps {
  config: StartAvatarRequest;
  mediaStream: React.RefObject<HTMLVideoElement>;
  sessionState: StreamingAvatarSessionState;
  setConfig: (config: StartAvatarRequest) => void;
  startSessionV2: (isVoiceChat: boolean) => void;
  stopSession: () => void;
}

export function AvatarSession({
  config,
  setConfig,
  startSessionV2,
  stopSession,
  mediaStream,
  sessionState,
}: AvatarSessionProps) {
  const isConnecting = useMemo(
    () =>
      sessionState === StreamingAvatarSessionState.CONNECTING,
    [sessionState],
  );

  const isConnected = useMemo(
    () => sessionState === StreamingAvatarSessionState.CONNECTED,
    [sessionState],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
        <AvatarVideo ref={mediaStream} />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <ConnectionIndicator sessionState={sessionState} />
        </div>
      </div>

      {isConnected ? (
        <>
          <Chat />
          <AvatarControls stopSession={stopSession} />
        </>
      ) : (
        <AvatarConfig
          config={config}
          isConnecting={isConnecting}
          startSession={startSessionV2}
          onConfigChange={setConfig}
        />
      )}
    </div>
  );
}
