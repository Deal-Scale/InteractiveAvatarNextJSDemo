import React from "react";

import { StreamingAvatarSessionState } from "../logic/context";

type Props = {
  sessionState: StreamingAvatarSessionState;
};

const stateStyles: Record<
  StreamingAvatarSessionState | "Unknown",
  { label: string; dot: string; bg: string; text: string }
> = {
  [StreamingAvatarSessionState.CONNECTING]: {
    label: "Connecting",
    dot: "bg-ring animate-pulse",
    bg: "bg-secondary",
    text: "text-foreground",
  },
  [StreamingAvatarSessionState.CONNECTED]: {
    label: "Connected",
    dot: "bg-primary",
    bg: "bg-primary/10",
    text: "text-primary",
  },
  [StreamingAvatarSessionState.INACTIVE]: {
    label: "Inactive",
    dot: "bg-muted-foreground",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
  Unknown: {
    label: "Unknown",
    dot: "bg-muted-foreground",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

export function ConnectionIndicator({ sessionState }: Props) {
  const style = stateStyles[sessionState] ?? stateStyles["Unknown"]; // Fallback for any unexpected state

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text} border border-border`}
      title={`Session: ${style.label}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </div>
  );
}

export default ConnectionIndicator;
