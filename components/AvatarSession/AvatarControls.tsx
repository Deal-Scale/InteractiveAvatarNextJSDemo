import React from "react";
import { Brain, Database, LayoutDashboard, Play } from "lucide-react";

import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";
import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
} from "../logic/context";

import { useSessionStore } from "@/lib/stores/session";

interface AvatarControlsProps {
  stopSession: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({
  stopSession,
}) => {
  const { interrupt } = useInterrupt();
  const { viewTab, setViewTab } = useSessionStore();
  const { sessionState } = useStreamingAvatarContext();

  // Time-based UI opacity ramp when streaming (connected)
  const [uiOpacity, setUiOpacity] = React.useState(0.3);

  React.useEffect(() => {
    const base = 0.3;
    const cap = 0.7; // "reasonable" cap without full focus
    const durationMs = 5000; // ramp over 5s
    const tickMs = 100;

    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      setUiOpacity(base);
      const steps = Math.max(1, Math.floor(durationMs / tickMs));
      const delta = (cap - base) / steps;
      let current = base;
      const id = setInterval(() => {
        current = Math.min(cap, current + delta);
        setUiOpacity(current);
        if (current >= cap) clearInterval(id);
      }, tickMs);

      return () => clearInterval(id);
    } else {
      setUiOpacity(base);
    }
  }, [sessionState]);

  // Provide CSS var for Tailwind arbitrary opacity value
  const rampStyle = { "--ui-opacity": uiOpacity } as React.CSSProperties;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Floating controls in the top-center over the video */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto group">
        {viewTab === "video" && (
          <div
            className={`flex gap-2 items-center justify-center transition-opacity duration-200 ${
              sessionState === StreamingAvatarSessionState.CONNECTED
                ? "opacity-[var(--ui-opacity)] group-hover:opacity-100"
                : "hidden"
            }`}
            style={
              sessionState === StreamingAvatarSessionState.CONNECTED
                ? rampStyle
                : undefined
            }
          >
            <Button
              className="!bg-secondary !text-foreground"
              onClick={interrupt}
            >
              Interrupt
            </Button>
            <Button
              className="!bg-destructive !text-destructive-foreground"
              onClick={stopSession}
            >
              Stop
            </Button>
          </div>
        )}
        {/* Tab switcher */}
        <div
          className={`mt-2 flex items-center justify-center gap-2 bg-popover/60 border border-border rounded-full px-2 py-1 backdrop-blur-sm transition-opacity duration-200 ${
            sessionState === StreamingAvatarSessionState.CONNECTED
              ? "opacity-[var(--ui-opacity)] group-hover:opacity-100"
              : "opacity-100"
          }`}
          style={
            sessionState === StreamingAvatarSessionState.CONNECTED
              ? rampStyle
              : undefined
          }
        >
          {/* Video first */}
          <Button
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
              viewTab === "video"
                ? "!bg-primary !text-primary-foreground"
                : "!bg-muted !text-foreground"
            }`}
            title="Video"
            onClick={() => setViewTab("video")}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
              viewTab === "brain"
                ? "!bg-primary !text-primary-foreground"
                : "!bg-muted !text-foreground"
            }`}
            title="Brain"
            onClick={() => setViewTab("brain")}
          >
            <Brain className="h-4 w-4" />
          </Button>
          <Button
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
              viewTab === "data"
                ? "!bg-primary !text-primary-foreground"
                : "!bg-muted !text-foreground"
            }`}
            title="Data"
            onClick={() => setViewTab("data")}
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
              viewTab === "actions"
                ? "!bg-primary !text-primary-foreground"
                : "!bg-muted !text-foreground"
            }`}
            title="Actions"
            onClick={() => setViewTab("actions")}
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
