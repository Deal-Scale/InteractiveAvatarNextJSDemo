import { useKeyPress } from "ahooks";
import {
  ClipboardCopy,
  MicIcon,
  MicOffIcon,
  SendIcon,
  Paperclip,
  X,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  Check,
  XCircle,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
 
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";
import { Message as MessageType, MessageSender } from "@/lib/types";

interface ChatProps {
  chatInput: string;
  isVoiceChatActive: boolean;
  messages: MessageType[];
  onArrowDown: () => void;
  onArrowUp: () => void;
  onChatInputChange: (value: string) => void;
  onCopy: (text: string) => void;
  onSendMessage: (text: string) => void;
  _onStartListening: () => void;
  onStartVoiceChat: () => void;
  _onStopListening: () => void;
  onStopVoiceChat: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  chatInput,
  isVoiceChatActive,
  messages,
  onArrowDown,
  onArrowUp,
  onChatInputChange,
  onCopy,
  onSendMessage,
  // _onStartListening,
  onStartVoiceChat,
  // _onStopListening,
  onStopVoiceChat,
}) => {
  useKeyPress("ArrowUp", onArrowUp);
  useKeyPress("ArrowDown", onArrowDown);

  // Local UI state for attachments and suggestions
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handlePickFiles = () => fileInputRef.current?.click();
  const handleFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setAttachments((prev) => [...prev, ...files]);
    // reset value so the same file can be picked again later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  const formatAttachmentSummary = (files: File[]) =>
    files
      .map((f) => `${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`) // coarse size in KB
      .join(", ");

  const sendWithAttachments = (text: string) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed && attachments.length === 0) return;
    const suffix = attachments.length
      ? `\n\n[Attachments: ${formatAttachmentSummary(attachments)}]`
      : "";
    onSendMessage(`${trimmed}${suffix}`);
    setAttachments([]);
    onChatInputChange("");
  };

  // Per-message action state
  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [voteState, setVoteState] = useState<Record<string, "up" | "down" | null>>({});

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
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
    } catch (e) {
      console.error("[Chat] copy failed", e);
    }
  };

  const setVote = (id: string, dir: "up" | "down") => {
    setVoteState((prev) => {
      const current = prev[id] ?? null;
      const next = current === dir ? null : dir;
      console.debug("[Chat] vote", { id, direction: next });
      return { ...prev, [id]: next };
    });
  };

  const handleEditToInput = (content: string, id: string) => {
    // enter edit mode: backup current input and set editing text
    if (!isEditing) setInputBackup(chatInput);
    setIsEditing(true);
    setEditingMessageId(id);
    onChatInputChange(content);
    // Focus the textarea by targeting aria-label
    const el = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Chat input"]');
    if (el) {
      el.focus();
      // move caret to end
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingMessageId(null);
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
    setEditingMessageId(null);
    onChatInputChange("");
  };

  return (
    <div className="flex flex-col w-full h-full p-4">
      <ChatContainerRoot className="flex-1 min-h-0 text-white">
        <ChatContainerContent>
          {messages.map((message) => (
            <Message
              key={message.id}
              className={`flex gap-2 ${
                message.sender === MessageSender.AVATAR
                  ? "items-start"
                  : "items-end flex-row-reverse"
              }`}
            >
              <MessageAvatar
                alt={
                  message.sender === MessageSender.AVATAR ? "Avatar" : "User"
                }
                fallback={message.sender === MessageSender.AVATAR ? "A" : "U"}
                src={
                  message.sender === MessageSender.AVATAR
                    ? "/heygen-logo.png"
                    : ""
                }
              />
              <div
                className={`flex flex-col gap-1 ${
                  message.sender === MessageSender.AVATAR
                    ? "items-start"
                    : "items-end"
                }`}
              >
                <p className="text-xs text-zinc-400">
                  {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
                </p>
                <MessageContent
                  markdown
                  className={`text-sm ${
                    message.sender === MessageSender.AVATAR
                      ? "bg-zinc-700"
                      : "bg-indigo-500"
                  }`}
                >
                  {message.content}
                </MessageContent>
                <MessageActions>
                  <MessageAction tooltip={lastCopiedId === message.id ? "Copied!" : "Copy message"}>
                    <Button
                      aria-label="Copy message"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopy(message.id, message.content)}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </MessageAction>
                  <MessageAction tooltip={voteState[message.id] === "up" ? "Upvoted" : "Upvote response"}>
                    <Button
                      aria-label="Upvote response"
                      size="icon"
                      variant={voteState[message.id] === "up" ? "secondary" : "ghost"}
                      onClick={() => setVote(message.id, "up")}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                  </MessageAction>
                  <MessageAction tooltip={voteState[message.id] === "down" ? "Downvoted" : "Downvote response"}>
                    <Button
                      aria-label="Downvote response"
                      size="icon"
                      variant={voteState[message.id] === "down" ? "secondary" : "ghost"}
                      onClick={() => setVote(message.id, "down")}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </MessageAction>
                  <MessageAction tooltip="Edit into input">
                    <Button
                      aria-label="Edit into input"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditToInput(message.content, message.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </MessageAction>
                </MessageActions>
              </div>
            </Message>
          ))}
        </ChatContainerContent>
        <ChatContainerScrollAnchor />
        <div className="absolute right-4 bottom-4">
          <ScrollButton className="shadow-sm" />
        </div>
      </ChatContainerRoot>
      <PromptInput
        className="w-full mt-4"
        disabled={isVoiceChatActive}
        value={chatInput}
        onValueChange={onChatInputChange}
        maxHeight={320}
        onSubmit={() => (isEditing ? confirmEdit() : sendWithAttachments(chatInput))}
      >
        <div className="flex items-end gap-2">
          <PromptInputTextarea
            aria-label="Chat input"
            className="flex-grow"
            placeholder="Type a message..."
          />
          <PromptInputActions className="shrink-0">
            {!isEditing ? (
              <>
                <PromptInputAction
                  tooltip={
                    isVoiceChatActive ? "Stop voice chat" : "Start voice chat"
                  }
                >
                  <Button
                    size="icon"
                    variant={isVoiceChatActive ? "destructive" : "default"}
                    onClick={isVoiceChatActive ? onStopVoiceChat : onStartVoiceChat}
                  >
                    {isVoiceChatActive ? (
                      <MicOffIcon className="h-4 w-4" />
                    ) : (
                      <MicIcon className="h-4 w-4" />
                    )}
                  </Button>
                </PromptInputAction>
                <PromptInputAction tooltip="Attach files">
                  <Button
                    aria-label="Attach files"
                    disabled={isVoiceChatActive}
                    onClick={handlePickFiles}
                    size="icon"
                    type="button"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </PromptInputAction>
                <PromptInputAction tooltip="Send message">
                  <Button
                    aria-label="Send message"
                    disabled={isVoiceChatActive}
                    onClick={() => sendWithAttachments(chatInput)}
                    size="icon"
                    type="button"
                  >
                    <SendIcon />
                  </Button>
                </PromptInputAction>
              </>
            ) : (
              <>
                <PromptInputAction tooltip="Confirm edit and send">
                  <Button
                    aria-label="Confirm edit and send"
                    onClick={confirmEdit}
                    size="icon"
                    type="button"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </PromptInputAction>
                <PromptInputAction tooltip="Cancel editing">
                  <Button
                    aria-label="Cancel editing"
                    onClick={cancelEdit}
                    size="icon"
                    type="button"
                    variant="secondary"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </PromptInputAction>
              </>
            )}
          </PromptInputActions>
        </div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          multiple
          onChange={handleFilesSelected}
          aria-hidden
          tabIndex={-1}
        />

        {/* Attachments row */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
            {attachments.map((file, idx) => (
              <div key={`${file.name}-${idx}`} className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1">
                <span className="max-w-[180px] truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => removeAttachment(idx)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Prompt suggestions */}
        <div className="flex flex-wrap gap-2 px-2 pt-2">
          {promptSuggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="bg-muted text-muted-foreground hover:bg-muted/80 border border-border px-2 py-1 rounded-full text-xs"
              onClick={() => onChatInputChange(s)}
              disabled={isVoiceChatActive}
            >
              {s}
            </button>
          ))}
        </div>
      </PromptInput>
    </div>
  );
};
