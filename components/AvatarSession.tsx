"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChatPanel } from "./AvatarSession/ChatPanel";
import { useDockablePanel } from "./AvatarSession/hooks/useDockablePanel";
import { useChatController } from "./AvatarSession/hooks/useChatController";
import { useChatPanelProps } from "./AvatarSession/hooks/useChatPanelProps";
import { useStartMockChat } from "./AvatarSession/hooks/useStartMockChat";
import { AvatarVideoPanel } from "./AvatarSession/AvatarVideoPanel";
import { StreamingAvatarSessionState } from "./logic/context";

import { buildSessionConfig } from "@/components/modals/session/utils";
import type { AgentConfig } from "@/lib/schemas/agent";
import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { useAgentStore } from "@/lib/stores/agent";
import { useSettingsStore } from "@/lib/stores/settings";
import { useSessionStore } from "@/lib/stores/session";
import { usePlacementStore } from "@/lib/stores/placement";
import { cn } from "@/lib/utils";
import { safeWindow } from "@/lib/utils";

//

interface AvatarSessionProps {
	mediaStream: React.RefObject<HTMLVideoElement>;
	sessionState: StreamingAvatarSessionState;
	stopSession: () => void;
	startSession: (config: StartAvatarRequest) => Promise<void> | void;
	initialConfig: StartAvatarRequest;
}

export function AvatarSession({
	stopSession,
	mediaStream,
	sessionState,
	startSession,
	initialConfig,
}: AvatarSessionProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const messages = useSessionStore((state) => state.messages);
	const setConfig = useSessionStore((state) => state.setConfig);
	const { currentAgent, setLastStarted, markClean } = useAgentStore();
	const userSettings = useSettingsStore((state) => state.userSettings);

	// Refs for dockable panel root and panel
	const panelRef = useRef<HTMLDivElement | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	// Dock/drag/resize logic encapsulated in a hook
	const {
		dock,
		expanded,
		floatingPos,
		floatingSize,
		setDock,
		setBottomSize,
		toggleExpand,
		startFloatingResize,
		handlePointerDown,
	} = useDockablePanel(rootRef, panelRef);

	const {
		// state
		chatInput,
		setChatInput,
		isSending,
		userVideoStream,
		mockVoiceActive,
		canChat,
		isChatSolidBg,
		isVoiceChatActive,
		// actions
		sendMessageVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
		handleCopy,
		handleArrowUp,
		handleArrowDown,
		enableMockChatUi,
	} = useChatController(sessionState);

	// Start mock chat and open UI in bottom expanded mode
	const startMockChat = useStartMockChat({
		dock,
		expanded,
		setDock,
		setBottomSize,
		toggleExpand,
		enableMockChatUi,
	});

	// Open bottom chat expanded without selecting an avatar
	const startWithoutAvatar = () => {
		// Ensure docked at bottom and fully expanded
		setDock("bottom");
		setBottomSize(100);
		if (!expanded) toggleExpand();
	};

	// Auxiliary handlers provided by useChatController

	// (All dock/drag/resize effects moved into useDockablePanel)

	// viewTab no longer used here; handled inside AvatarVideoPanel

	// Build common ChatPanel props once
	const chatPanelProps = useChatPanelProps({
		canChat,
		chatInput,
		isSending,
		isChatSolidBg,
		isVoiceActive: isVoiceChatActive || mockVoiceActive,
		messages,
		sessionState,
		onArrowDown: handleArrowDown,
		onArrowUp: handleArrowUp,
		onChatInputChange: setChatInput,
		onCopy: handleCopy,
		onSendMessage: sendMessageVoid,
		onStartVoiceChat: startVoiceChatVoid,
		onStopVoiceChat: stopVoiceChatVoid,
		onDock: setDock,
		onHeaderPointerDown: handlePointerDown,
		onToggleExpand: toggleExpand,
		onStartMockChat: startMockChat,
	});

	/**
	 * Starts a streaming session using inline selections from the video panel while merging
	 * persisted agent and user preferences.
	 */
	const startFromVideoPanel = useCallback(
		async (options?: { avatarId?: string; knowledgeBaseId?: string }) => {
			try {
				const overrides = options
					? {
							avatarId: options.avatarId,
							knowledgeBaseId: options.knowledgeBaseId,
						}
					: undefined;

				const finalConfig = buildSessionConfig({
					baseConfig: initialConfig,
					agentConfig: currentAgent ?? undefined,
					userSettings,
					overrides,
				});

				setConfig(finalConfig);

				if (currentAgent) {
					const nextAgent: AgentConfig = {
						...currentAgent,
						...(overrides?.avatarId ? { avatarId: overrides.avatarId } : {}),
						...(overrides?.knowledgeBaseId !== undefined
							? { knowledgeBaseId: overrides.knowledgeBaseId ?? undefined }
							: {}),
					} as AgentConfig;

					setLastStarted(nextAgent);
					markClean();
				}

				await startSession(finalConfig);
			} catch (error) {
				console.error("Failed to start session from video panel", error);
			}
		},
		[
			currentAgent,
			initialConfig,
			markClean,
			setConfig,
			setLastStarted,
			startSession,
			userSettings,
		],
	);

	const avatarVideoPanel = (
		<AvatarVideoPanel
			mediaStream={mediaStream}
			sessionState={sessionState}
			stopSession={stopSession}
			userVideoStream={userVideoStream}
			onStartSession={startFromVideoPanel}
			onStartWithoutAvatar={startWithoutAvatar}
		/>
	);

	// Unified, stable render tree to avoid video remounts
	const isRight = dock === "right";
	const isFloating = dock === "floating";

	// Right dock: compute current drawer width in px to reserve space so content isn't covered
	const rightWidthFrac = usePlacementStore((s) => s.rightWidthFrac);
	const isRightOpen = isRight && rightWidthFrac > 0.01;
	const rightWidthPx = (() => {
		const w = safeWindow();
		return !w ? 0 : Math.round((rightWidthFrac || 0) * w.innerWidth);
	})();

	// Render a stable placeholder on server and on the client's first render
	// to avoid SSR/CSR mismatch while persisted stores hydrate.
	if (!mounted) {
		return <div ref={rootRef} className={cn("relative w-full h-full")} />;
	}

	return (
		<div
			ref={rootRef}
			className={cn(
				"group relative w-full h-full",
				!isFloating && (isRight ? "flex flex-row" : "flex flex-col"),
			)}
			style={
				!isFloating && isRightOpen ? { paddingRight: rightWidthPx } : undefined
			}
		>
			{/* Video panel stays mounted */}
			<div
				className={cn(
					"relative bg-background overflow-hidden",
					!isFloating && (isRight ? "flex-1" : "flex-1"),
					isFloating && "w-full h-full",
				)}
				style={!isFloating ? undefined : {}}
			>
				{avatarVideoPanel}
			</div>

			{/* Let RightTab/BottomTab render their own fixed drawers via ChatPanel */}
			{!isFloating && (
				<ChatPanel dock={dock} expanded={expanded} {...chatPanelProps} />
			)}

			{/* Floating chat overlay */}
			{isFloating && (
				<div
					ref={panelRef}
					className="pointer-events-auto fixed z-[60]"
					style={{
						left: floatingPos.x,
						top: floatingPos.y,
						width: expanded ? 520 : floatingSize.w,
						height: expanded ? 520 : floatingSize.h,
					}}
				>
					<ChatPanel dock={dock} expanded={expanded} {...chatPanelProps} />
					{/* Resize handle (bottom-right corner) - larger, always on top */}
					<div
						className="absolute bottom-1 right-1 z-[70] w-6 h-6 cursor-nwse-resize rounded-md border-2 border-border bg-muted-foreground/40 shadow-sm hover:bg-muted-foreground/60 hover:border-foreground/90 pointer-events-auto select-none"
						role="button"
						aria-label="Resize chat"
						style={{
							backgroundImage:
								"repeating-linear-gradient(135deg, rgba(255,255,255,0.9) 0 2px, transparent 2px 6px)",
							backgroundClip: "padding-box",
						}}
						onPointerDown={startFloatingResize}
						onPointerDownCapture={startFloatingResize}
					/>
				</div>
			)}

			{/* Reopen tabs handled inside BottomTab/RightTab components */}
		</div>
	);
}
