import {
  Maximize2Icon,
  Minimize2Icon,
  MoveIcon,
  PanelBottomOpenIcon,
  PanelRightOpenIcon,
} from "lucide-react";

import { StreamingAvatarSessionState } from "../logic/context";

import { Chat } from "./Chat";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { BottomTab } from "@/components/ui/bottom-tab";
import { RightTab } from "@/components/ui/right-tab";
import { Message, type MessageAsset } from "@/lib/types";

export type DockMode = "right" | "bottom" | "floating";

interface ChatPanelProps {
  dock: DockMode;
  expanded: boolean;
  isChatSolidBg: boolean;
  canChat: boolean;
  messages: Message[];
  isSending: boolean;
  chatInput: string;
  isVoiceActive: boolean;
  // handlers
  onHeaderPointerDown: (e: React.PointerEvent) => void;
  onDock: (mode: DockMode) => void;
  onToggleExpand: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  onChatInputChange: (v: string) => void;
  onCopy: (text: string) => void;
  onSendMessage: (text: string, assets?: MessageAsset[]) => void;
  onStartVoiceChat: () => void | Promise<void>;
  onStopVoiceChat: () => void | Promise<void>;
  sessionState: StreamingAvatarSessionState;
  onStartMockChat: () => void;
}

export function ChatPanel({
  dock,
  expanded,
  isChatSolidBg,
  canChat,
  messages,
  isSending,
  chatInput,
  isVoiceActive,
  onHeaderPointerDown,
  onDock,
  onToggleExpand,
  onArrowUp,
  onArrowDown,
  onChatInputChange,
  onCopy,
  onSendMessage,
  onStartVoiceChat,
  onStopVoiceChat,
  sessionState,
  onStartMockChat,
}: ChatPanelProps) {
  // Bottom dock uses the global BottomTab to manage expand/minimize/drag and persistence.
  if (dock === "bottom") {
    return (
      <BottomTab
        actions={
          <>
            <Button
              size="icon"
              title="Dock right"
              variant="ghost"
              onClick={() => onDock("right")}
            >
              <PanelRightOpenIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              title="Float"
              variant="ghost"
              onClick={() => onDock("floating")}
            >
              <MoveIcon className="h-4 w-4" />
            </Button>
          </>
        }
        label="Chat"
      >
        <div className={cn("flex h-full w-full flex-col", "min-h-0")}>
          {canChat ? (
            <Chat
              chatInput={chatInput}
              inputOnly={!expanded}
              isSending={isSending}
              isVoiceChatActive={isVoiceActive}
              messages={messages}
              onArrowDown={onArrowDown}
              onArrowUp={onArrowUp}
              onChatInputChange={onChatInputChange}
              onCopy={onCopy}
              onSendMessage={onSendMessage}
              onStartVoiceChat={onStartVoiceChat}
              onStopVoiceChat={onStopVoiceChat}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-foreground">
                <Loader size="lg" variant="classic" />
                <p className="text-sm text-muted-foreground">
                  {sessionState === StreamingAvatarSessionState.CONNECTING
                    ? "Connecting to avatar session..."
                    : "Waiting to start session..."}
                </p>
                <Button size="sm" variant="secondary" onClick={onStartMockChat}>
                  Start chat without session
                </Button>
              </div>
            </div>
          )}
        </div>
      </BottomTab>
    );
  }

  // Right dock uses RightTab to manage expand/minimize/drag and persistence.
  if (dock === "right") {
    return (
      <RightTab
        actions={
          <>
            <Button
              size="icon"
              title="Dock bottom"
              variant="ghost"
              onClick={() => onDock("bottom")}
            >
              <PanelBottomOpenIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              title="Float"
              variant="ghost"
              onClick={() => onDock("floating")}
            >
              <MoveIcon className="h-4 w-4" />
            </Button>
          </>
        }
        label="Chat"
      >
        <div className={cn("flex h-full w-full flex-col", "min-h-0")}>
          {canChat ? (
            <Chat
              chatInput={chatInput}
              inputOnly={!expanded}
              isSending={isSending}
              isVoiceChatActive={isVoiceActive}
              messages={messages}
              onArrowDown={onArrowDown}
              onArrowUp={onArrowUp}
              onChatInputChange={onChatInputChange}
              onCopy={onCopy}
              onSendMessage={onSendMessage}
              onStartVoiceChat={onStartVoiceChat}
              onStopVoiceChat={onStopVoiceChat}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-foreground">
                <Loader size="lg" variant="classic" />
                <p className="text-sm text-muted-foreground">
                  {sessionState === StreamingAvatarSessionState.CONNECTING
                    ? "Connecting to avatar session..."
                    : "Waiting to start session..."}
                </p>
                <Button size="sm" variant="secondary" onClick={onStartMockChat}>
                  Start chat without session
                </Button>
              </div>
            </div>
          )}
        </div>
      </RightTab>
    );
  }

  return (
    <div
      className={cn(
        isChatSolidBg ? "bg-card" : "bg-popover/95",
        // Hide floating chat on mobile; show from sm+
        "hidden sm:flex",
        "text-foreground rounded-lg shadow-lg border border-border overflow-hidden flex flex-col h-full w-full",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 border-b border-border",
          isChatSolidBg ? "bg-card" : "bg-popover/80",
          "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={onHeaderPointerDown}
      >
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MoveIcon className="h-4 w-4" />
          <span>Chat</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Floating mode: offer docking to bottom or right */}
          <Button
            size="icon"
            title="Dock bottom"
            variant="ghost"
            onClick={() => onDock("bottom")}
          >
            <PanelBottomOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            title="Dock right"
            variant="ghost"
            onClick={() => onDock("right")}
          >
            <PanelRightOpenIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            title={expanded ? "Collapse" : "Expand"}
            variant="ghost"
            onClick={onToggleExpand}
          >
            {expanded ? (
              <Minimize2Icon className="h-4 w-4" />
            ) : (
              <Maximize2Icon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col", "min-h-0")}>
        {canChat ? (
          <Chat
            chatInput={chatInput}
            inputOnly={!expanded}
            isSending={isSending}
            isVoiceChatActive={isVoiceActive}
            messages={messages}
            onArrowDown={onArrowDown}
            onArrowUp={onArrowUp}
            onChatInputChange={onChatInputChange}
            onCopy={onCopy}
            onSendMessage={onSendMessage}
            onStartVoiceChat={onStartVoiceChat}
            onStopVoiceChat={onStopVoiceChat}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-foreground">
              <Loader size="lg" variant="classic" />
              <p className="text-sm text-muted-foreground">
                {sessionState === StreamingAvatarSessionState.CONNECTING
                  ? "Connecting to avatar session..."
                  : "Waiting to start session..."}
              </p>
              <Button size="sm" variant="secondary" onClick={onStartMockChat}>
                Start chat without session
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
