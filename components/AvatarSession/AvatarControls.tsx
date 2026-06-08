import {
	Brain,
	Database,
	LayoutDashboard,
	Minimize2,
	Play,
} from "lucide-react";
import React from "react";
import {
	useInterruptTaskMutation,
	useKeepAliveMutation,
	useStopSessionMutation,
} from "@/lib/services/streaming/query";
import { useSessionStore } from "@/lib/stores/session";
import { switchWorkspaceView } from "../../lib/workspace-view";
import { Button } from "../Button";
import {
	StreamingAvatarSessionState,
	useStreamingAvatarContext,
} from "../logic/context";
import { useInterrupt } from "../logic/useInterrupt";

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
	const showVideoView = () => {
		setViewTab("video");
		setControlsMinimized(true);
	};
	const showAlternateView = (tab: "brain" | "data" | "actions") => {
		switchWorkspaceView(tab);
	};

	return (
		<div className="absolute inset-0 pointer-events-none z-[90]">
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
					data-tour="top-panel-toggle"
					className={
						"fixed top-0 left-1/2 -translate-x-1/2 z-[100] select-none pointer-events-auto " +
						"flex items-center gap-2 rounded-b-md border border-primary bg-background px-3 py-2 text-foreground " +
						"shadow-lg shadow-black/30 hover:bg-muted"
					}
					onClick={() => setControlsMinimized(false)}
				>
					<span className="h-1.5 w-8 rounded-full bg-primary" />
					<span className="text-xs font-medium">Controls</span>
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
						data-tour="top-panel-tabs"
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
							data-tour="top-panel-toggle"
							className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
								viewTab === "video"
									? "!bg-primary !text-primary-foreground"
									: "!bg-muted !text-foreground"
							}`}
							title="Video"
							onClick={showVideoView}
						>
							<Play className="h-4 w-4" />
						</Button>
						<Button
							data-tour="brain-tab"
							className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
								viewTab === "brain"
									? "!bg-primary !text-primary-foreground"
									: "!bg-muted !text-foreground"
							}`}
							title="Brain"
							onClick={() => showAlternateView("brain")}
						>
							<Brain className="h-4 w-4" />
						</Button>
						<Button
							data-tour="data-tab"
							className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
								viewTab === "data"
									? "!bg-primary !text-primary-foreground"
									: "!bg-muted !text-foreground"
							}`}
							title="Data"
							onClick={() => showAlternateView("data")}
						>
							<Database className="h-4 w-4" />
						</Button>
						<Button
							data-tour="actions-tab"
							className={`h-9 w-9 aspect-square !p-0 rounded-xl flex items-center justify-center flex-shrink-0 ${
								viewTab === "actions"
									? "!bg-primary !text-primary-foreground"
									: "!bg-muted !text-foreground"
							}`}
							title="Actions"
							onClick={() => showAlternateView("actions")}
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
