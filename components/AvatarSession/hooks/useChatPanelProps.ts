import { StreamingAvatarSessionState } from "../../logic/context";

import { Message, type MessageAsset } from "@/lib/types";

export function useChatPanelProps(args: {
	// state
	canChat: boolean;
	chatInput: string;
	isSending: boolean;
	isChatSolidBg: boolean;
	isVoiceActive: boolean;
	messages: Message[];
	sessionState: StreamingAvatarSessionState;
	// handlers
	onArrowDown: () => void;
	onArrowUp: () => void;
	onChatInputChange: (v: string) => void;
	onCopy: (text: string) => void;
	onSendMessage: (text: string, assets?: MessageAsset[]) => void;
	onStartVoiceChat: () => void | Promise<void>;
	onStopVoiceChat: () => void | Promise<void>;
	onDock: (mode: "right" | "bottom" | "floating") => void;
	onHeaderPointerDown: (e: React.PointerEvent) => void;
	onToggleExpand: () => void;
	onStartMockChat: () => void;
}) {
	const {
		canChat,
		chatInput,
		isSending,
		isChatSolidBg,
		isVoiceActive,
		messages,
		sessionState,
		onArrowDown,
		onArrowUp,
		onChatInputChange,
		onCopy,
		onSendMessage,
		onStartVoiceChat,
		onStopVoiceChat,
		onDock,
		onHeaderPointerDown,
		onToggleExpand,
		onStartMockChat,
	} = args;

	const baseProps = {
		canChat,
		chatInput,
		isSending,
		isChatSolidBg,
		isVoiceActive,
		messages,
		sessionState,
		onArrowDown,
		onArrowUp,
		onChatInputChange,
		onCopy,
		onSendMessage,
		onStartVoiceChat,
		onStopVoiceChat,
		onDock,
		onHeaderPointerDown,
		onToggleExpand,
		onStartMockChat,
	} as const;

	return baseProps;
}
