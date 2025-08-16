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
import ConnectionIndicator from "./AvatarSession/ConnectionIndicator";
import { UserVideo } from "./AvatarSession/UserVideo";
import { useMessageHistory } from "./logic/useMessageHistory";
import { StreamingAvatarSessionState } from "./logic/context";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { Button } from "@/components/ui/button";
// Resizable components are not used in the unified layout to avoid remounts
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/ui/loader";
import { Chat } from "./AvatarSession/Chat";

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
  const [isSending, setIsSending] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{
    dragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, offsetX: 0, offsetY: 0 });

  // Docked resize state (percentages of container size)
  const [bottomSize, setBottomSize] = useState<number>(15); // % height of chat when docked bottom
  const [rightSize, setRightSize] = useState<number>(24); // % width of chat when docked right
  const [resizing, setResizing] = useState<null | "bottom" | "right">(null);
  // Minimum bottom overlay size so the grab handle remains accessible
  const MIN_BOTTOM_SIZE_PCT = 8; // percent of container height (~min 80px below)
  // Side (right) chat width constraints
  const MIN_RIGHT_SIZE_PCT = 16; // ensure usable width
  const MAX_RIGHT_SIZE_PCT = 60; // avoid overly large side panel

  // Remember previous sizes when maximizing so we can restore on minimize
  const prevBottomSizeRef = useRef<number | null>(null);
  const prevRightSizeRef = useRef<number | null>(null);

  const isConnected = useMemo(
    () => sessionState === StreamingAvatarSessionState.CONNECTED,
    [sessionState],
  );

  // Simple helpers to format MCP results for chat
  const formatAsCodeBlock = (obj: unknown) => {
    try {
      return "```json\n" + JSON.stringify(obj, null, 2) + "\n```";
    } catch {
      return String(obj);
    }
  };

  const addAvatarMessage = (content: string) =>
    addMessage({ id: nanoid(), content, sender: MessageSender.AVATAR });

  const parseJsonArgs = (maybeJson: string | undefined) => {
    if (!maybeJson) return undefined;
    try {
      return JSON.parse(maybeJson);
    } catch {
      return undefined;
    }
  };

  const handleMcpCommand = async (raw: string) => {
    const parts = raw.trim().split(/\s+/).slice(1); // drop '/mcp'
    const sub = (parts[0] || "").toLowerCase();
    try {
      switch (sub) {
        case "tools": {
          const res = await fetch("/api/mcp/tools");
          const data = await res.json();
          const list = (data?.tools || []).map((t: any) => `• ${t.name}`).join("\n");
          addAvatarMessage(list || "No tools available.");
          break;
        }
        case "prompts": {
          const res = await fetch("/api/mcp/prompts");
          const data = await res.json();
          const list = (data?.prompts || []).map((p: any) => `• ${p.name}`).join("\n");
          addAvatarMessage(list || "No prompts available.");
          break;
        }
        case "resources": {
          const res = await fetch("/api/mcp/resources");
          const data = await res.json();
          const list = (data?.resources || []).map((r: any) => `• ${r.uri}`).join("\n");
          addAvatarMessage(list || "No resources available.");
          break;
        }
        case "tool": {
          const name = parts[1];
          const args = parseJsonArgs(parts.slice(2).join(" "));
          if (!name) {
            addAvatarMessage("Usage: /mcp tool <name> {jsonArgs}");
            break;
          }
          const res = await fetch(`/api/mcp/tool/${encodeURIComponent(name)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ args: args ?? {} }),
          });
          const data = await res.json();
          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "resource": {
          const uri = parts[1];
          if (!uri) {
            addAvatarMessage("Usage: /mcp resource <uri>");
            break;
          }
          const res = await fetch(`/api/mcp/resource`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uri }),
          });
          const data = await res.json();
          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "prompt": {
          const name = parts[1];
          const args = parseJsonArgs(parts.slice(2).join(" "));
          if (!name) {
            addAvatarMessage("Usage: /mcp prompt <name> {jsonArgs}");
            break;
          }
          const res = await fetch(`/api/mcp/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, args: args ?? {} }),
          });
          const data = await res.json();
          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        case "complete": {
          const payload = parseJsonArgs(parts.slice(1).join(" "));
          if (!payload) {
            addAvatarMessage(
              "Usage: /mcp complete {\"ref\":{...},\"argument\":{...},\"context\":{...}}",
            );
            break;
          }
          const res = await fetch(`/api/mcp/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          addAvatarMessage(formatAsCodeBlock(data));
          break;
        }
        default: {
          addAvatarMessage(
            [
              "MCP commands:",
              "• /mcp tools",
              "• /mcp prompts",
              "• /mcp resources",
              "• /mcp tool <name> {jsonArgs}",
              "• /mcp resource <uri>",
              "• /mcp prompt <name> {jsonArgs}",
              "• /mcp complete {json}",
            ].join("\n"),
          );
        }
      }
    } catch (err) {
      console.error("[Chat] MCP command error", err);
      addAvatarMessage("MCP error: " + (err as Error)?.message);
    }
  };

  const handleSendMessage = useMemoizedFn(async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const startTs = performance.now();
    console.debug("[Chat] send(start)", {
      text: text.slice(0, 200),
      length: text.length,
    });

    setIsSending(true);
    addMessage({
      id: nanoid(),
      content: text,
      sender: MessageSender.CLIENT,
    });
    try {
      if (apiService) {
        // If user typed an MCP command, route to MCP API and do not send to avatar
        if (text.trim().toLowerCase().startsWith("/mcp")) {
          await handleMcpCommand(text);
        } else {
          await apiService.textChat.sendMessageSync(text);
        }
      } else {
        console.warn("[Chat] send(no apiService)");
      }
      const dur = Math.round(performance.now() - startTs);
      console.debug("[Chat] send(success)", { durationMs: dur });
    } catch (err) {
      const dur = Math.round(performance.now() - startTs);
      console.error("[Chat] send(error)", { durationMs: dur, error: err });
    }
    resetHistory();
    setChatInput("");
    setIsSending(false);
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

  // Handle docked resize pointer events
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!resizing) return;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (resizing === "bottom") {
        // chat height percent from bottom edge
        const chatPct = ((rect.bottom - e.clientY) / rect.height) * 100;
        // Clamp to keep overlay resizable and visible, allow up to full height (100%)
        setBottomSize(Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, chatPct)));
      } else if (resizing === "right") {
        // chat width percent from right edge
        const chatPct = ((rect.right - e.clientX) / rect.width) * 100;
        setRightSize(
          Math.max(MIN_RIGHT_SIZE_PCT, Math.min(MAX_RIGHT_SIZE_PCT, chatPct)),
        );
      }
    };
    const onUp = () => setResizing(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing]);

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

  // Toggle expand/minimize for current dock mode
  const toggleExpand = useCallback(() => {
    if (dock === "floating") {
      setExpanded((e) => !e);
      return;
    }
    if (dock === "bottom") {
      if (!expanded) {
        prevBottomSizeRef.current = bottomSize;
        setBottomSize(100);
        setExpanded(true);
      } else {
        const restore = prevBottomSizeRef.current ?? 15;
        setBottomSize(Math.max(MIN_BOTTOM_SIZE_PCT, Math.min(100, restore)));
        setExpanded(false);
      }
      return;
    }
    if (dock === "right") {
      if (!expanded) {
        prevRightSizeRef.current = rightSize;
        setRightSize(100); // overlay will cap via maxWidth
        setExpanded(true);
      } else {
        const restore = prevRightSizeRef.current ?? 24;
        setRightSize(Math.max(MIN_RIGHT_SIZE_PCT, Math.min(100, restore)));
        setExpanded(false);
      }
    }
  }, [dock, expanded, bottomSize, rightSize]);

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
          {dock !== "bottom" && (
            <Button
              size="icon"
              title="Dock bottom"
              variant="ghost"
              onClick={() => setDock("bottom")}
            >
              <PanelBottomOpenIcon className="h-4 w-4" />
            </Button>
          )}
          {dock !== "right" && (
            <Button
              size="icon"
              title="Dock right"
              variant="ghost"
              onClick={() => setDock("right")}
            >
              <PanelRightOpenIcon className="h-4 w-4" />
            </Button>
          )}
          {dock !== "floating" && (
            <Button
              size="icon"
              title="Float"
              variant="ghost"
              onClick={() => setDock("floating")}
            >
              <MoveIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            title={expanded ? "Collapse" : "Expand"}
            variant="ghost"
            onClick={toggleExpand}
          >
            {expanded ? (
              <Minimize2Icon className="h-4 w-4" />
            ) : (
              <Maximize2Icon className="h-4 w-4" />
            )}
          </Button>
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
            chatInput={chatInput}
            isSending={isSending}
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
          <div className="flex flex-1 items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-white">
              <Loader variant="classic" size="lg" />
              <p className="text-sm text-zinc-300">
                {sessionState === StreamingAvatarSessionState.CONNECTING
                  ? "Connecting to avatar session..."
                  : "Waiting to start session..."}
              </p>
            </div>
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
            role="separator"
            aria-orientation="vertical"
            className="w-1 h-full cursor-col-resize bg-zinc-700/60 hover:bg-zinc-600 transition-colors absolute left-0 top-0"
            onPointerDown={() => setResizing("right")}
          />
          <div className="overflow-hidden h-full pl-[4px]">
            {chatPanel}
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
            role="separator"
            aria-orientation="horizontal"
            className="h-1 cursor-row-resize bg-zinc-700/60 hover:bg-zinc-600 transition-colors"
            onPointerDown={() => setResizing("bottom")}
          />
          <div className="overflow-hidden h-[calc(100%-4px)]">
            {chatPanel}
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
            width: expanded ? 520 : 360,
            height: expanded ? 520 : 340,
          }}
        >
          {chatPanel}
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
