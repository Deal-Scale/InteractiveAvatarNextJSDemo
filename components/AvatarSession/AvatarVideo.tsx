import React, { forwardRef, useEffect } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";

export const AvatarVideo = forwardRef<HTMLVideoElement>((props, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <>
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-3 left-3 bg-black text-white rounded-lg px-3 py-2">
          Connection Quality: {connectionQuality}
        </div>
      )}
      {isLoaded && (
        <Button
          className="absolute top-3 right-3 !p-2 bg-zinc-700 bg-opacity-50 z-10"
          onClick={stopAvatar}
        >
          <CloseIcon />
        </Button>
      )}
      <video
        ref={ref}
        autoPlay
        playsInline
        onPlay={() => console.debug("[AvatarVideo] video play event")}
        onPause={() => console.debug("[AvatarVideo] video pause event")}
        onEnded={() => console.debug("[AvatarVideo] video ended event")}
        onError={(e) => console.error("[AvatarVideo] video error", e)}
        onLoadedMetadata={() => console.debug("[AvatarVideo] loadedmetadata")}
        onLoadedData={() => console.debug("[AvatarVideo] loadeddata")}
        onStalled={() => console.warn("[AvatarVideo] video stalled")}
        onSuspend={() => console.warn("[AvatarVideo] video suspend")}
        onWaiting={() => console.warn("[AvatarVideo] video waiting")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <track kind="captions" />
      </video>
      {/* Track-level diagnostics */}
      {(() => {
        // Attach track listeners when available
        const videoEl = ref as React.RefObject<HTMLVideoElement>;
        if (videoEl?.current && (videoEl.current as any)._listenersAttached !== true) {
          (videoEl.current as any)._listenersAttached = true;
          setTimeout(() => {
            const src = (videoEl.current as HTMLVideoElement).srcObject as MediaStream | null;
            if (src) {
              src.getTracks().forEach((t) => {
                t.addEventListener("ended", () => console.warn("[AvatarVideo] track ended", t.kind));
                t.addEventListener("mute", () => console.warn("[AvatarVideo] track mute", t.kind));
                t.addEventListener("unmute", () => console.warn("[AvatarVideo] track unmute", t.kind));
              });
              console.debug("[AvatarVideo] attached track listeners", src.getTracks().map((t) => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })));
            } else {
              console.debug("[AvatarVideo] no srcObject yet to attach track listeners");
            }
          }, 0);
        }
        return null;
      })()}
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
          Loading...
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
