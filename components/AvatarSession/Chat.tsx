import React, { useCallback, useEffect, useState } from "react";
import { SendIcon, MicIcon, MicOffIcon, ClipboardCopyIcon } from "lucide-react";

import { useMessageHistory } from "../logic/useMessageHistory";
import { usePrevious, useKeyPress } from "ahooks";

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
import { ChatMode } from "@/lib/stores/session";

interface ChatProps {
  chatMode: ChatMode;
  messages: MessageType[];
  sendMessage: (text: string) => void;
  startVoiceChat: () => void;
  stopVoiceChat: () => void;
  isVoiceChatActive: boolean;
  handleCopy: (text: string) => void;
  handleSendMessage: (text: string) => void;
  handleStartListening: () => void;
  handleStopListening: () => void;
  handleArrowUp: () => void;
  handleArrowDown: () => void;
}

export const Chat: React.FC<ChatProps> = ({
  chatMode,
  messages,
  sendMessage,
  startVoiceChat,
  stopVoiceChat,
  isVoiceChatActive,
  handleCopy,
  handleSendMessage,
  handleStartListening,
  handleStopListening,
  handleArrowUp,
  handleArrowDown,
}) => {
  const [inputValue, setInputValue] = useState("");
  useKeyPress("ArrowUp", handleArrowUp);
  useKeyPress("ArrowDown", handleArrowDown);

  return (
    <div className="flex flex-col w-full h-full relative">
      <ChatContainerRoot className="flex-grow text-white max-h-[calc(100%-80px)]">
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
                        onClick={() => handleCopy(message.content)}
                      >
                        <ClipboardCopyIcon className="h-4 w-4" />
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
      {chatMode === "text" && (
        <PromptInput
          className="w-full mt-4"
          value={inputValue}
          onValueChange={setInputValue}
          onSubmit={() => {
            if (inputValue.trim().length === 0) return;
            handleSendMessage(inputValue);
            setInputValue("");
          }}
        >
          <div className="flex items-end gap-2">
            <PromptInputTextarea
              className="flex-grow"
              placeholder="Type a message..."
            />
            <PromptInputActions>
              <PromptInputAction tooltip="Send message">
                <Button size="icon" type="submit">
                  <SendIcon />
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </div>
        </PromptInput>
      )}
      {chatMode === "voice" && (
        <div className="flex items-center justify-center mt-4">
          <Button
            className={isVoiceChatActive ? "bg-red-500" : "bg-green-500"}
            size="icon"
            onClick={() => {
              if (isVoiceChatActive) {
                stopVoiceChat();
              } else {
                startVoiceChat();
              }
            }}
          >
            {isVoiceChatActive ? <MicOffIcon /> : <MicIcon />}
          </Button>
        </div>
      )}
    </div>
  );
};
