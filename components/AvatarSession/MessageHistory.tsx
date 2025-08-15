import React from "react";

import { MessageSender } from "../logic/context";
import { useMessageHistory } from "../logic/useMessageHistory";

import {
  ChatContainerContent,
  ChatContainerRoot,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageContent } from "@/components/ui/message";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();

  return (
    <ChatContainerRoot className="w-[600px] text-white self-center max-h-[150px]">
      <ChatContainerContent>
        {messages.map((message) => (
          <Message
            key={message.id}
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
              className={`text-sm ${
                message.sender === MessageSender.AVATAR
                  ? "bg-zinc-700"
                  : "bg-blue-500"
              }`}
            >
              {message.content}
            </MessageContent>
          </Message>
        ))}
      </ChatContainerContent>
      <ChatContainerScrollAnchor />
    </ChatContainerRoot>
  );
};
