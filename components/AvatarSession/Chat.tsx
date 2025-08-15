import React, { useCallback, useEffect, useState } from "react";
import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import { usePrevious } from "ahooks";
import { SendIcon } from "lucide-react";

import { MessageSender } from "../logic/context";
import { useConversationState } from "../logic/useConversationState";
import { useMessageHistory } from "../logic/useMessageHistory";
import { useTextChat } from "../logic/useTextChat";

import { Button } from "@/components/ui/button";
import {
  ChatContainerRoot as ChatContainer,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageContent } from "@/components/ui/message";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Chat: React.FC = () => {
  const { messages } = useMessageHistory();
  const { sendMessage, sendMessageSync, repeatMessage, repeatMessageSync } =
    useTextChat();
  const { startListening, stopListening } = useConversationState();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (input.trim() === "") {
      return;
    }
    if (taskType === TaskType.TALK) {
      taskMode === TaskMode.SYNC
        ? sendMessageSync(input)
        : sendMessage(input);
    } else {
      taskMode === TaskMode.SYNC
        ? repeatMessageSync(input)
        : repeatMessage(input);
    }
    setInput("");
  }, [
    taskType,
    taskMode,
    input,
    sendMessage,
    sendMessageSync,
    repeatMessage,
    repeatMessageSync,
  ]);

  const previousInput = usePrevious(input);

  useEffect(() => {
    if (!previousInput && input) {
      startListening();
    } else if (previousInput && !input) {
      stopListening();
    }
  }, [input, previousInput, startListening, stopListening]);

  return (
    <div className="flex flex-col gap-4 w-[600px] self-center">
      <ChatContainer className="text-white max-h-[150px]">
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
      </ChatContainer>
      <PromptInput
        className="w-full"
        value={input}
        onValueChange={setInput}
        onSubmit={handleSend}
      >
        <div className="flex items-end gap-2">
          <PromptInputTextarea
            className="flex-grow"
            placeholder={`Type something for the avatar to ${
              taskType === TaskType.REPEAT ? "repeat" : "respond"
            }...`}
          />
          <PromptInputActions>
            <Select
              value={taskType}
              onValueChange={(value: string) => setTaskType(value as TaskType)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Task Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={taskMode}
              onValueChange={(value: string) => setTaskMode(value as TaskMode)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Task Mode" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TaskMode).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSend} size="icon" type="submit">
              <SendIcon />
            </Button>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  );
};
