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
    dot: "bg-yellow-400 animate-pulse",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
  },
  [StreamingAvatarSessionState.CONNECTED]: {
    label: "Connected",
    dot: "bg-green-500",
    bg: "bg-green-500/10",
    text: "text-green-400",
  },
  [StreamingAvatarSessionState.INACTIVE]: {
    label: "Inactive",
    dot: "bg-gray-400",
    bg: "bg-gray-500/10",
    text: "text-gray-300",
  },
  Unknown: {
    label: "Unknown",
    dot: "bg-gray-400",
    bg: "bg-gray-500/10",
    text: "text-gray-300",
  },
};

export function ConnectionIndicator({ sessionState }: Props) {
  const style = stateStyles[sessionState] ?? stateStyles["Unknown"]; // Fallback for any unexpected state

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text} border border-white/10`}
      title={`Session: ${style.label}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </div>
  );
}

export default ConnectionIndicator;
