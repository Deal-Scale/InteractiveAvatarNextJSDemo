"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

import { Message, MessageSender } from "@/lib/types";

export enum StreamingAvatarSessionState {
	INACTIVE = "inactive",
	CONNECTING = "connecting",
	CONNECTED = "connected",
}

type StreamingAvatarContextProps = {
	avatarRef: React.MutableRefObject<null>;
	basePath?: string;

	isMuted: boolean;
	setIsMuted: (isMuted: boolean) => void;
	isVoiceChatLoading: boolean;
	setIsVoiceChatLoading: (isVoiceChatLoading: boolean) => void;
	isVoiceChatActive: boolean;
	setIsVoiceChatActive: (isVoiceChatActive: boolean) => void;

	sessionState: StreamingAvatarSessionState;
	setSessionState: (sessionState: StreamingAvatarSessionState) => void;
	stream: MediaStream | null;
	setStream: (stream: MediaStream | null) => void;

	messages: Message[];
	clearMessages: () => void;
	handleUserTalkingMessage: ({ detail }: { detail: { message: string } }) => void;
	handleStreamingTalkingMessage: ({
		detail,
	}: {
		detail: { message: string };
	}) => void;
	handleEndMessage: () => void;

	isListening: boolean;
	setIsListening: (isListening: boolean) => void;
	isUserTalking: boolean;
	setIsUserTalking: (isUserTalking: boolean) => void;
	isAvatarTalking: boolean;
	setIsAvatarTalking: (isAvatarTalking: boolean) => void;

	connectionQuality: "unknown" | "good" | "bad" | "poor";
	setConnectionQuality: (
		connectionQuality: "unknown" | "good" | "bad" | "poor",
	) => void;
};

const StreamingAvatarContext = createContext<StreamingAvatarContextProps>({
	avatarRef: { current: null },
	isMuted: true,
	setIsMuted: () => {},
	isVoiceChatLoading: false,
	setIsVoiceChatLoading: () => {},
	sessionState: StreamingAvatarSessionState.INACTIVE,
	setSessionState: () => {},
	isVoiceChatActive: false,
	setIsVoiceChatActive: () => {},
	stream: null,
	setStream: () => {},
	messages: [],
	clearMessages: () => {},
	handleUserTalkingMessage: () => {},
	handleStreamingTalkingMessage: () => {},
	handleEndMessage: () => {},
	isListening: false,
	setIsListening: () => {},
	isUserTalking: false,
	setIsUserTalking: () => {},
	isAvatarTalking: false,
	setIsAvatarTalking: () => {},
	connectionQuality: "unknown",
	setConnectionQuality: () => {},
});

export const StreamingAvatarProvider = ({
	children,
}: {
	children: React.ReactNode;
	basePath?: string;
}) => {
	const [isMuted, setIsMuted] = useState(true);
	const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
	const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
	const [sessionState, setSessionState] = useState(
		StreamingAvatarSessionState.CONNECTED,
	);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [isListening, setIsListening] = useState(false);
	const [isUserTalking, setIsUserTalking] = useState(false);
	const [isAvatarTalking, setIsAvatarTalking] = useState(false);
	const [connectionQuality, setConnectionQuality] =
		useState<StreamingAvatarContextProps["connectionQuality"]>("unknown");

	const value = useMemo(
		() => ({
			avatarRef: { current: null },
			isMuted,
			setIsMuted,
			isVoiceChatLoading,
			setIsVoiceChatLoading,
			isVoiceChatActive,
			setIsVoiceChatActive,
			sessionState,
			setSessionState,
			stream,
			setStream,
			messages,
			clearMessages: () => setMessages([]),
			handleUserTalkingMessage: ({
				detail,
			}: {
				detail: { message: string };
			}) =>
				setMessages((prev) => [
					...prev,
					{
						id: Date.now().toString(),
						sender: MessageSender.CLIENT,
						content: detail.message,
					},
				]),
			handleStreamingTalkingMessage: ({
				detail,
			}: {
				detail: { message: string };
			}) =>
				setMessages((prev) => [
					...prev,
					{
						id: Date.now().toString(),
						sender: MessageSender.AVATAR,
						content: detail.message,
					},
				]),
			handleEndMessage: () => {},
			isListening,
			setIsListening,
			isUserTalking,
			setIsUserTalking,
			isAvatarTalking,
			setIsAvatarTalking,
			connectionQuality,
			setConnectionQuality,
		}),
		[
			connectionQuality,
			isAvatarTalking,
			isListening,
			isMuted,
			isUserTalking,
			isVoiceChatActive,
			isVoiceChatLoading,
			messages,
			sessionState,
			stream,
		],
	);

	return (
		<StreamingAvatarContext.Provider value={value}>
			{children}
		</StreamingAvatarContext.Provider>
	);
};

export const useStreamingAvatarContext = () => {
	return useContext(StreamingAvatarContext);
};
