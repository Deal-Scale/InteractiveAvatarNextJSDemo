import { StreamingAvatarSessionState } from "../../logic/context";

import { Message, type MessageAsset } from "@/lib/types";

export function useChatPanelProps(args: {
	canChat: boolean;
	isSending: boolean;
	isChatSolidBg: boolean;
	isVoiceActive: boolean;
	messages: Message[];
	sessionState: StreamingAvatarSessionState;
	onCopy: (text: string) => void;
	onSendMessage: (text: string, assets?: MessageAsset[]) => void;
	onStopSending: () => void;
	onStartVoiceChat: () => void | Promise<void>;
	onStopVoiceChat: () => void | Promise<void>;
	onDock: (mode: "right" | "bottom" | "floating") => void;
	onHeaderPointerDown: (e: React.PointerEvent) => void;
	onToggleExpand: () => void;
	onStartMockChat: () => void;
}) {
	return args;
}
