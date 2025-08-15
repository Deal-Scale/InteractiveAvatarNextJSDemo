import { useMemo } from "react";
import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";

import { AvatarControls } from "./AvatarSession/AvatarControls";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { Chat } from "./AvatarSession/Chat";
import ConnectionIndicator from "./AvatarSession/ConnectionIndicator";
import { StreamingAvatarSessionState } from "./logic/context";
import { ChatModeToggle } from "./ui/ChatModeToggle";
import { Sidebar } from "./ui/sidebar";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { MessageSender } from "@/lib/types";
import { useSessionStore } from "@/lib/stores/session";
import { useVoiceChat } from "@/components/logic/useVoiceChat";

interface AvatarSessionProps {
  mediaStream: React.RefObject<HTMLVideoElement>;
  sessionState: StreamingAvatarSessionState;
  stopSession: () => void;
}

export function AvatarSession({
  stopSession,
  mediaStream,
  sessionState,
}: AvatarSessionProps) {
  const { apiService } = useApiService();
  const { chatMode, setChatMode, messages, addMessage } = useSessionStore();
  const { startVoiceChat, stopVoiceChat, isVoiceChatActive } = useVoiceChat();

  const isConnected = useMemo(
    () => sessionState === StreamingAvatarSessionState.CONNECTED,
    [sessionState],
  );

  const handleSendMessage = useMemoizedFn(async (text: string) => {
    addMessage({
      id: nanoid(),
      content: text,
      sender: MessageSender.CLIENT,
    });
    if (apiService) {
      await apiService.textChat.sendMessageSync(text);
    }
  });

  // Wrap async handlers to match Chat's expected void return types
  const sendMessageVoid = useMemoizedFn((text: string) => {
    void handleSendMessage(text);
  });

  const startVoiceChatVoid = useMemoizedFn(() => {
    void startVoiceChat();
  });

  const stopVoiceChatVoid = useMemoizedFn(() => {
    stopVoiceChat();
  });

  // Auxiliary handlers required by Chat
  const handleCopy = useMemoizedFn(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // no-op fallback
      console.error("Copy failed", e);
    }
  });

  const handleStartListening = useMemoizedFn(() => {
    // placeholder: integrate speech recognition if/when available
  });

  const handleStopListening = useMemoizedFn(() => {
    // placeholder: integrate speech recognition if/when available
  });

  const handleArrowUp = useMemoizedFn(() => {
    // optional: route to message history navigation
  });

  const handleArrowDown = useMemoizedFn(() => {
    // optional: route to message history navigation
  });

  return (
    <div className="w-full flex flex-row gap-4">
      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
        <AvatarVideo ref={mediaStream} />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <ConnectionIndicator sessionState={sessionState} />
        </div>
      </div>

      <Sidebar>
        {isConnected ? (
          <>
            <ChatModeToggle
              chatMode={chatMode}
              onChatModeChange={setChatMode}
            />
            <Chat
              chatMode={chatMode}
              handleArrowDown={handleArrowDown}
              handleArrowUp={handleArrowUp}
              handleCopy={handleCopy}
              handleSendMessage={sendMessageVoid}
              handleStartListening={handleStartListening}
              handleStopListening={handleStopListening}
              isVoiceChatActive={isVoiceChatActive}
              messages={messages}
              sendMessage={sendMessageVoid}
              startVoiceChat={startVoiceChatVoid}
              stopVoiceChat={stopVoiceChatVoid}
            />
            <AvatarControls stopSession={stopSession} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Waiting to start session...</p>
          </div>
        )}
      </Sidebar>
    </div>
  );
}
