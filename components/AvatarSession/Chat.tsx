"use client";

import { useKeyPress } from "ahooks";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { ChatInput } from "./ChatInput";
import { MessageItem } from "./MessageItem";
import { formatAttachmentSummary } from "./utils";
import { useComposerStore } from "@/lib/stores/composer";

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
import { Message as MessageType, MessageSender, MessageAsset } from "@/lib/types";
import { StickToBottom } from "use-stick-to-bottom";

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
  onSendMessage: (text: string, assets?: MessageAsset[]) => void;
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
  const composerAttachments = useComposerStore((s) => s.assetAttachments);
  const clearComposerAttachments = useComposerStore((s) => s.clearAssetAttachments);
  const removeComposerAttachment = useComposerStore((s) => s.removeAssetAttachment);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const promptSuggestions = useMemo(
    () => [
      "What can you do?",
      "Summarize the last reply",
      "Explain step by step",
      "Give me an example",
    ],
    [],
  );

  // Adjacent de-duplication by id + content to avoid rendering repeated messages
  const dedupedMessages = useMemo(() => {
    const out: MessageType[] = [];
    let prevKey: string | null = null;
    for (const m of messages) {
      const key = `${m.id}|${m.content}`;
      if (key !== prevKey) {
        out.push(m);
      }
      prevKey = key;
    }
    if (out.length !== messages.length) {
      console.debug("[Chat] deduped messages", {
        before: messages.length,
        after: out.length,
      });
    }
    return out;
  }, [messages]);

  const onFilesAdded = (files: File[]) => {
    if (files.length) {
      console.debug("[Chat] onFilesAdded", { count: files.length, names: files.map((f) => f.name) });
      setAttachments((prev) => [...prev, ...files]);
    }
  };

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const sendWithAttachments = (text: string) => {
    console.debug("[Chat] sendWithAttachments invoked", {
      textLength: (text ?? "").length,
      hasFiles: attachments.length > 0,
      fileCount: attachments.length,
      composerCount: composerAttachments.length,
    });
    const trimmed = (text ?? "").trim();

    if (!trimmed && attachments.length === 0 && composerAttachments.length === 0) {
      return;
    }

    const parts: string[] = [];
    if (attachments.length) {
      parts.push(formatAttachmentSummary(attachments));
    }
    const suffix = parts.length ? `\n\n[Attachments: ${parts.join(", ")}]` : "";

    // Build structured assets from composer attachments
    const assets: MessageAsset[] | undefined = composerAttachments.length
      ? composerAttachments.map((a) => ({
          id: a.id,
          name: a.name,
          url: a.url,
          thumbnailUrl: a.thumbnailUrl,
          mimeType: a.mimeType,
        }))
      : undefined;

    console.debug("[Chat] built outgoing payload", {
      text: `${trimmed}${suffix}`,
      assets,
    });

    onSendMessage(`${trimmed}${suffix}`, assets);
    console.debug("[Chat] onSendMessage called; clearing attachments");
    setAttachments([]);
    clearComposerAttachments();
    onChatInputChange("");
  };

  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [voteState, setVoteState] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const [isEditing, setIsEditing] = useState(false);
  const [inputBackup, setInputBackup] = useState<string>("");

  // Track ChatInput height to prevent message overlap
  const inputWrapRef = useRef<HTMLDivElement | null>(null);
  const [inputHeight, setInputHeight] = useState<number>(0);

  useEffect(() => {
    const el = inputWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setInputHeight(Math.ceil(h));
      }
    });
    ro.observe(el);
    // Initialize immediately
    setInputHeight(Math.ceil(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, []);

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

    // Defer focus and caret placement until after the DOM updates with new value
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    onChatInputChange(inputBackup);
  };

  const confirmEdit = () => {
    const text = chatInput ?? "";
    console.debug("[Chat] confirmEdit", { textLength: text.length });
    sendWithAttachments(text);
    setIsEditing(false);
    onChatInputChange("");
    publish({ description: "Edited message sent.", title: "Edited" });
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      {!inputOnly && (
        <StickToBottom className="flex-1 min-h-0 text-foreground">
          {/* Dynamically pad bottom by input height to avoid overlap */}
          <ChatContainerRoot
            className="flex-1 min-h-0 text-foreground"
            style={{ paddingBottom: Math.max(16, inputHeight + 8) }}
          >
            <ChatContainerContent>
              {dedupedMessages.map((message) => (
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
                  <MessageAvatar alt="Avatar" fallback="A" src="/heygen-logo.png" />
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
        </StickToBottom>
      )}
      {/* Ensure input section never shrinks and visually docks under messages */}
      <div
        ref={inputWrapRef}
        className="shrink-0 border-t border-border pt-3 bg-background"
      >
        <ChatInput
          attachments={attachments}
          composerAttachments={composerAttachments}
          cancelEdit={cancelEdit}
          chatInput={chatInput}
          confirmEdit={confirmEdit}
          inputRef={inputRef}
          isEditing={isEditing}
          isSending={isSending}
          isVoiceChatActive={isVoiceChatActive}
          isVoiceChatLoading={isVoiceChatLoading}
          promptSuggestions={promptSuggestions}
          removeAttachment={removeAttachment}
          removeComposerAttachment={removeComposerAttachment}
          sendWithAttachments={sendWithAttachments}
          onChatInputChange={onChatInputChange}
          onFilesAdded={onFilesAdded}
          onStartVoiceChat={onStartVoiceChat}
          onStopVoiceChat={onStopVoiceChat}
        />
      </div>
    </div>
  );
}
