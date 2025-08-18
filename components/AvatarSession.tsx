"use client";

import { useEffect, useRef, useState } from "react";

import { ChatPanel } from "./AvatarSession/ChatPanel";
import { useDockablePanel } from "./AvatarSession/hooks/useDockablePanel";
import { useChatController } from "./AvatarSession/hooks/useChatController";
import { useChatPanelProps } from "./AvatarSession/hooks/useChatPanelProps";
import { useStartMockChat } from "./AvatarSession/hooks/useStartMockChat";
import { AvatarVideoPanel } from "./AvatarSession/AvatarVideoPanel";
import { StreamingAvatarSessionState } from "./logic/context";

import { useSessionStore } from "@/lib/stores/session";
import { usePlacementStore } from "@/lib/stores/placement";
import { cn } from "@/lib/utils";
import { safeWindow } from "@/lib/utils";

//

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { messages } = useSessionStore();

  // Refs for dockable panel root and panel
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // Dock/drag/resize logic encapsulated in a hook
  const {
    dock,
    expanded,
    floatingPos,
    floatingSize,
    setDock,
    setBottomSize,
    toggleExpand,
    startFloatingResize,
    handlePointerDown,
  } = useDockablePanel(rootRef, panelRef);

  const {
    // state
    chatInput,
    setChatInput,
    isSending,
    userVideoStream,
    mockVoiceActive,
    canChat,
    isChatSolidBg,
    isVoiceChatActive,
    // actions
    sendMessageVoid,
    startVoiceChatVoid,
    stopVoiceChatVoid,
    handleCopy,
    handleArrowUp,
    handleArrowDown,
    enableMockChatUi,
  } = useChatController(sessionState);

  // Start mock chat and open UI in bottom expanded mode
  const startMockChat = useStartMockChat({
    dock,
    expanded,
    setDock,
    setBottomSize,
    toggleExpand,
    enableMockChatUi,
  });

  // Open bottom chat expanded without selecting an avatar
  const startWithoutAvatar = () => {
    // Ensure docked at bottom and fully expanded
    setDock("bottom");
    setBottomSize(100);
    if (!expanded) toggleExpand();
  };

  // Auxiliary handlers provided by useChatController

  // (All dock/drag/resize effects moved into useDockablePanel)

  // viewTab no longer used here; handled inside AvatarVideoPanel

  // Build common ChatPanel props once
  const chatPanelProps = useChatPanelProps({
    canChat,
    chatInput,
    isSending,
    isChatSolidBg,
    isVoiceActive: isVoiceChatActive || mockVoiceActive,
    messages,
    sessionState,
    onArrowDown: handleArrowDown,
    onArrowUp: handleArrowUp,
    onChatInputChange: setChatInput,
    onCopy: handleCopy,
    onSendMessage: sendMessageVoid,
    onStartVoiceChat: startVoiceChatVoid,
    onStopVoiceChat: stopVoiceChatVoid,
    onDock: setDock,
    onHeaderPointerDown: handlePointerDown,
    onToggleExpand: toggleExpand,
    onStartMockChat: startMockChat,
  });

  const avatarVideoPanel = (
    <AvatarVideoPanel
      mediaStream={mediaStream}
      sessionState={sessionState}
      stopSession={stopSession}
      userVideoStream={userVideoStream}
      onStartWithoutAvatar={startWithoutAvatar}
    />
  );

  // Unified, stable render tree to avoid video remounts
  const isRight = dock === "right";
  const isFloating = dock === "floating";

  // Right dock: compute current drawer width in px to reserve space so content isn't covered
  const rightWidthFrac = usePlacementStore((s) => s.rightWidthFrac);
  const isRightOpen = isRight && rightWidthFrac > 0.01;
  const rightWidthPx = (() => {
    const w = safeWindow();
    return !w ? 0 : Math.round((rightWidthFrac || 0) * w.innerWidth);
  })();

  // Render a stable placeholder on server and on the client's first render
  // to avoid SSR/CSR mismatch while persisted stores hydrate.
  if (!mounted) {
    return <div ref={rootRef} className={cn("relative w-full h-full")} />;
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "group relative w-full h-full",
        !isFloating && (isRight ? "flex flex-row" : "flex flex-col"),
      )}
      style={!isFloating && isRightOpen ? { paddingRight: rightWidthPx } : undefined}
    >
      {/* Video panel stays mounted */}
      <div
        className={cn(
          "relative bg-background overflow-hidden",
          !isFloating && (isRight ? "flex-1" : "flex-1"),
          isFloating && "w-full h-full",
        )}
        style={!isFloating ? undefined : {}}
      >
        {avatarVideoPanel}
      </div>

      {/* Let RightTab/BottomTab render their own fixed drawers via ChatPanel */}
      {!isFloating && (
        <ChatPanel dock={dock} expanded={expanded} {...chatPanelProps} />
      )}

      {/* Floating chat overlay */}
      {isFloating && (
        <div
          ref={panelRef}
          className="pointer-events-auto z-30 absolute"
          style={{
            left: floatingPos.x,
            top: floatingPos.y,
            width: expanded ? 520 : floatingSize.w,
            height: expanded ? 520 : floatingSize.h,
          }}
        >
          <ChatPanel dock={dock} expanded={expanded} {...chatPanelProps} />
          {/* Resize handle (bottom-right corner) - more noticeable */}
          <div
            className="absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize rounded-md border-2 border-border bg-muted-foreground/40 shadow-sm hover:bg-muted-foreground/60 hover:border-foreground/90"
            role="presentation"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.9) 0 2px, transparent 2px 6px)",
              backgroundClip: "padding-box",
            }}
            onPointerDown={startFloatingResize}
          />
        </div>
      )}

      {/* Reopen tabs handled inside BottomTab/RightTab components */}
    </div>
  );
}
