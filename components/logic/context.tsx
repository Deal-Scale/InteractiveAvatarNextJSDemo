"use client";

import StreamingAvatar, { ConnectionQuality } from "@heygen/streaming-avatar";
import React, {
	createContext,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";

import { Message, MessageSender } from "@/lib/types";

export enum StreamingAvatarSessionState {
	INACTIVE = "inactive",
	CONNECTING = "connecting",
	CONNECTED = "connected",
}

type StreamingAvatarContextProps = {
	avatarRef: React.MutableRefObject<StreamingAvatar | null>;
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
	handleUserTalkingMessage: ({
		detail,
	}: {
		detail: { message: string };
	}) => void;
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

	connectionQuality: ConnectionQuality;
	setConnectionQuality: (connectionQuality: ConnectionQuality) => void;
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
	connectionQuality: ConnectionQuality.UNKNOWN,
	setConnectionQuality: () => {},
});

export const StreamingAvatarProvider = ({
	children,
	basePath,
}: {
	children: React.ReactNode;
	basePath?: string;
}) => {
	const avatarRef = useRef<StreamingAvatar | null>(null);
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
	const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>(
		ConnectionQuality.UNKNOWN,
	);

	const value = useMemo(
		() => ({
			avatarRef,
			basePath,
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
			handleUserTalkingMessage: ({ detail }: { detail: { message: string } }) =>
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
			basePath,
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
