import { ClipboardCopyIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import { Message as MessageType, MessageSender } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: MessageType;
  onCopy: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const isAvatar = message.sender === MessageSender.AVATAR;

  return (
    <Message
      key={message.id}
      className={cn(
        "flex gap-2",
        isAvatar ? "items-start" : "items-end flex-row-reverse",
      )}
    >
      <MessageAvatar
        alt={isAvatar ? "Avatar" : "User"}
        fallback={isAvatar ? "A" : "U"}
        src={isAvatar ? "/heygen-logo.png" : ""}
      />
      <div
        className={cn(
          "flex flex-col gap-1",
          isAvatar ? "items-start" : "items-end",
        )}
      >
        <p className="text-xs text-zinc-400">{isAvatar ? "Avatar" : "You"}</p>
        <MessageContent
          markdown
          className={cn("text-sm", isAvatar ? "bg-zinc-700" : "bg-indigo-500")}
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
                <ClipboardCopyIcon className="h-4 w-4" />
              </Button>
            </MessageAction>
          </MessageActions>
        )}
      </div>
    </Message>
  );
};

export const MemoizedChatMessage = React.memo(ChatMessage);
