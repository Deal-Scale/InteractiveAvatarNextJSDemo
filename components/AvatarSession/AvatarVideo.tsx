import React, { forwardRef, useEffect } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";
import { Loader } from "../ui/loader";
import { useSessionStore } from "@/lib/stores/session";
import ConnectionIndicator from "./ConnectionIndicator";

export const AvatarVideo = forwardRef<HTMLVideoElement>((props, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();
  const {
    creditsRemaining,
    creditsPerMinute,
    setCreditsRemaining,
  } = useSessionStore();

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  // Consume credits while connected
  useEffect(() => {
    if (!isLoaded || creditsPerMinute <= 0) return;
    const perSecond = creditsPerMinute / 60;
    const id = setInterval(() => {
      const current = useSessionStore.getState().creditsRemaining;
      const next = Math.max(0, current - perSecond);
      setCreditsRemaining(next);
    }, 1000);
    return () => clearInterval(id);
  }, [isLoaded, creditsPerMinute, setCreditsRemaining]);

  return (
    <>
      {/* Animated ambient background only while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Soft animated gradient blobs */}
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-gradient-to-br from-fuchsia-500/30 to-indigo-500/30 animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br from-cyan-500/25 to-emerald-500/25 animate-pulse [animation-duration:4s]" />
          {/* Faint grid overlay */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,_#fff_1px,_transparent_1px)] [background-size:16px_16px]" />
        </div>
      )}
      <div className="absolute top-3 left-3 flex flex-col gap-2">
        {/* Session status badge */}
        <ConnectionIndicator sessionState={sessionState} />
        {connectionQuality !== ConnectionQuality.UNKNOWN && (
          <div className="bg-black/70 text-white rounded-lg px-3 py-2 border border-white/10 backdrop-blur-sm">
            Connection Quality: {connectionQuality}
          </div>
        )}
        <div className="bg-black/70 text-white rounded-lg px-3 py-2 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {Math.round(creditsPerMinute)} cpm • {Math.max(0, Math.floor(creditsRemaining))} left
            </span>
          </div>
        </div>
      </div>
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
      {/* Subtle connected glow overlay */}
      {isLoaded && (
        <div className="pointer-events-none absolute inset-0 ring-1 ring-emerald-400/20 shadow-[0_0_80px_-20px_rgba(16,185,129,0.35)] animate-[pulse_3s_ease-in-out_infinite]" />
      )}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning conic ring */}
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-fuchsia-500 via-indigo-500 to-cyan-500 animate-spin [animation-duration:2.5s]" />
              <div className="absolute inset-[4px] rounded-full bg-black/70 backdrop-blur-sm border border-white/10" />
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-200">
              <Loader size="sm" />
              <span>Preparing avatar…</span>
            </div>
            <p className="text-xs text-zinc-400">Your session will start shortly.</p>
          </div>
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
