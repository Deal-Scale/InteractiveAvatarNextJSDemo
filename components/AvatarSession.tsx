import { useRef } from "react";

import { ChatPanel } from "./AvatarSession/ChatPanel";
import { useDockablePanel } from "./AvatarSession/hooks/useDockablePanel";
import { useChatController } from "./AvatarSession/hooks/useChatController";
import { useChatPanelProps } from "./AvatarSession/hooks/useChatPanelProps";
import { useStartMockChat } from "./AvatarSession/hooks/useStartMockChat";
import { AvatarVideoPanel } from "./AvatarSession/AvatarVideoPanel";
import { StreamingAvatarSessionState } from "./logic/context";

import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

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
    bottomSize,
    rightSize,
    setDock,
    setBottomSize,
    setRightSize,
    toggleExpand,
    setResizing,
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
      stopSession={stopSession}
      userVideoStream={userVideoStream}
    />
  );

  // Unified, stable render tree to avoid video remounts
  const isRight = dock === "right";
  const isFloating = dock === "floating";

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full h-full",
        !isFloating && (isRight ? "flex flex-row" : "flex flex-col"),
      )}
    >
      {/* Video panel stays mounted */}
      <div
        className={cn(
          "relative bg-black overflow-hidden",
          !isFloating && (isRight ? "flex-1" : "flex-1"),
          isFloating && "w-full h-full",
        )}
        style={!isFloating ? undefined : {}}
      >
        {avatarVideoPanel}
      </div>

      {/* Right dock as overlay (does not affect video size) */}
      {!isFloating && isRight && rightSize > 0 && (
        <div
          className="pointer-events-auto z-30 absolute top-0 bottom-0 right-0"
          style={{ width: `${rightSize}%`, minWidth: 280, maxWidth: "95vw" }}
        >
          {/* Left-edge resize handle inside overlay */}
          <div
            aria-orientation="vertical"
            className="w-1 h-full cursor-col-resize bg-zinc-700/60 hover:bg-zinc-600 transition-colors absolute left-0 top-0"
            role="separator"
            onPointerDown={() => setResizing("right")}
          />
          <div className="overflow-hidden h-full pl-[4px]">
            <ChatPanel dock={dock} expanded={expanded} {...chatPanelProps} />
          </div>
        </div>
      )}

      {/* Bottom dock as overlay (does not affect video size) */}
      {!isFloating && !isRight && bottomSize > 0 && (
        <div
          className="pointer-events-auto z-30 absolute left-0 right-0"
          style={{ bottom: 0, height: `${bottomSize}%`, minHeight: 80 }}
        >
          {/* Top-edge resize handle inside overlay */}
          <div
            aria-orientation="horizontal"
            className="h-1 cursor-row-resize bg-zinc-700/60 hover:bg-zinc-600 transition-colors"
            role="separator"
            onPointerDown={() => setResizing("bottom")}
          />
          <div className="overflow-hidden h-[calc(100%-4px)]">
            <ChatPanel
              canChat={canChat}
              chatInput={chatInput}
              dock={dock}
              expanded={expanded}
              isChatSolidBg={isChatSolidBg}
              isSending={isSending}
              isVoiceActive={isVoiceChatActive || mockVoiceActive}
              messages={messages}
              sessionState={sessionState}
              onArrowDown={handleArrowDown}
              onArrowUp={handleArrowUp}
              onChatInputChange={setChatInput}
              onCopy={handleCopy}
              onDock={setDock}
              onHeaderPointerDown={handlePointerDown}
              onSendMessage={sendMessageVoid}
              onStartMockChat={startMockChat}
              onStartVoiceChat={startVoiceChatVoid}
              onStopVoiceChat={stopVoiceChatVoid}
              onToggleExpand={toggleExpand}
            />
          </div>
        </div>
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
            className="absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize rounded-md border-2 border-zinc-300/90 bg-zinc-700/60 shadow-sm hover:bg-zinc-600/70 hover:border-white/90"
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

      {/* Reopen tabs when docked chat is collapsed to 0% */}
      {!isFloating && !isRight && bottomSize === 0 && (
        <button
          className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-white shadow"
          onClick={() => setBottomSize(15)}
        >
          Open chat
        </button>
      )}
      {!isFloating && isRight && rightSize === 0 && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 mr-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-white shadow"
          onClick={() => setRightSize(24)}
        >
          Open chat
        </button>
      )}
    </div>
  );
}
