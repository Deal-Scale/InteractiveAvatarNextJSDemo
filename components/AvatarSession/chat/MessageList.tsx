"use client";

import type React from "react";
import { MessageItem } from "../MessageItem";
import { exampleReasoning } from "./_mock_data/example-reasoning";
import { type Message as MessageType, MessageSender } from "@/lib/types";
import { Message, MessageAvatar } from "@/components/ui/message";
import { Loader } from "@/components/ui/loader";

interface MessageListProps {
	messages: MessageType[];
	isAvatarTalking: boolean;
	lastCopiedId: string | null;
	voteState: Record<string, "up" | "down" | null>;
	setVote: (id: string, dir: "up" | "down") => void;
	handleCopy: (id: string, content: string) => void;
	handleEditToInput: (content: string) => void;
	onBranch: (content: string, id: string) => void;
	onRetry: (id: string) => void;
	onCompare: (content: string, id: string) => void;
	showMarkdownHeaderInBubbles?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
	messages,
	isAvatarTalking,
	lastCopiedId,
	voteState,
	setVote,
	handleCopy,
	handleEditToInput,
	onBranch,
	onRetry,
	onCompare,
	showMarkdownHeaderInBubbles,
}) => {
	return (
		<>
			{messages.map((message) => (
				<MessageItem
					key={message.id}
					handleCopy={handleCopy}
					handleEditToInput={handleEditToInput}
					onBranch={onBranch}
					onRetry={(mid) => onRetry(mid)}
					onCompare={(content, mid) => onCompare(content, mid)}
					isStreaming={
						isAvatarTalking && message.sender === MessageSender.AVATAR
					}
					lastCopiedId={lastCopiedId}
					message={message}
					avatarMarkdownShowHeader={showMarkdownHeaderInBubbles}
					reasoning={
						message.id === exampleReasoning.message.id
							? exampleReasoning.reasoning
							: undefined
					}
					reasoningMarkdown={
						message.id === exampleReasoning.message.id
							? exampleReasoning.reasoningMarkdown
							: undefined
					}
					reasoningOpen={message.id === exampleReasoning.message.id}
					setVote={setVote}
					// Voting handled via parent via MessageItem prop setVote; we forward externally
					streamMode="typewriter"
					streamSpeed={28}
					voteState={voteState}
				/>
			))}
			{isAvatarTalking && (
				<Message className="flex gap-2 items-start">
					<MessageAvatar alt="Avatar" fallback="A" src="/heygen-logo.png" />
					<div className="flex flex-col items-start gap-1">
						<p className="text-xs text-muted-foreground">Avatar</p>
						<div className="prose break-words whitespace-normal rounded-lg bg-secondary p-2 text-sm text-foreground">
							<div className="py-1">
								<Loader variant="typing" />
							</div>
						</div>
					</div>
				</Message>
			)}
		</>
	);
};
