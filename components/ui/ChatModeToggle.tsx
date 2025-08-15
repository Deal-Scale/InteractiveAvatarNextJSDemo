import React from "react";

import { Button } from "./button";

interface ChatModeToggleProps {
  chatMode: "voice" | "text";
  onChatModeChange: (mode: "voice" | "text") => void;
}

export function ChatModeToggle({
  chatMode,
  onChatModeChange,
}: ChatModeToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={chatMode === "voice" ? "default" : "outline"}
        onClick={() => onChatModeChange("voice")}
      >
        Voice
      </Button>
      <Button
        variant={chatMode === "text" ? "default" : "outline"}
        onClick={() => onChatModeChange("text")}
      >
        Text
      </Button>
    </div>
  );
}
