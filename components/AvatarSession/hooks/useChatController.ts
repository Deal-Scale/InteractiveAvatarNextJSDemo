import { useMemo, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";

import { mockOpenRouter } from "../utils/mock";
import { StreamingAvatarSessionState } from "../../logic/context";

import { useMcpCommands } from "./useMcpCommands";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { useMessageHistory } from "@/components/logic/useMessageHistory";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender } from "@/lib/types";

export function useChatController(sessionState: StreamingAvatarSessionState) {
  const { apiService } = useApiService();
  const { messages, addMessage, isChatSolidBg, setChatSolidBg } =
    useSessionStore();
  const { navigateHistory, resetHistory } = useMessageHistory(messages);
  const { startVoiceChat, stopVoiceChat, isVoiceChatActive } = useVoiceChat();

  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(
    null,
  );

  const isConnected = useMemo(
    () => sessionState === StreamingAvatarSessionState.CONNECTED,
    [sessionState],
  );

  // Mock chat
  const [mockChatEnabled, setMockChatEnabled] = useState(false);
  const [mockVoiceActive, setMockVoiceActive] = useState(false);
  const canChat = isConnected || mockChatEnabled;

  const addAvatarMessage = (content: string) =>
    addMessage({ id: nanoid(), content, sender: MessageSender.AVATAR });

  const handleMcpCommand = useMcpCommands(addAvatarMessage);

  const handleSendMessage = useMemoizedFn(async (text: string) => {
    if (!text.trim()) return;

    // Begin send sequence
    setIsSending(true);
    addMessage({ id: nanoid(), content: text, sender: MessageSender.CLIENT });

    // Choose message handling path
    try {
      if (mockChatEnabled) {
        const reply = await mockOpenRouter(text);

        addAvatarMessage(reply);
      } else if (apiService) {
        if (text.trim().toLowerCase().startsWith("/mcp")) {
          await handleMcpCommand(text);
        } else {
          await apiService.textChat.sendMessageSync(text);
        }
      }
    } finally {
      resetHistory();
      setChatInput("");
      setIsSending(false);
    }
  });

  const sendMessageVoid = useMemoizedFn((t: string) => {
    void handleSendMessage(t);
  });

  const startVoiceChatVoid = useMemoizedFn(async () => {
    try {
      if (mockChatEnabled) {
        setMockVoiceActive(true);
        addAvatarMessage("(mock) Voice chat started via VAPI.");

        return;
      }

      // Capture only local webcam video for PIP. Do NOT include audio here.
      const videoOnly = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      setUserVideoStream(videoOnly);

      // Start voice chat without injecting our own MediaStream.
      await startVoiceChat({});
    } catch (error) {
      // Surface in devtools; consider toast in UI
      console.error("Failed to start voice chat:", error);
    }
  });

  const stopVoiceChatVoid = useMemoizedFn(() => {
    if (mockChatEnabled) {
      setMockVoiceActive(false);
      addAvatarMessage("(mock) Voice chat stopped.");

      return;
    }
    stopVoiceChat();

    if (userVideoStream) {
      userVideoStream.getTracks().forEach((t) => t.stop());
      setUserVideoStream(null);
    }
  });

  const handleCopy = useMemoizedFn(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error("Copy failed", e);
    }
  });

  const handleArrowUp = useMemoizedFn(() => {
    const prev = navigateHistory("up");

    if (prev) setChatInput(prev);
  });

  const handleArrowDown = useMemoizedFn(() => {
    const next = navigateHistory("down");

    if (next) setChatInput(next);
  });

  const enableMockChatUi = useMemoizedFn(() => {
    setMockChatEnabled(true);
    setChatSolidBg(true);
  });

  return {
    // state
    chatInput,
    setChatInput,
    isSending,
    userVideoStream,
    mockChatEnabled,
    setMockChatEnabled,
    mockVoiceActive,
    setMockVoiceActive,
    canChat,
    isChatSolidBg,
    setChatSolidBg,
    isVoiceChatActive,

    // actions
    sendMessageVoid,
    startVoiceChatVoid,
    stopVoiceChatVoid,
    handleCopy,
    handleArrowUp,
    handleArrowDown,
    addAvatarMessage,
    enableMockChatUi,
  };
}
