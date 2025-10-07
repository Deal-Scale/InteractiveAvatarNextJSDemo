"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
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

// Lazy rendering wrapper for MessageItem using IntersectionObserver
interface LazyProps {
	children: React.ReactNode;
	observeRootMargin?: string; // e.g., '200px'
}

function LazyMessageItem({ children, observeRootMargin = "0px" }: LazyProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}

		const obs = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					setVisible(true);
					obs.disconnect();
				}
			},
			{ root: null, rootMargin: observeRootMargin, threshold: 0.01 },
		);

		obs.observe(node);
		return () => obs.disconnect();
	}, [observeRootMargin]);

	return (
		<div ref={ref} className="w-full">
			{visible ? children : <div aria-hidden className="h-8" />}
		</div>
	);
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
}: MessageListProps) => {
	return (
		<>
			{messages.map((message) => (
				<LazyMessageItem key={message.id} observeRootMargin="200px">
					<MessageItem
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
						streamMode="typewriter"
						streamSpeed={28}
						voteState={voteState}
					/>
				</LazyMessageItem>
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
