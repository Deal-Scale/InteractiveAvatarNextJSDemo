import React from "react";
import {
	Brain,
	Database,
	LayoutDashboard,
	Play,
	Minimize2,
} from "lucide-react";

import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";
import {
	StreamingAvatarSessionState,
	useStreamingAvatarContext,
} from "../logic/context";

import { useSessionStore } from "@/lib/stores/session";
import {
	useInterruptTaskMutation,
	useStopSessionMutation,
	useKeepAliveMutation,
} from "@/lib/services/streaming/query";

interface AvatarControlsProps {
	stopSession: () => void;
}

export const AvatarControls: React.FC<AvatarControlsProps> = ({
	stopSession,
}) => {
	const { interrupt } = useInterrupt();
	const {
		viewTab,
		setViewTab,
		controlsMinimized,
		setControlsMinimized,
		currentSessionId,
	} = useSessionStore();
	const { sessionState } = useStreamingAvatarContext();

	const interruptApi = useInterruptTaskMutation();
	const stopApi = useStopSessionMutation();
	const keepAliveApi = useKeepAliveMutation();

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
			{/* Keep-Alive button top-left when connected */}
			{sessionState === StreamingAvatarSessionState.CONNECTED && (
				<div className="absolute top-3 left-3 pointer-events-auto">
					<Button
						className="opacity-60 hover:opacity-100 transition-opacity"
						onClick={() => {
							if (currentSessionId) {
								void keepAliveApi.mutateAsync({ session_id: currentSessionId });
							}
						}}
					>
						Keep Alive
					</Button>
				</div>
			)}
			{/* Restore hanging icon when minimized */}
			{controlsMinimized && (
				<button
					type="button"
					aria-label="Show controls"
					className={
						"fixed top-0 left-1/2 -translate-x-1/2 z-40 select-none pointer-events-auto " +
						"flex items-center gap-2 rounded-b-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary " +
						"hover:bg-primary/15"
					}
					onClick={() => setControlsMinimized(false)}
				>
					<span className="h-1.5 w-8 rounded-full bg-primary/50" />
				</button>
			)}
			{/* Floating controls in the top-center over the video */}
			{!controlsMinimized && (
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
								onClick={() => {
									// Fire SDK interrupt immediately for UX
									interrupt();
									// Also notify server if we have a session id
									if (currentSessionId) {
										void interruptApi.mutateAsync({
											session_id: currentSessionId,
										});
									}
								}}
							>
								Interrupt
							</Button>
							<Button
								className="!bg-destructive !text-destructive-foreground"
								onClick={() => {
									// Stop server session first if present
									if (currentSessionId) {
										void stopApi.mutateAsync({ session_id: currentSessionId });
									}
									// Then stop SDK session
									stopSession();
								}}
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
						{/* Minimize button for the whole group */}
						<Button
							className="h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 !bg-muted !text-foreground ml-1"
							title="Minimize controls"
							onClick={() => setControlsMinimized(true)}
						>
							<Minimize2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
