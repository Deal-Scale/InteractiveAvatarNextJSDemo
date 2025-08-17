"use client";

import React from "react";

import { Chat } from "@/components/AvatarSession/Chat";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useSessionStore } from "@/lib/stores/session";
import {
  useStreamingAvatarContext,
  StreamingAvatarSessionState,
} from "@/components/logic/context";
import { useChatController } from "@/components/AvatarSession/hooks/useChatController";

export function BottomChat() {
  // Prefer real session state when provider is present
  const { sessionState } = useStreamingAvatarContext();
  const effectiveState = sessionState ?? StreamingAvatarSessionState.INACTIVE;

  const { messages } = useSessionStore();

  const {
    // state
    chatInput,
    setChatInput,
    isSending,
    mockVoiceActive,
    canChat,
    isVoiceChatActive,
    // actions
    sendMessageVoid,
    startVoiceChatVoid,
    stopVoiceChatVoid,
    handleCopy,
    handleArrowUp,
    handleArrowDown,
    enableMockChatUi,
  } = useChatController(effectiveState);

  return (
    <div className="flex h-full w-full flex-col">
      {canChat ? (
        <Chat
          chatInput={chatInput}
          inputOnly={false}
          isSending={isSending}
          isVoiceChatActive={isVoiceChatActive || mockVoiceActive}
          messages={messages}
          onArrowDown={handleArrowDown}
          onArrowUp={handleArrowUp}
          onChatInputChange={setChatInput}
          onCopy={handleCopy}
          onSendMessage={sendMessageVoid}
          onStartVoiceChat={startVoiceChatVoid}
          onStopVoiceChat={stopVoiceChatVoid}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3 text-foreground">
            <Loader size="lg" variant="classic" />
            <p className="text-sm text-muted-foreground">
              {effectiveState === StreamingAvatarSessionState.CONNECTING
                ? "Connecting to avatar session..."
                : "Waiting to start session..."}
            </p>
            <Button onClick={enableMockChatUi} size="sm" variant="secondary">
              Start chat without session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
