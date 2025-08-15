import { useKeyPress } from "ahooks";
import { ClipboardCopy, MicIcon, MicOffIcon, SendIcon } from "lucide-react";
import React, { useEffect } from "react";
 
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
                {message.sender === MessageSender.AVATAR && (
                  <MessageActions>
                    <MessageAction tooltip="Copy message">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onCopy(message.content)}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                    </MessageAction>
                  </MessageActions>
                )}
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
        value={chatInput}
        onValueChange={onChatInputChange}
        onSubmit={() => onSendMessage(chatInput)}
      >
        <div className="flex items-end gap-2">
          <PromptInputTextarea
            className="flex-grow"
            disabled={isVoiceChatActive}
            placeholder="Type a message..."
          />
          <PromptInputActions>
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
            <PromptInputAction tooltip="Send message">
              <Button
                size="icon"
                type="button"
                aria-label="Send message"
                disabled={isVoiceChatActive}
                onClick={() => {
                  const text = (chatInput ?? "").trim();
                  if (text) onSendMessage(text);
                }}
              >
                <SendIcon />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  );
};
