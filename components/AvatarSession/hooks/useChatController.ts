import { useEffect, useMemo, useState } from "react";
import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";

import { mockOpenRouter } from "../utils/mock";
import { StreamingAvatarSessionState } from "../../logic/context";

import { useMcpCommands } from "./useMcpCommands";

import { useApiService } from "@/components/logic/ApiServiceContext";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import { useMessageHistory } from "@/components/logic/useMessageHistory";
import { useSessionStore } from "@/lib/stores/session";
import { MessageSender, type MessageAsset } from "@/lib/types";
import { useSendTaskMutation } from "@/lib/services/streaming/query";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { getProvider } from "@/lib/chat/registry";
import type { ProviderId } from "@/lib/chat/providers";

export function useChatController(sessionState: StreamingAvatarSessionState) {
	const { apiService } = useApiService();
	const {
		messages,
		addMessage,
		isChatSolidBg,
		setChatSolidBg,
		currentSessionId,
	} = useSessionStore();
	const { navigateHistory, resetHistory } = useMessageHistory(messages);
	const { startVoiceChat, stopVoiceChat, isVoiceChatActive } = useVoiceChat();

	const sendTaskMutation = useSendTaskMutation();

	const [chatInput, setChatInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [userVideoStream, setUserVideoStream] = useState<MediaStream | null>(
		null,
	);
	const [userAudioStream, setUserAudioStream] = useState<MediaStream | null>(
		null,
	);

	const isConnected = useMemo(
		() => sessionState === StreamingAvatarSessionState.CONNECTED,
		[sessionState],
	);

	// Mock chat
	const [mockChatEnabled, setMockChatEnabled] = useState(false);
	const [mockVoiceActive, setMockVoiceActive] = useState(false);
	const canChat = isConnected || mockChatEnabled;

	// If a real session becomes connected, ensure mock chat is turned off
	useEffect(() => {
		if (isConnected && mockChatEnabled) {
			setMockChatEnabled(false);
		}
	}, [isConnected, mockChatEnabled]);

	const addAvatarMessage = (content: string) =>
		addMessage({ id: nanoid(), content, sender: MessageSender.AVATAR });

	const handleMcpCommand = useMcpCommands();

	const speakThroughAvatar = useMemoizedFn(async (content: string) => {
		if (!content?.trim()) return;

		try {
			if (currentSessionId) {
				await sendTaskMutation.mutateAsync({
					session_id: currentSessionId,
					text: content,
					task_mode: "async",
					task_type: "repeat",
				});
			} else if (apiService?.textChat?.speakQueued) {
				await apiService.textChat.speakQueued(content);
			} else if (apiService) {
				apiService.textChat.repeatMessage(content);
			}
		} catch (error) {
			console.error("[Chat] speakThroughAvatar failed", error);
		}
	});

	const handleSendMessage = useMemoizedFn(
		async (text: string, assets?: MessageAsset[]) => {
			const trimmed = text.trim();
			if (!trimmed) return;

			setIsSending(true);

			const userMessage = {
				id: nanoid(),
				content: text,
				sender: MessageSender.CLIENT,
				assets,
			} as const;
			addMessage(userMessage);

			const lower = trimmed.toLowerCase();

			try {
				if (lower.startsWith("/mcp")) {
					const responses = await handleMcpCommand(trimmed);
					for (const response of responses) {
						addMessage(response);
						await speakThroughAvatar(response.content);
					}
					return;
				}

				const { textMode, voiceMode } = useChatProviderStore.getState();
				const textProvider = getProvider(textMode as ProviderId);
				const voiceProvider = getProvider(voiceMode as ProviderId);

				const operations: Array<Promise<void>> = [];
				const history = useSessionStore.getState().messages;

				// Dispatch to selected text provider
				operations.push(
					(async () => {
						try {
							const reply = await textProvider.sendMessage({
								history,
								input: text,
							});
							const providerMessage = {
								...reply,
								provider: reply.provider ?? textProvider.id,
							};
							addMessage(providerMessage);

							if (voiceProvider.supportsVoice) {
								await speakThroughAvatar(providerMessage.content);
							}
						} catch (error) {
							console.error("[Chat] provider sendMessage failed", error);
							addMessage({
								id: nanoid(),
								sender: MessageSender.AVATAR,
								content: `Error from ${textProvider.id}: ${
									(error as Error)?.message ?? "unknown"
								}`,
								provider: textProvider.id,
							});
						}
					})(),
				);

				// Fire voice pipeline concurrently when available or using mock fallback
				operations.push(
					(async () => {
						if (mockChatEnabled) {
							const reply = await mockOpenRouter(text);
							addMessage({
								id: nanoid(),
								content: reply,
								sender: MessageSender.AVATAR,
								provider: "mock-openrouter",
							});
							return;
						}

						if (!voiceProvider.supportsVoice) return;

						if (currentSessionId) {
							await sendTaskMutation.mutateAsync({
								session_id: currentSessionId,
								text,
								task_mode: "async",
								task_type: "chat",
							});
						} else if (apiService) {
							await apiService.textChat.sendMessage(text, assets);
						}
					})(),
				);

				await Promise.allSettled(operations);
			} finally {
				resetHistory();
				setChatInput("");
				setIsSending(false);
			}
		},
	);

	const sendMessageVoid = useMemoizedFn((t: string, a?: MessageAsset[]) => {
		void handleSendMessage(t, a);
	});

	const startVoiceChatVoid = useMemoizedFn(async () => {
		try {
			if (mockChatEnabled) {
				setMockVoiceActive(true);
				addAvatarMessage("(mock) Voice chat started via VAPI.");

				return;
			}

			// Capture only local webcam video for PIP. Do NOT include audio here.
			const videoOnly = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});
			setUserVideoStream(videoOnly);

			// Capture microphone audio explicitly for voice chat.
			const audioStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: true,
				},
				video: false,
			});
			setUserAudioStream(audioStream);

			// Start voice chat with our captured mic stream so recording actually begins.
			await startVoiceChat({ mediaStream: audioStream });
		} catch (error) {
			// Surface in devtools; consider toast in UI
			console.error("Failed to start voice chat:", error);
		}
	});

	const stopVoiceChatVoid = useMemoizedFn(() => {
		if (mockChatEnabled) {
			setMockVoiceActive(false);
			addAvatarMessage("(mock) Voice chat stopped.");

			return;
		}
		stopVoiceChat();

		if (userVideoStream) {
			userVideoStream.getTracks().forEach((t) => {
				t.stop();
			});
			setUserVideoStream(null);
		}
		if (userAudioStream) {
			userAudioStream.getTracks().forEach((t) => {
				t.stop();
			});
			setUserAudioStream(null);
		}
	});

	const handleCopy = useMemoizedFn(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (e) {
			console.error("Copy failed", e);
		}
	});

	const handleArrowUp = useMemoizedFn(() => {
		const prev = navigateHistory("up");

		if (prev) setChatInput(prev);
	});

	const handleArrowDown = useMemoizedFn(() => {
		const next = navigateHistory("down");

		if (next) setChatInput(next);
	});

	const enableMockChatUi = useMemoizedFn(() => {
		setMockChatEnabled(true);
		setChatSolidBg(true);
	});

	return {
		// state
		chatInput,
		setChatInput,
		isSending,
		userVideoStream,
		mockChatEnabled,
		setMockChatEnabled,
		mockVoiceActive,
		setMockVoiceActive,
		canChat,
		isChatSolidBg,
		setChatSolidBg,
		isVoiceChatActive,

		// actions
		sendMessageVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
		handleCopy,
		handleArrowUp,
		handleArrowDown,
		addAvatarMessage,
		enableMockChatUi,
	};
}
