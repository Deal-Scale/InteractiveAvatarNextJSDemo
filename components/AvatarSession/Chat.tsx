import React, { useCallback, useEffect, useState } from "react";
import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import { usePrevious, useKeyPress } from "ahooks";
import { Mic, MicOff, SendIcon } from "lucide-react";

import { MessageSender } from "../logic/context";
import { useConversationState } from "../logic/useConversationState";
import { useMessageHistory } from "../logic/useMessageHistory";
import { useTextChat } from "../logic/useTextChat";
import { useVoiceChat } from "../logic/useVoiceChat";

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
  const {
    startVoiceChat,
    stopVoiceChat,
    isVoiceChatActive,
    isMuted,
    muteInputAudio,
    unmuteInputAudio,
  } = useVoiceChat();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSend = useCallback(() => {
    if (input.trim() === "") {
      return;
    }
    setHistoryIndex(-1);
    if (taskType === TaskType.TALK) {
      if (taskMode === TaskMode.SYNC) {
        sendMessageSync(input);
      } else {
        sendMessage(input);
      }
    } else {
      if (taskMode === TaskMode.SYNC) {
        repeatMessageSync(input);
      } else {
        repeatMessage(input);
      }
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

  const handleToggleVoiceChat = useCallback(() => {
    if (isVoiceChatActive) {
      if (isMuted) {
        unmuteInputAudio();
      } else {
        muteInputAudio();
      }
    } else {
      startVoiceChat();
    }
  }, [
    isVoiceChatActive,
    isMuted,
    startVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
  ]);

  const handleStopVoiceChat = useCallback(() => {
    stopVoiceChat();
  }, [stopVoiceChat]);

  useEffect(() => {
    if (!previousInput && input) {
      startListening();
    } else if (previousInput && !input) {
      stopListening();
    }
  }, [input, previousInput, startListening, stopListening]);

  useKeyPress("ArrowUp", () => {
    const userMessages = messages.filter(
      (m) => m.sender === MessageSender.CLIENT
    );

    if (userMessages.length > 0) {
      const newIndex = Math.min(historyIndex + 1, userMessages.length - 1);

      setHistoryIndex(newIndex);
      setInput(userMessages[userMessages.length - 1 - newIndex].content);
    }
  });

  useKeyPress("ArrowDown", () => {
    const userMessages = messages.filter(
      (m) => m.sender === MessageSender.CLIENT
    );

    if (historyIndex > 0) {
      const newIndex = Math.max(historyIndex - 1, 0);

      setHistoryIndex(newIndex);
      setInput(userMessages[userMessages.length - 1 - newIndex].content);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setInput("");
    }
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
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
        onSubmit={handleSend}
        onValueChange={setInput}
      >
        <div className="flex items-end gap-2">
          <Button size="icon" variant="outline" onClick={handleToggleVoiceChat}>
            <Mic />
          </Button>
          <PromptInputTextarea
            className="flex-grow"
            disabled={isVoiceChatActive}
            placeholder={
              isVoiceChatActive
                ? isMuted
                  ? "Voice chat is muted"
                  : "Voice chat is active..."
                : `Type something for the avatar to ${
                  taskType === TaskType.REPEAT ? "repeat" : "respond"
                }...`
            }
          />
          <PromptInputActions>
            <Select
              disabled={isVoiceChatActive}
              value={taskType}
              onValueChange={(value: string) =>
                setTaskType(value as TaskType)
              }
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
              disabled={isVoiceChatActive}
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
            {isVoiceChatActive ? (
              <Button size="icon" variant="destructive" onClick={handleStopVoiceChat}>
                <MicOff />
              </Button>
            ) : (
              <Button size="icon" type="submit" onClick={handleSend}>
                <SendIcon />
              </Button>
            )}
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  );
};
