import { useKeyPress } from "ahooks";
import { MicIcon, MicOffIcon, SendIcon } from "lucide-react";
import React, { useEffect } from "react";

import { MemoizedChatMessage } from "@/components/AvatarSession/ChatMessage";
import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { ScrollButton } from "@/components/ui/scroll-button";
import { Button } from "@/components/ui/button";
import { Message as MessageType } from "@/lib/types";

interface ChatBodyProps {
  messages: MessageType[];
  onCopy: (text: string) => void;
}

const ChatBody: React.FC<ChatBodyProps> = ({ messages, onCopy }) => {
  // Import hook locally to avoid context usage outside provider
  const { scrollToBottom } =
    require("use-stick-to-bottom").useStickToBottomContext();

  useEffect(() => {
    // Ensure we start scrolled to the bottom
    scrollToBottom({ behavior: "instant" });
  }, [scrollToBottom]);

  return (
    <>
      <ChatContainerContent>
        {messages.map((message) => (
          <MemoizedChatMessage
            key={message.id}
            message={message}
            onCopy={onCopy}
          />
        ))}
      </ChatContainerContent>
      <ChatContainerScrollAnchor />
      <div className="absolute right-4 bottom-4">
        <ScrollButton className="shadow-sm" />
      </div>
    </>
  );
};

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
    <div className="flex flex-col w-full h-full min-h-0">
      <div className="relative flex-1 min-h-0">
        <ChatContainerRoot className="absolute inset-0 text-white">
          <ChatBody messages={messages} onCopy={onCopy} />
        </ChatContainerRoot>
      </div>
      <PromptInput
        className="w-full mt-4 flex-shrink-0"
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
