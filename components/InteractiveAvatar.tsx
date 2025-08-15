import { useEffect, useMemo, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";
import {
  AvatarQuality,
  ElevenLabsModel,
  StartAvatarRequest,
  STTProvider,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { nanoid } from "nanoid";
import { Settings } from "lucide-react";

import { AvatarSession } from "./AvatarSession";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { SessionConfigModal } from "./ui/SessionConfigModal";

import { AVATARS } from "@/app/lib/constants";
import { ApiServiceProvider, useApiService } from "@/components/logic/ApiServiceContext";
import { Button } from "@/components/ui/button";
import { HeyGenService } from "@/lib/services/heygen";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatarCore() {
  const {
    sessionState,
    stream: mediaStream,
    startAvatar: startSession,
    stopAvatar: stopSession,
    initAvatar,
  } = useStreamingAvatarSession();

  const { setApiService } = useApiService();

  const { addMessage, openConfigModal } = useSessionStore();

  const mediaStreamRef = useRef<HTMLVideoElement>(null!);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token); // Log the token to verify
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (config: StartAvatarRequest) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      const heygenService = new HeyGenService(avatar);

      setApiService(heygenService);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e: any) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e: any) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event: any) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event: any) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event: any) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event: any) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (e: any) => {
        console.log(">>>>> Avatar talking message:", e);
      });

      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event: any) => {
        console.log(">>>>> Avatar end message:", event);
        addMessage({
          id: nanoid(),
          content: event.detail.message,
          sender: MessageSender.AVATAR,
        });
      });

      await startSession(config);
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  const stopSessionV2 = useMemoizedFn(() => {
    stopSession().then(() => {
      setApiService(null);
    });
  });

  useUnmount(() => {
    stopSessionV2();
  });

  useEffect(() => {
    if (mediaStream && mediaStreamRef.current) {
      mediaStreamRef.current.srcObject = mediaStream;
      mediaStreamRef.current.onloadedmetadata = () => {
        mediaStreamRef.current!.play();
      };
    }
  }, [mediaStream, mediaStreamRef]);

  const isConnecting = useMemo(
    () =>
      sessionState === StreamingAvatarSessionState.CONNECTING,
    [sessionState],
  );

  return (
    <div className="w-full h-screen relative bg-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <SessionConfigModal
          initialConfig={DEFAULT_CONFIG}
          isConnecting={isConnecting}
          startSession={startSessionV2}
        />
      </div>
      <div className="w-full h-full">
        <AvatarSession
          mediaStream={mediaStreamRef}
          sessionState={sessionState}
          stopSession={stopSessionV2}
        />
      </div>
      {/* Floating Settings Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-500"
          onClick={openConfigModal}
        >
          <Settings className="h-6 w-6" />
          <span className="sr-only">Open session settings</span>
        </Button>
      </div>
    </div>
  );
}

function InteractiveAvatar() {
  const [apiService, setApiService] = useState<HeyGenService | null>(null);

  return (
    <ApiServiceProvider service={apiService} setApiService={setApiService}>
      <InteractiveAvatarCore />
    </ApiServiceProvider>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
