import { useMemoizedFn } from "ahooks";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApiService } from "@/components/logic/ApiServiceContext";
import { useVoiceChat } from "@/components/logic/useVoiceChat";
import {
	APP_CAPABILITIES_SYSTEM_PROMPT,
	buildAppCapabilityReasoning,
	buildAppCapabilityToolParts,
	executeAppCapabilities,
	parseAppCapabilityActions,
	stripAppCapabilityBlocks,
} from "@/lib/app-capabilities";
import { buildAgentChainInstruction } from "@/lib/agent-chain";
import type { ProviderId } from "@/lib/chat/providers";
import { getProvider } from "@/lib/chat/registry";
import { useSendTaskMutation } from "@/lib/services/streaming/query";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { useSessionStore } from "@/lib/stores/session";
import { type MessageAsset, MessageSender } from "@/lib/types";
import { StreamingAvatarSessionState } from "../../logic/context";
import { useMcpCommands } from "./useMcpCommands";

export function useChatController(sessionState: StreamingAvatarSessionState) {
	const { apiService } = useApiService();
	const {
		messages,
		addMessage,
		chatExperience,
		isChatSolidBg,
		setChatSolidBg,
		currentSessionId,
	} = useSessionStore();
	const { startVoiceChat, stopVoiceChat, isVoiceChatActive } = useVoiceChat();

	const sendTaskMutation = useSendTaskMutation();

	const [isSending, setIsSending] = useState(false);
	const activeSendIdRef = useRef(0);
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
	const canChat = isConnected || mockChatEnabled || chatExperience === "basic";

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
			const agentChainInstruction = buildAgentChainInstruction(assets);
			const providerInputText = agentChainInstruction
				? `${text}\n\n${agentChainInstruction}`
				: text;

			const sendId = ++activeSendIdRef.current;
			const isActiveSend = () => sendId === activeSendIdRef.current;
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
					if (!isActiveSend()) return;
					for (const response of responses) {
						if (!isActiveSend()) return;
						addMessage(response);
						await speakThroughAvatar(response.content);
					}
					return;
				}

				const { textMode, voiceMode } = useChatProviderStore.getState();
				const { textSettings, voiceSettings } = useChatProviderStore.getState();
				const textProvider = getProvider(textMode as ProviderId);
				const voiceProvider = getProvider(voiceMode as ProviderId);

				const operations: Array<Promise<void>> = [];
				const history = useSessionStore.getState().messages;
				const systemPrompt = [
					textSettings.systemPrompt.trim(),
					agentChainInstruction,
					APP_CAPABILITIES_SYSTEM_PROMPT,
				]
					.filter(Boolean)
					.join("\n\n");

				// Dispatch to selected text provider
				operations.push(
					(async () => {
						try {
							const reply = await textProvider.sendMessage({
								history,
								input: providerInputText,
								options: {
									jsonMode: textSettings.jsonMode,
									systemPrompt,
									seed: textSettings.seed.trim()
										? Number(textSettings.seed)
										: undefined,
								},
							});
							if (!isActiveSend()) return;
							const appActions = parseAppCapabilityActions(reply.content);
							const actionResults = executeAppCapabilities(appActions);
							const cleanedContent = stripAppCapabilityBlocks(reply.content);
							const actionSummary = actionResults
								.map((result) => result.message)
								.join("\n");
							const appToolParts = buildAppCapabilityToolParts(
								appActions,
								actionResults,
							);
							const appReasoning = buildAppCapabilityReasoning(
								appActions,
								actionResults,
							);
							const providerMessage = {
								...reply,
								provider: reply.provider ?? textProvider.id,
								content:
									cleanedContent || actionSummary || reply.content || "Done.",
								toolParts:
									appToolParts.length > 0
										? [...(reply.toolParts ?? []), ...appToolParts]
										: reply.toolParts,
								reasoning: appReasoning ?? reply.reasoning,
								reasoningMarkdown: appReasoning
									? true
									: reply.reasoningMarkdown,
								reasoningOpen: appReasoning ? true : reply.reasoningOpen,
							};
							if (!isActiveSend()) return;
							addMessage(providerMessage);

							if (
								isActiveSend() &&
								voiceProvider.supportsVoice &&
								voiceSettings.autoSpeak
							) {
								await speakThroughAvatar(providerMessage.content);
							}
						} catch (error) {
							if (!isActiveSend()) return;
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

				// Fire voice pipeline concurrently when available.
				operations.push(
					(async () => {
						if (!isActiveSend()) return;
						if (!voiceProvider.supportsVoice || !voiceSettings.voiceEnabled) {
							return;
						}

						if (!isActiveSend()) return;
						if (currentSessionId) {
							await sendTaskMutation.mutateAsync({
								session_id: currentSessionId,
								text: providerInputText,
								task_mode: "async",
								task_type: "chat",
							});
						} else if (apiService) {
							await apiService.textChat.sendMessage(providerInputText, assets);
						}
					})(),
				);

				await Promise.allSettled(operations);
			} finally {
				if (isActiveSend()) setIsSending(false);
			}
		},
	);

	const stopSendingVoid = useMemoizedFn(() => {
		activeSendIdRef.current += 1;
		setIsSending(false);
	});

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

	const enableMockChatUi = useMemoizedFn(() => {
		setMockChatEnabled(true);
		setChatSolidBg(true);
	});

	return {
		// state
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
		stopSendingVoid,
		startVoiceChatVoid,
		stopVoiceChatVoid,
		handleCopy,
		addAvatarMessage,
		enableMockChatUi,
	};
}
