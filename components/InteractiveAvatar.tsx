import {
	AvatarQuality,
	ElevenLabsModel,
	STTProvider,
	type StartAvatarRequest,
	VoiceChatTransport,
	VoiceEmotion,
} from "@heygen/streaming-avatar";
import { useMemoizedFn, useUnmount } from "ahooks";
import { useMemo, useRef, useState } from "react";
// removed Settings icon (no longer used here)

import { AVATARS } from "@/app/lib/constants";
import {
	ApiServiceProvider,
	useApiService,
} from "@/components/logic/ApiServiceContext";
import type { ApiService } from "@/lib/services/api";
import { usePlacementStore } from "@/lib/stores/placement";
import { type ChatExperience, useSessionStore } from "@/lib/stores/session";
import { AvatarSession } from "./AvatarSession";
import { BasicChatSettingsModal } from "./AvatarSession/BasicChatSettingsModal";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { SessionConfigModal } from "./ui/SessionConfigModal";

const DEFAULT_CONFIG: StartAvatarRequest = {
	quality: AvatarQuality.Low,
	avatarName: AVATARS[0].avatar_id,
	knowledgeId: undefined,
	voice: {
		rate: 1.5,
		emotion: VoiceEmotion.EXCITED,
		model: ElevenLabsModel.eleven_flash_v2_5,
	},
	language: "en",
	voiceChatTransport: VoiceChatTransport.WEBSOCKET,
	sttSettings: {
		provider: STTProvider.DEEPGRAM,
	},
};

function InteractiveAvatarCore() {
	const avatarVideoRef = useRef<HTMLVideoElement>(null);
	const [liveAvatarEmbedUrl, setLiveAvatarEmbedUrl] = useState<string | null>(
		null,
	);
	const [liveAvatarConnecting, setLiveAvatarConnecting] = useState(false);
	const { sessionState, stopAvatar: stopSession } = useStreamingAvatarSession();

	const { setApiService } = useApiService();

	const {
		chatExperience,
		closeChatSettings,
		isChatSettingsOpen,
		openChatSettings,
		setChatExperience,
		setCurrentSessionId,
		setViewTab,
	} = useSessionStore();
	const setDockMode = usePlacementStore((state) => state.setDockMode);
	const setBottomHeightFrac = usePlacementStore(
		(state) => state.setBottomHeightFrac,
	);

	const handleChatExperienceChange = useMemoizedFn((mode: ChatExperience) => {
		setChatExperience(mode);
		setViewTab("video");

		if (mode === "basic") {
			setDockMode("bottom");
			setBottomHeightFrac(1);
		} else if (mode === "advanced") {
			setDockMode("bottom");
			setBottomHeightFrac(0.5);
		} else {
			setBottomHeightFrac(0);
		}
	});

	const startSessionV2 = useMemoizedFn(async (config: StartAvatarRequest) => {
		try {
			console.log("[DEBUG] Starting avatar session with config:", config);
			console.log("[DEBUG] Knowledge Base ID:", config.knowledgeId || "none");
			setLiveAvatarEmbedUrl(null);
			setLiveAvatarConnecting(true);

			const embedResponse = await fetch("/api/liveavatar/embed", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(config),
			});
			const embedData = await embedResponse.json().catch(() => ({}));

			if (!embedResponse.ok) {
				throw new Error(
					embedData?.error || "Failed to create LiveAvatar embed session",
				);
			}

			const embedUrl = embedData?.data?.url;

			if (!embedUrl) {
				throw new Error("No embed URL returned from LiveAvatar API");
			}

			setApiService(null);
			setLiveAvatarEmbedUrl(embedUrl);
		} catch (error) {
			console.error("Error starting avatar session:", error);
			setLiveAvatarEmbedUrl(null);
		} finally {
			setLiveAvatarConnecting(false);
		}
	});

	const stopSessionV2 = useMemoizedFn(() => {
		setLiveAvatarEmbedUrl(null);
		setLiveAvatarConnecting(false);
		stopSession().then(() => {
			setApiService(null);
			setCurrentSessionId(null);
		});
	});

	useUnmount(() => {
		stopSessionV2();
	});

	const isConnecting = useMemo(
		() =>
			liveAvatarConnecting ||
			sessionState === StreamingAvatarSessionState.CONNECTING,
		[liveAvatarConnecting, sessionState],
	);
	const effectiveSessionState = liveAvatarEmbedUrl
		? StreamingAvatarSessionState.CONNECTED
		: liveAvatarConnecting
			? StreamingAvatarSessionState.CONNECTING
			: sessionState;

	return (
		<div className="w-full h-screen relative bg-background">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
				<SessionConfigModal
					initialConfig={DEFAULT_CONFIG}
					isConnecting={isConnecting}
					startSession={startSessionV2}
				/>
				<BasicChatSettingsModal
					mode={chatExperience}
					open={isChatSettingsOpen}
					onModeChange={handleChatExperienceChange}
					onOpenChange={(open) => {
						if (open) {
							openChatSettings();
						} else {
							closeChatSettings();
						}
					}}
				/>
			</div>
			<div className="w-full h-full">
				<AvatarSession
					initialConfig={DEFAULT_CONFIG}
					mediaStream={avatarVideoRef}
					liveAvatarEmbedUrl={liveAvatarEmbedUrl}
					sessionState={effectiveSessionState}
					startSession={startSessionV2}
					stopSession={stopSessionV2}
				/>
			</div>
			{/* Removed floating settings button (moved to bottom-left when sidebar collapsed) */}
		</div>
	);
}

function InteractiveAvatar() {
	const [apiService, setApiService] = useState<ApiService | null>(null);

	return (
		<ApiServiceProvider service={apiService} setApiService={setApiService}>
			<InteractiveAvatarCore />
		</ApiServiceProvider>
	);
}

export default function InteractiveAvatarWrapper() {
	return (
		<StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
			<InteractiveAvatar />
		</StreamingAvatarProvider>
	);
}
