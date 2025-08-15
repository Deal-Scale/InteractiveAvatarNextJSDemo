import { useMemo, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";

import { AvatarControls } from "./AvatarSession/AvatarControls";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { Chat } from "./AvatarSession/Chat";
import ConnectionIndicator from "./AvatarSession/ConnectionIndicator";
import { useMessageHistory } from "./logic/useMessageHistory";
import { StreamingAvatarSessionState } from "./logic/context";
// Removed ChatModeToggle to simplify UI: voice chat is controlled via mic button in Chat
import { DockablePanel, DockMode } from "./ui/DockablePanel";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";

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
  const { messages, addMessage } = useSessionStore();
  const { startVoiceChat, stopVoiceChat, isVoiceChatActive } = useVoiceChat();
  const { navigateHistory, resetHistory } = useMessageHistory(messages);

  // UI state
  const [dock, setDock] = useState<DockMode>("bottom");
  const [expanded, setExpanded] = useState(false);
  const [floatingPos, setFloatingPos] = useState({ x: 24, y: 24 });
  const [chatInput, setChatInput] = useState("");

  const isConnected = useMemo(
    () => sessionState === StreamingAvatarSessionState.CONNECTED,
    [sessionState],
  );

  const handleSendMessage = useMemoizedFn(async (text: string) => {
    if (!text.trim()) {
      return;
    }

    addMessage({
      id: nanoid(),
      content: text,
      sender: MessageSender.CLIENT,
    });
    if (apiService) {
      await apiService.textChat.sendMessageSync(text);
    }
    resetHistory();
    setChatInput("");
  });

  // Wrap async handlers to match Chat's expected void return types
  const sendMessageVoid = useMemoizedFn((text: string) => {
    void handleSendMessage(text);
  });

  const startVoiceChatVoid = useMemoizedFn(async () => {
    try {
      // Let the HeyGen SDK acquire the microphone itself so it can
      // choose constraints that match its internal AudioContext.
      await startVoiceChat({});
    } catch (error) {
      console.error("Failed to start voice chat:", error);
    }
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
    const previousMessage = navigateHistory("up");

    if (previousMessage) {
      setChatInput(previousMessage);
    }
  });

  const handleArrowDown = useMemoizedFn(() => {
    const nextMessage = navigateHistory("down");

    if (nextMessage) {
      setChatInput(nextMessage);
    }
  });

  const chatPanelContent = (
    <>
      <Chat
        _onStartListening={handleStartListening}
        _onStopListening={handleStopListening}
        chatInput={chatInput}
        isVoiceChatActive={isVoiceChatActive}
        messages={messages}
        onArrowDown={handleArrowDown}
        onArrowUp={handleArrowUp}
        onChatInputChange={setChatInput}
        onCopy={handleCopy}
        onSendMessage={sendMessageVoid}
        onStartVoiceChat={startVoiceChatVoid}
        onStopVoiceChat={stopVoiceChatVoid}
      />
    </>
  );

  return (
    <div className="w-full flex flex-row gap-4">
      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
        <AvatarVideo ref={mediaStream} />
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <ConnectionIndicator sessionState={sessionState} />
        </div>

        {dock !== "right" && (
          <DockablePanel
            className="pointer-events-auto z-20"
            dock={dock}
            expanded={expanded}
            floatingPos={floatingPos}
            onDockChange={setDock}
            onFloatingPosChange={setFloatingPos}
            onToggleExpand={() => setExpanded((e) => !e)}
          >
            {isConnected ? (
              chatPanelContent
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Waiting to start session...</p>
              </div>
            )}
          </DockablePanel>
        )}
        {dock !== "right" && <AvatarControls stopSession={stopSession} />}
      </div>

      {dock === "right" ? (
        <DockablePanel
          className="py-4 px-2 z-20 h-full"
          dock="right"
          expanded={expanded}
          onDockChange={setDock}
          onToggleExpand={() => setExpanded((e) => !e)}
        >
          {isConnected ? (
            chatPanelContent
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">Waiting to start session...</p>
            </div>
          )}
        </DockablePanel>
      ) : (
        // When not docked right, keep a slim placeholder to preserve layout on wide screens
        <div className="w-[8px]" />
      )}
    </div>
  );
}
