"use client";

import { ChevronDown } from "lucide-react";
import type React from "react";
import { memo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader } from "@/components/ui/loader";
import { Message, MessageAvatar } from "@/components/ui/message";
import { MessageSender, type Message as MessageType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MessageItem } from "../MessageItem";
import { exampleReasoning } from "./_mock_data/example-reasoning";

interface MessageListProps {
	messages: MessageType[];
	exampleMessages?: MessageType[];
	parentRef: React.RefObject<HTMLDivElement | null>;
	isAvatarTalking: boolean;
	lastCopiedId: string | null;
	voteState: Record<string, "up" | "down" | null>;
	setVote: (id: string, dir: "up" | "down") => void;
	handleCopy: (id: string, content: string) => void;
	handleEditToInput: (content: string, id: string) => void;
	onBranch: (content: string, id: string) => void;
	onRetry: (id: string) => void;
	onCompare: (content: string, id: string) => void;
	showMarkdownHeaderInBubbles?: boolean;
}

function MessageListImpl({
	messages,
	exampleMessages = [],
	parentRef,
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
}: MessageListProps) {
	const [examplesOpen, setExamplesOpen] = useState(false);
	const hasExamples = exampleMessages.length > 0;
	const messageCount = messages.length;
	const virtualizer = useVirtualizer({
		count: messageCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 140,
		overscan: 6,
	});
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<div className="w-full">
			<div
				className="relative w-full"
				style={{ height: `${virtualizer.getTotalSize()}px` }}
			>
				{virtualItems.map((virtualRow) => {
					const message = messages[virtualRow.index];
					if (!message) return null;

					return (
						<div
							key={message.id}
							ref={virtualizer.measureElement}
							data-index={virtualRow.index}
							className="absolute left-0 top-0 w-full"
							style={{
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<MessageItem
								handleCopy={handleCopy}
								handleEditToInput={handleEditToInput}
								onBranch={onBranch}
								onRetry={(mid) => onRetry(mid)}
								onCompare={(content, mid) => onCompare(content, mid)}
								isStreaming={
									isAvatarTalking && message.sender === MessageSender.AVATAR
								}
								isCopied={lastCopiedId === message.id}
								message={message}
								avatarMarkdownShowHeader={showMarkdownHeaderInBubbles}
								reasoning={
									message.reasoning ??
									(message.id === exampleReasoning.message.id
										? exampleReasoning.reasoning
										: undefined)
								}
								reasoningMarkdown={
									message.reasoningMarkdown ??
									(message.id === exampleReasoning.message.id
										? exampleReasoning.reasoningMarkdown
										: undefined)
								}
								reasoningOpen={
									message.reasoningOpen ??
									message.id === exampleReasoning.message.id
								}
								setVote={setVote}
								streamMode="typewriter"
								streamSpeed={28}
								voteState={voteState}
							/>
						</div>
					);
				})}
			</div>
			{hasExamples && (
				<div className="mt-6 w-full">
					<Collapsible
						open={examplesOpen}
						onOpenChange={setExamplesOpen}
						className="w-full"
					>
						<div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
							<div className="flex flex-col gap-1">
								<p className="text-sm font-medium text-foreground">
									Example custom components
								</p>
								<p className="text-xs text-muted-foreground">
									Toggle demo responses showcasing interactive UI elements.
								</p>
							</div>
							<CollapsibleTrigger asChild>
								<Button variant="ghost" size="sm" className="gap-1 text-xs">
									{examplesOpen ? "Hide" : "Show"}
									<ChevronDown
										className={cn(
											"h-4 w-4 transition-transform",
											examplesOpen ? "rotate-180" : "rotate-0",
										)}
									/>
								</Button>
							</CollapsibleTrigger>
						</div>
						<CollapsibleContent className="mt-4 space-y-4 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-1/2 data-[state=closed]:slide-out-to-top-1/2">
							{exampleMessages.map((message) => (
								<div key={`example-${message.id}`} className="w-full">
									<MessageItem
										handleCopy={handleCopy}
										handleEditToInput={handleEditToInput}
										onBranch={onBranch}
										onRetry={(mid) => onRetry(mid)}
										onCompare={(content, mid) => onCompare(content, mid)}
										isStreaming={false}
										isCopied={lastCopiedId === message.id}
										message={message}
										avatarMarkdownShowHeader={showMarkdownHeaderInBubbles}
										reasoning={
											message.reasoning ??
											(message.id === exampleReasoning.message.id
												? exampleReasoning.reasoning
												: undefined)
										}
										reasoningMarkdown={
											message.reasoningMarkdown ??
											(message.id === exampleReasoning.message.id
												? exampleReasoning.reasoningMarkdown
												: undefined)
										}
										reasoningOpen={
											message.reasoningOpen ??
											message.id === exampleReasoning.message.id
										}
										setVote={setVote}
										streamMode="typewriter"
										streamSpeed={28}
										voteState={voteState}
									/>
								</div>
							))}
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}
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
		</div>
	);
}

export const MessageList = memo(MessageListImpl);
