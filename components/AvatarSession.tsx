"use client";

import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildSessionConfig } from "@/components/modals/session/utils";
import type { AgentConfig } from "@/lib/schemas/agent";
import { useAgentStore } from "@/lib/stores/agent";
import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";
import { useSettingsStore } from "@/lib/stores/settings";
import { cn, safeWindow } from "@/lib/utils";
import { AvatarVideoPanel } from "./AvatarSession/AvatarVideoPanel";
import { ChatPanel } from "./AvatarSession/ChatPanel";
import { useChatController } from "./AvatarSession/hooks/useChatController";
import { useChatPanelProps } from "./AvatarSession/hooks/useChatPanelProps";
import { useDockablePanel } from "./AvatarSession/hooks/useDockablePanel";
import { StreamingAvatarSessionState } from "./logic/context";

//

interface AvatarSessionProps {
	mediaStream: React.RefObject<HTMLVideoElement | null>;
	sessionState: StreamingAvatarSessionState;
	stopSession: () => void;
	startSession: (config: StartAvatarRequest) => Promise<void> | void;
	initialConfig: StartAvatarRequest;
	liveAvatarEmbedUrl?: string | null;
}

export function AvatarSession({
	stopSession,
	mediaStream,
	sessionState,
	startSession,
	initialConfig,
	liveAvatarEmbedUrl,
}: AvatarSessionProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	const messages = useSessionStore((state) => state.messages);
	const setConfig = useSessionStore((state) => state.setConfig);
	const chatExperience = useSessionStore((state) => state.chatExperience);
	const setChatExperience = useSessionStore((state) => state.setChatExperience);
	const { currentAgent, setLastStarted, markClean } = useAgentStore();
	const userSettings = useSettingsStore((state) => state.userSettings);
	const setDockMode = usePlacementStore((state) => state.setDockMode);
	const setBottomHeightFrac = usePlacementStore(
		(state) => state.setBottomHeightFrac,
	);
	const setRightWidthFrac = usePlacementStore(
		(state) => state.setRightWidthFrac,
	);
	const setFloating = usePlacementStore((state) => state.setFloating);
	const setSidebarCollapsed = usePlacementStore(
		(state) => state.setSidebarCollapsed,
	);

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
		isSending,
		userVideoStream,
		mockVoiceActive,
		canChat,
		isChatSolidBg,
		isVoiceChatActive,
		// actions
		sendMessageVoid,
		stopSendingVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
		handleCopy,
		enableMockChatUi,
	} = useChatController(sessionState);

	const initializedChatModeRef = useRef<string | null>(null);
	useEffect(() => {
		if (sessionState === StreamingAvatarSessionState.CONNECTED) {
			return;
		}

		if (chatExperience === "basic") {
			enableMockChatUi();
			setDockMode("bottom");
			if (initializedChatModeRef.current !== "basic") {
				setBottomHeightFrac(1);
				setSidebarCollapsed(false);
				if (!expanded) {
					toggleExpand();
				}
			}
		}

		if (chatExperience === "advanced") {
			enableMockChatUi();
			setDockMode("bottom");
			if (initializedChatModeRef.current !== "advanced") {
				setBottomHeightFrac(0.35);
				setSidebarCollapsed(true);
			}
		}

		initializedChatModeRef.current = chatExperience;
	}, [
		chatExperience,
		enableMockChatUi,
		expanded,
		sessionState,
		setBottomHeightFrac,
		setDockMode,
		setSidebarCollapsed,
		toggleExpand,
	]);

	// Open bottom chat expanded without selecting an avatar/session.
	const startWithoutAvatar = useCallback(() => {
		setChatExperience("basic");
		enableMockChatUi();
		setDockMode("bottom");
		setBottomHeightFrac(1);
		setSidebarCollapsed(false);
		setDock("bottom");
		setBottomSize(100);
		if (!expanded) toggleExpand();
	}, [
		enableMockChatUi,
		expanded,
		setChatExperience,
		setBottomHeightFrac,
		setDock,
		setDockMode,
		setBottomSize,
		setSidebarCollapsed,
		toggleExpand,
	]);

	useEffect(() => {
		const handleStartChatWithoutSession = (event: Event) => {
			if (useSessionStore.getState().chatExperience !== "basic") {
				return;
			}
			const shouldClearInput = (event as CustomEvent<{ clearInput?: boolean }>)
				.detail?.clearInput;
			if (shouldClearInput) {
				// draft is owned by the chat composer now
			}
			startWithoutAvatar();
		};

		window.addEventListener(
			"tour-start-chat-without-session",
			handleStartChatWithoutSession,
		);

		return () => {
			window.removeEventListener(
				"tour-start-chat-without-session",
				handleStartChatWithoutSession,
			);
		};
	}, [startWithoutAvatar]);

	useEffect(() => {
		const handleShowAvatarWorkspace = () => {
			setChatExperience("avatar");
			setDock("bottom");
			setDockMode("bottom");
			setBottomHeightFrac(0);
			setRightWidthFrac(0);
			setFloating({ visible: false });
			setSidebarCollapsed(true);
		};

		window.addEventListener(
			"tour-show-avatar-workspace",
			handleShowAvatarWorkspace,
		);
		const handleShowBasicWorkspace = () => {
			autoStartedBasicChatRef.current = true;
			setChatExperience("basic");
			setDock("bottom");
			setDockMode("bottom");
			setBottomHeightFrac(0);
			setRightWidthFrac(0);
			setFloating({ visible: false });
			setSidebarCollapsed(true);
		};

		window.addEventListener(
			"tour-show-basic-workspace",
			handleShowBasicWorkspace,
		);

		return () => {
			window.removeEventListener(
				"tour-show-avatar-workspace",
				handleShowAvatarWorkspace,
			);
			window.removeEventListener(
				"tour-show-basic-workspace",
				handleShowBasicWorkspace,
			);
		};
	}, [
		setBottomHeightFrac,
		setChatExperience,
		setDock,
		setDockMode,
		setFloating,
		setRightWidthFrac,
		setSidebarCollapsed,
	]);

	const autoStartedBasicChatRef = useRef(false);
	useEffect(() => {
		if (chatExperience !== "basic") {
			autoStartedBasicChatRef.current = false;
			return;
		}

		if (
			!mounted ||
			sessionState === StreamingAvatarSessionState.CONNECTED ||
			autoStartedBasicChatRef.current
		) {
			return;
		}

		if (useSessionStore.getState().chatExperience !== "basic") {
			return;
		}

		autoStartedBasicChatRef.current = true;
		startWithoutAvatar();
	}, [chatExperience, mounted, sessionState, startWithoutAvatar]);

	// Auxiliary handlers provided by useChatController

	// (All dock/drag/resize effects moved into useDockablePanel)

	// viewTab no longer used here; handled inside AvatarVideoPanel

	// Build common ChatPanel props once
	const chatPanelProps = useChatPanelProps({
		canChat,
		isSending,
		isChatSolidBg,
		isVoiceActive: isVoiceChatActive || mockVoiceActive,
		messages,
		sessionState,
		onCopy: handleCopy,
		onSendMessage: sendMessageVoid,
		onStopSending: stopSendingVoid,
		onStartVoiceChat: startVoiceChatVoid,
		onStopVoiceChat: stopVoiceChatVoid,
		onDock: setDock,
		onHeaderPointerDown: handlePointerDown,
		onToggleExpand: toggleExpand,
		onStartMockChat: startWithoutAvatar,
	});

	/**
	 * Starts a streaming session using inline selections from the video panel while merging
	 * persisted agent and user preferences.
	 */
	const startFromVideoPanel = useCallback(
		async (options?: {
			avatarId?: string;
			knowledgeBaseId?: string;
			voiceId?: string;
		}) => {
			try {
				const overrides = options
					? {
							avatarId: options.avatarId,
							knowledgeBaseId: options.knowledgeBaseId,
							voiceOverrides: options.voiceId
								? { voiceId: options.voiceId }
								: undefined,
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
						...(options?.voiceId ? { voiceId: options.voiceId } : {}),
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
			liveAvatarEmbedUrl={liveAvatarEmbedUrl}
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
					"relative min-h-0 bg-background overflow-hidden",
					!isFloating && (isRight ? "h-full flex-1" : "flex-1 basis-0"),
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
					<button
						type="button"
						className="absolute bottom-1 right-1 z-[70] w-6 h-6 cursor-nwse-resize rounded-md border-2 border-border bg-muted-foreground/40 shadow-sm hover:bg-muted-foreground/60 hover:border-foreground/90 pointer-events-auto select-none"
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
