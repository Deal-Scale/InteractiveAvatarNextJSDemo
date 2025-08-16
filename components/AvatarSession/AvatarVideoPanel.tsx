import { Brain, Database, LayoutDashboard } from "lucide-react";
import React from "react";

import { AvatarVideo } from "./AvatarVideo";
import { UserVideo } from "./UserVideo";
import { AvatarControls } from "./AvatarControls";

import { useSessionStore } from "@/lib/stores/session";

export function AvatarVideoPanel({
  mediaStream,
  userVideoStream,
  stopSession,
}: {
  mediaStream: React.RefObject<HTMLVideoElement>;
  userVideoStream: MediaStream | null;
  stopSession: () => void;
}) {
  const { viewTab } = useSessionStore();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {viewTab === "video" ? (
        <AvatarVideo ref={mediaStream} />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
          <div className="text-center text-zinc-200">
            <div className="mb-3 flex items-center justify-center">
              {viewTab === "brain" && (
                <Brain className="h-8 w-8 text-indigo-400" />
              )}
              {viewTab === "data" && (
                <Database className="h-8 w-8 text-sky-400" />
              )}
              {viewTab === "actions" && (
                <LayoutDashboard className="h-8 w-8 text-emerald-400" />
              )}
            </div>
            <div className="text-lg font-medium capitalize">{viewTab}</div>
            <div className="text-sm text-zinc-400">Alternate view panel</div>
          </div>
        </div>
      )}

      {userVideoStream && (
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-gray-700">
          <UserVideo userVideoStream={userVideoStream} />
        </div>
      )}

      <AvatarControls stopSession={stopSession} />
    </div>
  );
}
