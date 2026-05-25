import {
	ExpandIcon,
	Highlighter,
	MessageSquareIcon,
	Settings2Icon,
	XIcon,
	ZoomIn,
} from "lucide-react";
import dynamic from "next/dynamic";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { SessionQuickStartCard } from "@/components/AvatarSession/SessionQuickStartCard";
import { defaultGraphData } from "@/components/data-viewer";
import { ActionsKanbanPanel as KanbanActionsPanel } from "@/components/kanban/ActionsKanbanPanel";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { Button } from "@/components/ui/button";

import {
	useAvatarOptionsQuery,
	useKnowledgeBaseOptionsQuery,
	useVoiceOptionsQuery,
} from "@/data/options";
import { useAgentStore } from "@/lib/stores/agent";
import { usePlacementStore } from "@/lib/stores/placement";
import { useSessionStore } from "@/lib/stores/session";
import { StreamingAvatarSessionState } from "../logic/context";
import { AvatarControls } from "./AvatarControls";
import { AvatarVideo } from "./AvatarVideo";
import { UserVideo } from "./UserVideo";

const BrainGraphViewer = dynamic(
	() =>
		import("@/components/three-graph-viewer").then(
			(module) => module.ThreeGraphViewer,
		),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
				Loading graph...
			</div>
		),
	},
);

const DataViewerPanel = dynamic(
	() => import("@/components/data-viewer").then((module) => module.DataViewer),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
				Loading data...
			</div>
		),
	},
);

const UUID_PATTERN =
	/^(urn:uuid:)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function AvatarVideoPanel({
	mediaStream,
	userVideoStream,
	stopSession,
	sessionState,
	onStartSession,
	onStartWithoutAvatar,
	liveAvatarEmbedUrl,
}: {
	mediaStream: React.RefObject<HTMLVideoElement | null>;
	liveAvatarEmbedUrl?: string | null;
	userVideoStream: MediaStream | null;
	stopSession: () => void;
	sessionState: StreamingAvatarSessionState;
	onStartSession?: (options: {
		avatarId?: string;
		knowledgeBaseId?: string;
		voiceId?: string;
	}) => void;
	onStartWithoutAvatar?: () => void;
}) {
	const { chatExperience, openChatSettings, setViewTab, viewTab } =
		useSessionStore();
	const { currentAgent, updateAgent } = useAgentStore();
	const setDockMode = usePlacementStore((state) => state.setDockMode);
	const setBottomHeightFrac = usePlacementStore(
		(state) => state.setBottomHeightFrac,
	);
	const [selectedAvatar, setSelectedAvatar] = useState<string>(
		currentAgent?.avatarId ?? "",
	);
	const [customAvatarId, setCustomAvatarId] = useState<string>(
		currentAgent?.avatarId ?? "",
	);
	const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>(
		currentAgent?.knowledgeBaseId ?? "",
	);
	const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
		currentAgent?.voiceId ?? "",
	);
	const { data: avatarOptionItems = [], isFetching: isLoadingAvatarOptions } =
		useAvatarOptionsQuery();
	const { data: voiceOptions = [], isFetching: isLoadingVoiceOptions } =
		useVoiceOptionsQuery();
	const { data: contextOptions = [], isFetching: isLoadingContextOptions } =
		useKnowledgeBaseOptionsQuery();
	const avatarOptions = useMemo(
		() =>
			avatarOptionItems.map((option) => ({
				avatar_id: option.value,
				name: option.label,
			})),
		[avatarOptionItems],
	);
	const selectedAvatarId =
		selectedAvatar === "CUSTOM" ? customAvatarId.trim() : selectedAvatar;
	const customIdValid = UUID_PATTERN.test(selectedAvatarId);
	const [highlightGraphNodes, setHighlightGraphNodes] = useState(false);

	const handleAvatarSelection = (value: string) => {
		setSelectedAvatar(value);

		if (value === "CUSTOM") {
			const trimmed = customAvatarId.trim();
			updateAgent({ avatarId: trimmed || undefined });
			return;
		}

		updateAgent({ avatarId: value || undefined });
		setCustomAvatarId("");
	};

	const handleCustomAvatarChange = (value: string) => {
		setCustomAvatarId(value);
		updateAgent({ avatarId: value.trim() || undefined });
	};

	const handleKnowledgeBaseChange = (value: string) => {
		setKnowledgeBaseId(value);
		updateAgent({ knowledgeBaseId: value.trim() || undefined });
	};

	const handleVoiceSelection = (value: string) => {
		setSelectedVoiceId(value);
		updateAgent({ voiceId: value.trim() || undefined });
	};

	const forwardStartSession = (payload: {
		avatarId?: string;
		knowledgeBaseId?: string;
		voiceId?: string;
	}) => {
		onStartSession?.(payload);
	};

	useEffect(() => {
		if (!currentAgent?.avatarId) {
			const firstAvatar = avatarOptions[0]?.avatar_id ?? "";
			setSelectedAvatar(firstAvatar);
			setCustomAvatarId("");
			if (firstAvatar) {
				updateAgent({ avatarId: firstAvatar });
			}
			return;
		}

		const matches = avatarOptions.some(
			(option) => option.avatar_id === currentAgent.avatarId,
		);

		if (matches) {
			setSelectedAvatar(currentAgent.avatarId);
			setCustomAvatarId("");
		} else {
			const firstAvatar = avatarOptions[0]?.avatar_id ?? "";
			setSelectedAvatar(firstAvatar);
			setCustomAvatarId("");
			if (firstAvatar) {
				updateAgent({ avatarId: firstAvatar });
			}
		}
	}, [avatarOptions, currentAgent?.avatarId, updateAgent]);

	useEffect(() => {
		const firstContext = contextOptions[0]?.value ?? "";
		const nextContext = currentAgent?.knowledgeBaseId || firstContext;
		setKnowledgeBaseId(nextContext);
		if (!currentAgent?.knowledgeBaseId && firstContext) {
			updateAgent({ knowledgeBaseId: firstContext });
		}
	}, [contextOptions, currentAgent?.knowledgeBaseId, updateAgent]);

	useEffect(() => {
		const firstVoice = voiceOptions[0]?.value ?? "";
		const nextVoice = currentAgent?.voiceId || firstVoice;
		setSelectedVoiceId(nextVoice);
		if (!currentAgent?.voiceId && firstVoice) {
			updateAgent({ voiceId: firstVoice });
		}
	}, [currentAgent?.voiceId, updateAgent, voiceOptions]);

	// LiveAvatar /v2/embeddings validates context_id as a UUID.
	const kbIdValid = useMemo(() => {
		const value = knowledgeBaseId.trim();
		if (!value) return false;
		return UUID_PATTERN.test(value);
	}, [knowledgeBaseId]);

	const isConnecting = sessionState === StreamingAvatarSessionState.CONNECTING;
	const showAvatarSetup =
		chatExperience === "avatar" ||
		sessionState === StreamingAvatarSessionState.CONNECTED;

	const openChatPanel = () => {
		setDockMode("bottom");
		setBottomHeightFrac(chatExperience === "basic" ? 1 : 0.5);
	};

	return (
		<div className="group relative w-full h-full bg-background overflow-hidden">
			{viewTab === "video" && (
				<div
					className={
						"absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-out " +
						(sessionState === StreamingAvatarSessionState.CONNECTED
							? "opacity-0 pointer-events-none"
							: "opacity-100")
					}
				>
					<RetroGrid
						angle={65}
						cellSize={60}
						className="[&>div:last-child]:hidden"
						darkLineColor="hsl(var(--primary))"
						lightLineColor="hsl(var(--primary))"
						opacity={0.6}
					/>
				</div>
			)}
			<div className="relative z-10 h-full">
				{viewTab === "video" ? (
					sessionState === StreamingAvatarSessionState.CONNECTED ? (
						liveAvatarEmbedUrl ? (
							<div className="absolute inset-0 min-h-0 bg-black">
								<Button
									size="icon"
									type="button"
									variant="secondary"
									title="Stop avatar"
									className="absolute right-4 top-4 z-20"
									onClick={stopSession}
								>
									<XIcon className="h-4 w-4" />
								</Button>
								<iframe
									allow="microphone; camera; autoplay; fullscreen"
									className="absolute left-1/2 top-0 block h-full min-w-full -translate-x-1/2 border-0"
									src={liveAvatarEmbedUrl}
									style={{
										width: "max(100%, calc(100dvh * 16 / 9))",
									}}
									title="LiveAvatar session"
								/>
							</div>
						) : (
							<AvatarVideo ref={mediaStream} />
						)
					) : showAvatarSetup ? (
						<div className="absolute inset-0 flex items-center justify-center">
							<Button
								size="icon"
								type="button"
								variant="secondary"
								title="Chat settings"
								className="absolute right-4 top-4 z-20"
								onClick={() => openChatSettings("avatar")}
							>
								<Settings2Icon className="h-4 w-4" />
							</Button>
							<div
								className="relative w-[360px] max-w-[calc(100vw-2rem)]"
								data-tour="live-avatar-start-card"
							>
								<span
									aria-hidden="true"
									className="pointer-events-none absolute left-1/2 top-3 z-30 h-2 w-2 -translate-x-1/2"
									data-tour="live-avatar-tour-anchor"
								/>
								<SessionQuickStartCard
									avatarOptions={avatarOptions}
									contextOptions={contextOptions}
									customAvatarId={customAvatarId}
									customIdValid={customIdValid}
									isLoadingAvatarOptions={isLoadingAvatarOptions}
									isLoadingContextOptions={isLoadingContextOptions}
									isLoadingVoiceOptions={isLoadingVoiceOptions}
									isConnecting={isConnecting}
									knowledgeBaseId={knowledgeBaseId}
									kbIdValid={kbIdValid}
									onCustomAvatarChange={handleCustomAvatarChange}
									onKnowledgeBaseChange={handleKnowledgeBaseChange}
									onSelectAvatar={handleAvatarSelection}
									onSelectVoice={handleVoiceSelection}
									onStartSession={forwardStartSession}
									onStartWithoutAvatar={onStartWithoutAvatar}
									selectedAvatar={selectedAvatar}
									selectedVoiceId={selectedVoiceId}
									voiceOptions={voiceOptions}
								/>
							</div>
						</div>
					) : (
						<div className="absolute inset-0 flex items-center justify-center px-4">
							<div
								className="relative w-full max-w-md rounded-lg border border-border bg-card/80 p-4 text-card-foreground shadow-lg backdrop-blur"
								data-tour="basic-chat-card"
							>
								<span
									aria-hidden="true"
									className="pointer-events-none absolute left-1/2 top-3 z-30 h-2 w-2 -translate-x-1/2"
									data-tour="basic-chat-tour-anchor"
								/>
								<div className="mb-4 flex items-start justify-between gap-3">
									<div>
										<div className="text-lg font-semibold">
											{chatExperience === "advanced"
												? "Advanced Chat"
												: "Basic Chat"}
										</div>
										<div className="mt-1 text-sm text-muted-foreground">
											{chatExperience === "advanced"
												? "Use chat with panels and workspace tools."
												: "Use chat without starting an avatar session."}
										</div>
									</div>
									<Button
										size="icon"
										type="button"
										variant="ghost"
										title="Chat settings"
										onClick={() => openChatSettings("text")}
									>
										<Settings2Icon className="h-4 w-4" />
									</Button>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button type="button" onClick={openChatPanel}>
										<MessageSquareIcon className="mr-2 h-4 w-4" />
										Open Chat
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => openChatSettings("text")}
									>
										Settings
									</Button>
									{chatExperience === "advanced" && (
										<>
											<Button
												data-tour="brain-tab"
												type="button"
												variant="secondary"
												onClick={() => setViewTab("brain")}
											>
												Brain
											</Button>
											<Button
												data-tour="data-tab"
												type="button"
												variant="secondary"
												onClick={() => setViewTab("data")}
											>
												Data
											</Button>
											<Button
												data-tour="actions-tab"
												type="button"
												variant="secondary"
												onClick={() => setViewTab("actions")}
											>
												Actions
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					)
				) : viewTab === "brain" ? (
					<div
						className="absolute inset-0 z-0 bg-background"
						data-tour="brain-graph"
					>
						<div
							data-tour="brain-controls"
							className="absolute left-1/2 top-16 z-20 flex -translate-x-1/2 gap-4"
						>
							<button
								type="button"
								className="rounded bg-blue-500 px-4 py-2 text-white opacity-80 transition-opacity duration-300 hover:opacity-100"
								title="Full Screen Vector"
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent("brain-graph-fullscreen"),
									)
								}
							>
								<ExpandIcon />
							</button>
							<button
								type="button"
								className="rounded bg-green-500 px-4 py-2 text-white opacity-80 transition-opacity duration-300 hover:opacity-100"
								title="Recenter Vector"
								onClick={() =>
									window.dispatchEvent(
										new CustomEvent("brain-graph-zoom-to-fit"),
									)
								}
							>
								<ZoomIn />
							</button>
							<button
								type="button"
								className="rounded bg-yellow-500 px-4 py-2 text-white opacity-80 transition-opacity duration-300 hover:opacity-100"
								title="Toggle Highlight"
								onClick={() => setHighlightGraphNodes((current) => !current)}
							>
								<Highlighter />
							</button>
						</div>
						<BrainGraphViewer
							graphData={defaultGraphData}
							isHighlightActive={highlightGraphNodes}
							nodesToHighlight={["root"]}
							onHighlightToggle={() =>
								setHighlightGraphNodes((current) => !current)
							}
							showControls={false}
							loadingFallback={
								<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
									Loading graph...
								</div>
							}
						/>
					</div>
				) : viewTab === "data" ? (
					<div
						className="absolute inset-0 z-0 bg-background"
						data-tour="data-grid"
					>
						<DataViewerPanel />
					</div>
				) : (
					<div
						className="absolute inset-0 z-0 bg-background"
						data-tour="kanban-board"
					>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute right-4 top-4 z-20 h-10 w-32 rounded-md"
						/>
						<KanbanActionsPanel />
					</div>
				)}

				{userVideoStream && (
					<div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-border">
						<UserVideo userVideoStream={userVideoStream} />
					</div>
				)}

				<AvatarControls stopSession={stopSession} />
			</div>
		</div>
	);
}
