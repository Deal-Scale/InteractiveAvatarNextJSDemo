import { Brain, Database, LayoutDashboard } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { StreamingAvatarSessionState } from "../logic/context";

import { AvatarVideo } from "./AvatarVideo";
import { UserVideo } from "./UserVideo";
import { AvatarControls } from "./AvatarControls";

import { useAgentStore } from "@/lib/stores/agent";
import { useSessionStore } from "@/lib/stores/session";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { useAvatarOptions } from "@/components/AvatarConfig/hooks/useAvatarOptions";
import { SessionQuickStartCard } from "@/components/AvatarSession/SessionQuickStartCard";

export function AvatarVideoPanel({
	mediaStream,
	userVideoStream,
	stopSession,
	sessionState,
	onStartSession,
	onStartWithoutAvatar,
}: {
	mediaStream: React.RefObject<HTMLVideoElement>;
	userVideoStream: MediaStream | null;
	stopSession: () => void;
	sessionState: StreamingAvatarSessionState;
	onStartSession?: (options: {
		avatarId?: string;
		knowledgeBaseId?: string;
	}) => void;
	onStartWithoutAvatar?: () => void;
}) {
	const { viewTab } = useSessionStore();
	const { currentAgent, updateAgent } = useAgentStore();
	const [selectedAvatar, setSelectedAvatar] = useState<string>(
		currentAgent?.avatarId ?? "",
	);
	const [customAvatarId, setCustomAvatarId] = useState<string>(
		currentAgent?.avatarId ?? "",
	);
	const [knowledgeBaseId, setKnowledgeBaseId] = useState<string>(
		currentAgent?.knowledgeBaseId ?? "",
	);
	const selectedAvatarId =
		selectedAvatar === "CUSTOM" ? customAvatarId.trim() : selectedAvatar;
	const { avatarOptions, customIdValid } = useAvatarOptions(selectedAvatarId);

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

	const forwardStartSession = (payload: {
		avatarId?: string;
		knowledgeBaseId?: string;
	}) => {
		onStartSession?.(payload);
	};

	useEffect(() => {
		if (!currentAgent?.avatarId) {
			setSelectedAvatar("");
			setCustomAvatarId("");
			return;
		}

		const matches = avatarOptions.some(
			(option) => option.avatar_id === currentAgent.avatarId,
		);

		if (matches) {
			setSelectedAvatar(currentAgent.avatarId);
			setCustomAvatarId("");
		} else {
			setSelectedAvatar("CUSTOM");
			setCustomAvatarId(currentAgent.avatarId);
		}
	}, [avatarOptions, currentAgent?.avatarId]);

	useEffect(() => {
		setKnowledgeBaseId(currentAgent?.knowledgeBaseId ?? "");
	}, [currentAgent?.knowledgeBaseId]);

	// Simple client-side check for Knowledge Base ID. If provided, must match a minimal pattern.
	// Accept UUID-like or alphanumeric with dashes/underscores of length >= 10.
	const kbIdValid = useMemo(() => {
		const value = knowledgeBaseId.trim();
		if (!value) return true; // optional
		const uuidLike = /^[0-9a-fA-F-]{10,}$/;
		const generic = /^[A-Za-z0-9_-]{10,}$/;

		return uuidLike.test(value) || generic.test(value);
	}, [knowledgeBaseId]);

	const isConnecting = sessionState === StreamingAvatarSessionState.CONNECTING;

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
						<AvatarVideo ref={mediaStream} />
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<SessionQuickStartCard
								avatarOptions={avatarOptions}
								customAvatarId={customAvatarId}
								customIdValid={customIdValid}
								isConnecting={isConnecting}
								knowledgeBaseId={knowledgeBaseId}
								kbIdValid={kbIdValid}
								onCustomAvatarChange={handleCustomAvatarChange}
								onKnowledgeBaseChange={handleKnowledgeBaseChange}
								onSelectAvatar={handleAvatarSelection}
								onStartSession={forwardStartSession}
								onStartWithoutAvatar={onStartWithoutAvatar}
								selectedAvatar={selectedAvatar}
							/>
						</div>
					)
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted to-background">
						<div className="text-center text-foreground">
							<div className="mb-3 flex items-center justify-center">
								{viewTab === "brain" && (
									<Brain className="h-8 w-8 text-primary" />
								)}
								{viewTab === "data" && (
									<Database className="h-8 w-8 text-accent-foreground" />
								)}
								{viewTab === "actions" && (
									<LayoutDashboard className="h-8 w-8 text-secondary-foreground" />
								)}
							</div>
							<div className="text-lg font-medium capitalize">{viewTab}</div>
							<div className="text-sm text-muted-foreground">
								Alternate view panel
							</div>
						</div>
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
