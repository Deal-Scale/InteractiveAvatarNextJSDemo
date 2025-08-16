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
import { Message } from "@/lib/types";

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
  onSendMessage: (text: string) => void;
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
  return (
    <div
      className={cn(
        isChatSolidBg ? "bg-gray-800" : "bg-gray-800/95",
        "text-white rounded-lg shadow-lg border border-gray-700 overflow-hidden flex flex-col h-full w-full",
        dock === "bottom" && "flex flex-col gap-3 relative w-full items-center",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-700",
          isChatSolidBg ? "bg-gray-900" : "bg-gray-900/80",
          dock === "floating" && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={onHeaderPointerDown}
      >
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <MoveIcon className="h-4 w-4" />
          <span>Chat</span>
        </div>
        <div className="flex items-center gap-1">
          {dock !== "bottom" && (
            <Button
              size="icon"
              title="Dock bottom"
              variant="ghost"
              onClick={() => onDock("bottom")}
            >
              <PanelBottomOpenIcon className="h-4 w-4" />
            </Button>
          )}
          {dock !== "right" && (
            <Button
              size="icon"
              title="Dock right"
              variant="ghost"
              onClick={() => onDock("right")}
            >
              <PanelRightOpenIcon className="h-4 w-4" />
            </Button>
          )}
          {dock !== "floating" && (
            <Button
              size="icon"
              title="Float"
              variant="ghost"
              onClick={() => onDock("floating")}
            >
              <MoveIcon className="h-4 w-4" />
            </Button>
          )}
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
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader variant="classic" size="lg" />
              <p className="text-sm text-zinc-300">
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
