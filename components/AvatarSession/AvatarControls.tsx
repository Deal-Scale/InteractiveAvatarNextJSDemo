import React from "react";

import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";
import { useSessionStore } from "@/lib/stores/session";
import { Brain, Database, LayoutDashboard, Play } from "lucide-react";

interface AvatarControlsProps {
  stopSession: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({ stopSession }) => {
  const { interrupt } = useInterrupt();
  const { viewTab, setViewTab } = useSessionStore();

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Floating controls in the top-center over the video */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
        {viewTab === "video" && (
          <div className="flex gap-2 items-center justify-center">
            <Button className="!bg-zinc-700 !text-white" onClick={interrupt}>
              Interrupt
            </Button>
            <Button className="!bg-red-600 !text-white" onClick={stopSession}>
              Stop
            </Button>
          </div>
        )}
        {/* Tab switcher */}
        <div className="mt-2 flex items-center justify-center gap-2 bg-black/40 border border-white/10 rounded-full px-2 py-1 backdrop-blur-sm">
          {/* Video first */}
          <Button
            title="Video"
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center !text-white ${
              viewTab === "video" ? "!bg-[#7559FF]" : "!bg-zinc-800"
            }`}
            onClick={() => setViewTab("video")}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            title="Brain"
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center !text-white ${
              viewTab === "brain" ? "!bg-[#7559FF]" : "!bg-zinc-800"
            }`}
            onClick={() => setViewTab("brain")}
          >
            <Brain className="h-4 w-4" />
          </Button>
          <Button
            title="Data"
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center !text-white ${
              viewTab === "data" ? "!bg-[#7559FF]" : "!bg-zinc-800"
            }`}
            onClick={() => setViewTab("data")}
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            title="Actions"
            className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center !text-white ${
              viewTab === "actions" ? "!bg-[#7559FF]" : "!bg-zinc-800"
            }`}
            onClick={() => setViewTab("actions")}
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
