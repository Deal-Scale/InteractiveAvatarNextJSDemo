import { ClipboardCopyIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message";
import { Message as MessageType, MessageSender } from "@/lib/types";

interface ChatMessageProps {
	message: MessageType;
	onCopy: (text: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
	return (
		<Message
			key={message.id}
			className={`flex gap-2 ${message.sender === MessageSender.AVATAR ? "items-start" : "items-end flex-row-reverse"}`}
		>
			<MessageAvatar
				alt={message.sender === MessageSender.AVATAR ? "Avatar" : "User"}
				fallback={message.sender === MessageSender.AVATAR ? "A" : "U"}
				src={message.sender === MessageSender.AVATAR ? "/heygen-logo.png" : ""}
			/>
			<div
				className={`flex flex-col gap-1 ${message.sender === MessageSender.AVATAR ? "items-start" : "items-end"}`}
			>
				<p className="text-xs text-muted-foreground">
					{message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
				</p>
				<MessageContent
					markdown
					className={`text-sm ${
						message.sender === MessageSender.AVATAR
							? "bg-secondary"
							: "bg-primary text-primary-foreground"
					}`}
				>
					{message.content}
				</MessageContent>
				{message.sender === MessageSender.AVATAR && (
					<MessageActions>
						<MessageAction tooltip="Copy message">
							<Button
								size="icon"
								variant="ghost"
								onClick={() => onCopy(message.content)}
							>
								<ClipboardCopyIcon className="h-4 w-4" />
							</Button>
						</MessageAction>
					</MessageActions>
				)}
			</div>
		</Message>
	);
};

export const MemoizedChatMessage = React.memo(ChatMessage);
