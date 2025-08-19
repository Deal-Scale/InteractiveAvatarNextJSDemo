import type React from "react";

import { MessageSender } from "@/lib/types";
import { useSessionStore } from "@/lib/stores/session";
import {
	ChatContainerContent,
	ChatContainerRoot,
	ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { Message, MessageContent } from "@/components/ui/message";
import { ScrollButton } from "@/components/ui/scroll-button";
import { StickToBottom } from "use-stick-to-bottom";

export const MessageHistory: React.FC = () => {
	const messages = useSessionStore((s) => s.messages);

	return (
		<StickToBottom className="relative w-[600px] text-foreground self-center max-h-[150px]">
			<ChatContainerRoot className="relative w-[600px] text-foreground self-center max-h-[150px]">
				<ChatContainerContent>
					{messages.map((message) => (
						<Message
							key={message.id}
							className={`flex flex-col gap-1 ${
								message.sender === MessageSender.AVATAR
									? "items-start"
									: "items-end"
							}`}
						>
							<p className="text-xs text-muted-foreground">
								{message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
							</p>
							<MessageContent
								className={`text-sm ${
									message.sender === MessageSender.AVATAR
										? "bg-secondary"
										: "bg-primary text-primary-foreground"
								}`}
							>
								{message.content}
							</MessageContent>
						</Message>
					))}
				</ChatContainerContent>
				<ScrollButton className="pointer-events-auto absolute bottom-3 right-3 shadow" />
				<ChatContainerScrollAnchor />
			</ChatContainerRoot>
		</StickToBottom>
	);
};
