import type React from "react";
import { forwardRef, useEffect, useRef } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState } from "../logic";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";
import { Loader } from "../ui/loader";

import ConnectionIndicator from "./ConnectionIndicator";

import { useSessionStore } from "@/lib/stores/session";

// Track which video elements already have listeners attached without using `any`.
const attachedListenerVideos = new WeakSet<HTMLVideoElement>();

export const LoadingBackdrop: React.FC = () => (
	<>
		<div className="absolute inset-0 -z-10 overflow-hidden">
			<div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-gradient-to-br from-primary/30 to-secondary/30 animate-pulse" />
			<div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-gradient-to-br from-accent/25 to-primary/25 animate-pulse [animation-duration:4s]" />
			<div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_center,_hsl(var(--foreground))_1px,_transparent_1px)] [background-size:16px_16px]" />
		</div>
	</>
);

export const StatusPanel: React.FC<{
	sessionState: StreamingAvatarSessionState;
	connectionQuality: ConnectionQuality;
	creditsPerMinute: number;
	creditsRemaining: number;
}> = ({
	sessionState,
	connectionQuality,
	creditsPerMinute,
	creditsRemaining,
}) => (
	<div className="absolute top-3 left-3 flex flex-col gap-2">
		<ConnectionIndicator sessionState={sessionState} />
		{connectionQuality !== ConnectionQuality.UNKNOWN && (
			<div className="bg-popover/70 text-popover-foreground rounded-lg px-3 py-2 border border-border backdrop-blur-sm">
				Connection Quality: {connectionQuality}
			</div>
		)}
		<div className="bg-popover/70 text-popover-foreground rounded-lg px-3 py-2 border border-border backdrop-blur-sm">
			<div className="flex items-center gap-2 text-xs">
				<span className="inline-flex h-2 w-2 rounded-full bg-primary animate-pulse" />
				<span>
					{Math.round(creditsPerMinute)} cpm •{" "}
					{Math.max(0, Math.floor(creditsRemaining))} left
				</span>
			</div>
		</div>
	</div>
);

export const LoadingSpinnerOverlay: React.FC = () => (
	<div className="absolute inset-0 flex items-center justify-center">
		<div className="flex flex-col items-center gap-4">
			<div className="relative h-20 w-20">
				<div className="absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-primary via-secondary to-accent animate-spin [animation-duration:2.5s]" />
				<div className="absolute inset-[4px] rounded-full bg-popover/70 backdrop-blur-sm border border-border" />
			</div>
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader size="sm" />
				<span>Preparing avatar…</span>
			</div>
			<p className="text-xs text-muted-foreground">
				Your session will start shortly.
			</p>
		</div>
	</div>
);

export const AvatarVideo = forwardRef<HTMLVideoElement>((_props, ref) => {
	const { sessionState, stopAvatar } = useStreamingAvatarSession();
	const { connectionQuality } = useConnectionQuality();
	const { creditsRemaining, creditsPerMinute, setCreditsRemaining } =
		useSessionStore();

	const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;
	const videoRef = useRef<HTMLVideoElement | null>(null);

	// Keep both local and forwarded refs in sync
	const setVideoEl = (el: HTMLVideoElement | null) => {
		videoRef.current = el;
		if (typeof ref === "function") {
			ref(el);
		} else if (ref) {
			(ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
		}
	};

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

	// Attach track-level diagnostics (replaces inline IIFE for clarity)
	useEffect(() => {
		const videoEl = videoRef.current;

		if (!videoEl || attachedListenerVideos.has(videoEl)) return;
		attachedListenerVideos.add(videoEl);
		const attach = () => {
			const src = videoEl.srcObject as MediaStream | null;

			if (!src) return;
			src.getTracks().forEach((t) => {
				const onEnded = () => console.warn("[AvatarVideo] track ended", t.kind);
				const onMute = () => console.warn("[AvatarVideo] track mute", t.kind);
				const onUnmute = () =>
					console.warn("[AvatarVideo] track unmute", t.kind);

				t.addEventListener("ended", onEnded);
				t.addEventListener("mute", onMute);
				t.addEventListener("unmute", onUnmute);
			});
		};
		const id = setTimeout(attach, 0);

		return () => clearTimeout(id);
	}, []);

	return (
		<>
			{!isLoaded && <LoadingBackdrop />}
			<StatusPanel
				sessionState={sessionState}
				connectionQuality={connectionQuality}
				creditsPerMinute={creditsPerMinute}
				creditsRemaining={creditsRemaining}
			/>
			{isLoaded && (
				<Button
					className="absolute top-3 right-3 !p-2 bg-secondary/70 z-10"
					onClick={stopAvatar}
				>
					<CloseIcon />
				</Button>
			)}
			<video
				ref={setVideoEl}
				autoPlay
				playsInline
				style={{
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
				onError={(e) => console.error("[AvatarVideo] video error", e)}
				onLoadedData={() => console.debug("[AvatarVideo] loadeddata")}
			>
				<track kind="captions" />
			</video>
			{/* Subtle connected glow overlay */}
			{isLoaded && (
				<div className="pointer-events-none absolute inset-0 ring-1 ring-primary/20 shadow-[0_0_80px_-20px_hsl(var(--primary)/0.35)] animate-[pulse_3s_ease-in-out_infinite]" />
			)}
			{!isLoaded && <LoadingSpinnerOverlay />}
		</>
	);
});
AvatarVideo.displayName = "AvatarVideo";
