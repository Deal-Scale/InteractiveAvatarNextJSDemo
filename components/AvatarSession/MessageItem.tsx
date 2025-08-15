import { ClipboardCopy, ThumbsUp, ThumbsDown, Pencil } from "lucide-react";

import { Message as MessageType, MessageSender } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  ResponseStream,
  type Mode as ResponseStreamMode,
} from "@/components/ui/response-stream";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ui/reasoning";

interface MessageItemProps {
  message: MessageType;
  lastCopiedId: string | null;
  voteState: Record<string, "up" | "down" | null>;
  handleCopy: (id: string, content: string) => void;
  setVote: (id: string, dir: "up" | "down") => void;
  handleEditToInput: (content: string, id: string) => void;
  // Optional streaming controls for avatar messages
  streamMode?: ResponseStreamMode; // "typewriter" | "fade"
  streamSpeed?: number; // 1-100
  fadeDuration?: number; // ms
  segmentDelay?: number; // ms
  characterChunkSize?: number; // override speed
  // Optional reasoning panel for avatar messages
  reasoning?: string;
  reasoningMarkdown?: boolean;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  lastCopiedId,
  voteState,
  handleCopy,
  setVote,
  handleEditToInput,
  streamMode = "typewriter",
  streamSpeed = 20,
  fadeDuration,
  segmentDelay,
  characterChunkSize,
  reasoning,
  reasoningMarkdown = true,
  isStreaming,
}) => {
  return (
    <Message
      key={message.id}
      className={`flex gap-2 ${
        message.sender === MessageSender.AVATAR
          ? "items-start"
          : "items-end flex-row-reverse"
      }`}
    >
      <MessageAvatar
        alt={message.sender === MessageSender.AVATAR ? "Avatar" : "User"}
        fallback={message.sender === MessageSender.AVATAR ? "A" : "U"}
        src={message.sender === MessageSender.AVATAR ? "/heygen-logo.png" : ""}
      />
      <div
        className={`flex flex-col gap-1 ${
          message.sender === MessageSender.AVATAR ? "items-start" : "items-end"
        }`}
      >
        <p className="text-xs text-zinc-400">
          {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
        </p>
        {message.sender === MessageSender.AVATAR ? (
          <div className="prose break-words whitespace-normal rounded-lg bg-zinc-700 p-2 text-sm text-foreground">
            {reasoning && (
              <div className="mb-2">
                <Reasoning isStreaming={isStreaming}>
                  <ReasoningTrigger className="text-xs text-muted-foreground">
                    Reasoning
                  </ReasoningTrigger>
                  <ReasoningContent
                    contentClassName="mt-1"
                    markdown={reasoningMarkdown}
                  >
                    {reasoning}
                  </ReasoningContent>
                </Reasoning>
              </div>
            )}
            <ResponseStream
              as="div"
              characterChunkSize={characterChunkSize}
              className="whitespace-pre-wrap"
              fadeDuration={fadeDuration}
              mode={streamMode}
              segmentDelay={segmentDelay}
              speed={streamSpeed}
              textStream={message.content}
            />
          </div>
        ) : (
          <MessageContent markdown className="text-sm bg-indigo-500">
            {message.content}
          </MessageContent>
        )}
        <MessageActions>
          {message.sender === MessageSender.AVATAR ? (
            <>
              <MessageAction
                tooltip={
                  lastCopiedId === message.id ? "Copied!" : "Copy message"
                }
              >
                <Button
                  aria-label="Copy message"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopy(message.id, message.content)}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </MessageAction>
              <MessageAction
                tooltip={
                  voteState[message.id] === "up" ? "Upvoted" : "Upvote response"
                }
              >
                <Button
                  aria-label="Upvote response"
                  size="icon"
                  variant={
                    voteState[message.id] === "up" ? "secondary" : "ghost"
                  }
                  onClick={() => setVote(message.id, "up")}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </MessageAction>
              <MessageAction
                tooltip={
                  voteState[message.id] === "down"
                    ? "Downvoted"
                    : "Downvote response"
                }
              >
                <Button
                  aria-label="Downvote response"
                  size="icon"
                  variant={
                    voteState[message.id] === "down" ? "secondary" : "ghost"
                  }
                  onClick={() => setVote(message.id, "down")}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </MessageAction>
            </>
          ) : (
            <>
              <MessageAction
                tooltip={
                  lastCopiedId === message.id ? "Copied!" : "Copy message"
                }
              >
                <Button
                  aria-label="Copy message"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopy(message.id, message.content)}
                >
                  <ClipboardCopy className="h-4 w-4" />
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
            </>
          )}
        </MessageActions>
      </div>
    </Message>
  );
};
