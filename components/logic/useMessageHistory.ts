import { useMemo, useState } from "react";

import { Message, MessageSender } from "@/lib/types";

export const useMessageHistory = (messages: Message[]) => {
  const [historyIndex, setHistoryIndex] = useState(-1);

  const sentMessages = useMemo(
    () => messages.filter((m) => m.sender === MessageSender.CLIENT),
    [messages],
  );

  const navigateHistory = (direction: "up" | "down") => {
    if (sentMessages.length === 0) {
      return null;
    }

    let nextIndex = -1;

    if (direction === "up") {
      nextIndex =
        historyIndex === -1
          ? sentMessages.length - 1
          : Math.max(0, historyIndex - 1);
    } else {
      if (historyIndex === -1) {
        return null; // Can't go down if not in history
      }
      nextIndex = Math.min(sentMessages.length - 1, historyIndex + 1);
    }

    setHistoryIndex(nextIndex);

    return sentMessages[nextIndex]?.content ?? null;
  };

  const resetHistory = () => {
    setHistoryIndex(-1);
  };

  return { navigateHistory, resetHistory };
};
