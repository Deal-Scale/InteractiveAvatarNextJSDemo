import { useKeyPress } from "ahooks";
import React, { useMemo, useState } from "react";

import { ChatInput } from "./ChatInput";
import { MessageItem } from "./MessageItem";
import { formatAttachmentSummary } from "./utils";

import { useStreamingAvatarContext } from "@/components/logic/context";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Loader } from "@/components/ui/loader";
import { Message, MessageAvatar } from "@/components/ui/message";
import { ScrollButton } from "@/components/ui/scroll-button";
import { useToast } from "@/components/ui/toaster";
import { Message as MessageType, MessageSender } from "@/lib/types";

interface ChatProps {
  chatInput: string;
  isSending: boolean;
  isVoiceChatActive: boolean;
  messages: MessageType[];
  // When true, render only the input area (no messages/scroll area)
  inputOnly?: boolean;
  onArrowDown: () => void;
  onArrowUp: () => void;
  onChatInputChange: (value: string) => void;
  onCopy: (text: string) => void;
  onSendMessage: (text: string) => void;
  onStartVoiceChat: () => void;
  onStopVoiceChat: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  chatInput,
  isSending,
  isVoiceChatActive,
  messages,
  inputOnly = false,
  onArrowDown,
  onArrowUp,
  onChatInputChange,
  onCopy,
  onSendMessage,
  onStartVoiceChat,
  onStopVoiceChat,
}) => {
  useKeyPress("ArrowUp", onArrowUp);
  useKeyPress("ArrowDown", onArrowDown);

  const { publish } = useToast();
  const { isAvatarTalking, isVoiceChatLoading } = useStreamingAvatarContext();

  const [attachments, setAttachments] = useState<File[]>([]);
  const promptSuggestions = useMemo(
    () => [
      "What can you do?",
      "Summarize the last reply",
      "Explain step by step",
      "Give me an example",
    ],
    [],
  );

  const onFilesAdded = (files: File[]) => {
    if (files.length) {
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const sendWithAttachments = (text: string) => {
    const trimmed = (text ?? "").trim();

    if (!trimmed && attachments.length === 0) {
      return;
    }

    const suffix = attachments.length
      ? `\n\n[Attachments: ${formatAttachmentSummary(attachments)}]`
      : "";

    onSendMessage(`${trimmed}${suffix}`);
    setAttachments([]);
    onChatInputChange("");
  };

  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [voteState, setVoteState] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const [isEditing, setIsEditing] = useState(false);
  const [inputBackup, setInputBackup] = useState<string>("");

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setLastCopiedId(id);
      setTimeout(() => {
        setLastCopiedId((prev) => (prev === id ? null : prev));
      }, 1500);
      console.debug("[Chat] message copied", { id });
      onCopy(content);
      publish({ description: "Message copied to clipboard.", title: "Copied" });
    } catch (e) {
      console.error("[Chat] copy failed", e);
      publish({
        description: "Could not copy to clipboard.",
        duration: 4000,
        title: "Copy failed",
      });
    }
  };

  const setVote = (id: string, dir: "up" | "down") => {
    setVoteState((prev) => {
      const current = prev[id] ?? null;
      const next = current === dir ? null : dir;

      console.debug("[Chat] vote", { direction: next, id });

      return { ...prev, [id]: next };
    });
  };

  const handleEditToInput = (content: string) => {
    if (!isEditing) {
      setInputBackup(chatInput);
    }

    setIsEditing(true);
    onChatInputChange(content);

    const el = document.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Chat input"]',
    );

    if (el) {
      el.focus();

      const len = el.value.length;

      el.setSelectionRange(len, len);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    onChatInputChange(inputBackup);
  };

  const confirmEdit = () => {
    const text = (chatInput ?? "").trim();

    if (!text) {
      cancelEdit();

      return;
    }

    onSendMessage(text);
    setIsEditing(false);
    onChatInputChange("");
    publish({ description: "Edited message sent.", title: "Edited" });
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      {!inputOnly && (
        <ChatContainerRoot className="flex-1 min-h-0 text-foreground">
          <ChatContainerContent>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                handleCopy={handleCopy}
                handleEditToInput={handleEditToInput}
                isStreaming={
                  isAvatarTalking && message.sender === MessageSender.AVATAR
                }
                lastCopiedId={lastCopiedId}
                message={message}
                setVote={setVote}
                streamMode="typewriter"
                streamSpeed={28}
                voteState={voteState}
              />
            ))}
            {isAvatarTalking && (
              <Message className="flex gap-2 items-start">
                <MessageAvatar
                  alt="Avatar"
                  fallback="A"
                  src="/heygen-logo.png"
                />
                <div className="flex flex-col items-start gap-1">
                  <p className="text-xs text-muted-foreground">Avatar</p>
                  <div className="prose break-words whitespace-normal rounded-lg bg-secondary p-2 text-sm text-foreground">
                    <div className="py-1">
                      <Loader variant="typing" />
                    </div>
                  </div>
                </div>
              </Message>
            )}
          </ChatContainerContent>
          <ChatContainerScrollAnchor />
          <div className="absolute bottom-4 right-4">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      )}
      <ChatInput
        attachments={attachments}
        cancelEdit={cancelEdit}
        chatInput={chatInput}
        confirmEdit={confirmEdit}
        isEditing={isEditing}
        isSending={isSending}
        isVoiceChatActive={isVoiceChatActive}
        isVoiceChatLoading={isVoiceChatLoading}
        promptSuggestions={promptSuggestions}
        removeAttachment={removeAttachment}
        sendWithAttachments={sendWithAttachments}
        onChatInputChange={onChatInputChange}
        onFilesAdded={onFilesAdded}
        onStartVoiceChat={onStartVoiceChat}
        onStopVoiceChat={onStopVoiceChat}
      />
    </div>
  );
};
