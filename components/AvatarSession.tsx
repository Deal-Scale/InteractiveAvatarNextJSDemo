import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMemoizedFn } from "ahooks";
import {
  Maximize2Icon,
  Minimize2Icon,
  MoveIcon,
  PanelBottomOpenIcon,
  PanelRightOpenIcon,
} from "lucide-react";
import { nanoid } from "nanoid";

import { AvatarControls } from "./AvatarSession/AvatarControls";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { Chat } from "./AvatarSession/Chat";
import ConnectionIndicator from "./AvatarSession/ConnectionIndicator";
import { UserVideo } from "./AvatarSession/UserVideo";
import { useMessageHistory } from "./logic/useMessageHistory";
import { StreamingAvatarSessionState } from "./logic/context";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";
import { cn } from "@/lib/utils";

type DockMode = "right" | "bottom" | "floating";

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
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(
    null,
  );

  // UI state
  const [dock, setDock] = useState<DockMode>("bottom");
  const [expanded, setExpanded] = useState(false);
  const [floatingPos, setFloatingPos] = useState({ x: 24, y: 24 });
  const [chatInput, setChatInput] = useState("");
  const panelRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, offsetX: 0, offsetY: 0 });

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
      // Capture only local webcam video for PIP. Do NOT include audio here.
      // Let the HeyGen SDK acquire the microphone itself so it can
      // choose constraints that match its internal AudioContext (e.g., 16kHz).
      const videoOnly = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setUserVideoStream(videoOnly);

      // Start voice chat without injecting our own MediaStream.
      await startVoiceChat({});
    } catch (error) {
      console.error("Failed to start voice chat:", error);
    }
  });

  const stopVoiceChatVoid = useMemoizedFn(() => {
    stopVoiceChat();
    if (userVideoStream) {
      userVideoStream.getTracks().forEach((track) => track.stop());
      setUserVideoStream(null);
    }
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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (dock !== "floating") return;
      const el = panelRef.current;
      if (!el) return;
      dragState.current.dragging = true;
      const rect = el.getBoundingClientRect();
      dragState.current.offsetX = e.clientX - rect.left;
      dragState.current.offsetY = e.clientY - rect.top;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [dock],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState.current.dragging || dock !== "floating") return;
      const parent = panelRef.current?.parentElement;

      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      let x = e.clientX - parentRect.left - dragState.current.offsetX;
      let y = e.clientY - parentRect.top - dragState.current.offsetY;
      // clamp within parent
      const el = panelRef.current;
      const width = el?.offsetWidth ?? 0;
      const height = el?.offsetHeight ?? 0;
      x = Math.max(0, Math.min(x, parentRect.width - width));
      y = Math.max(0, Math.min(y, parentRect.height - height));
      setFloatingPos({ x, y });
    },
    [dock],
  );

  const handlePointerUp = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // When in floating mode, snap the chat panel to bottom-right by default
  useEffect(() => {
    if (dock !== "floating") return;
    const parent = panelRef.current?.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const width = expanded ? 520 : 340;
    const height = expanded ? 520 : 340;
    const x = Math.max(0, parentRect.width - width - 24);
    const y = Math.max(0, parentRect.height - height - 24);
    setFloatingPos({ x, y });
  }, [dock, expanded]);

  const chatPanel = (
    <div
      className={cn(
        "bg-gray-800/95 text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col h-full w-full",
        dock === "bottom" && "flex flex-col gap-3 relative w-full items-center",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-700 bg-gray-900/80",
          dock === "floating" && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={handlePointerDown}
      >
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <MoveIcon className="h-4 w-4" />
          <span>Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            title="Dock bottom"
            onClick={() => setDock("bottom")}
          >
            <PanelBottomOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Dock right"
            onClick={() => setDock("right")}
          >
            <PanelRightOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Float"
            onClick={() => setDock("floating")}
          >
            <MoveIcon className="h-4 w-4" />
          </Button>
          {dock === "floating" && (
            <Button
              size="icon"
              variant="ghost"
              title={expanded ? "Collapse" : "Expand"}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <Minimize2Icon className="h-4 w-4" />
              ) : (
                <Maximize2Icon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col",
          // Let inner containers manage their own scrolling (StickToBottom)
          "min-h-0",
        )}
      >
        {isConnected ? (
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Waiting to start session...</p>
          </div>
        )}
      </div>
    </div>
  );

  const avatarVideoPanel = (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <AvatarVideo ref={mediaStream} />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <ConnectionIndicator sessionState={sessionState} />
      </div>
      {userVideoStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-700">
          <UserVideo userVideoStream={userVideoStream} />
        </div>
      )}
      <AvatarControls stopSession={stopSession} />
    </div>
  );

  if (dock === "floating") {
    return (
      <div className="w-full h-full">
        {avatarVideoPanel}
        <div
          ref={panelRef}
          className="pointer-events-auto z-20 absolute"
          style={{
            left: floatingPos.x,
            top: floatingPos.y,
            width: expanded ? 520 : 360,
            height: expanded ? 520 : 340,
          }}
        >
          {chatPanel}
        </div>
      </div>
    );
  }

  // Ensure defaultSize is not below minSize for the active dock orientation
  const isRight = dock === "right";
  const chatMinSize = isRight ? 20 : 10; // 20% min when right, 10% when bottom
  const chatDefaultSize = isRight ? 24 : 15; // satisfy min; modest width when right
  const videoDefaultSize = 100 - chatDefaultSize;

  return (
    <ResizablePanelGroup
      className="w-full h-full"
      direction={isRight ? "horizontal" : "vertical"}
    >
      <ResizablePanel defaultSize={videoDefaultSize}>
        {avatarVideoPanel}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={chatDefaultSize}
        maxSize={isRight ? 40 : 50}
        minSize={chatMinSize}
      >
        {chatPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
