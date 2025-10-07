"use client";

import { useKeyPress } from "ahooks";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatInput } from "./ChatInput";
import { BranchDialog } from "./BranchDialog";
import { CompareDialog } from "./CompareDialog";
import { useComposerStore } from "@/lib/stores/composer";

import { useStreamingAvatarContext } from "@/components/logic/context";
import { useTextChat } from "@/components/logic/useTextChat";
import {
	ChatContainerContent,
	ChatContainerRoot,
	ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import { ScrollButton } from "@/components/ui/scroll-button";
import { useToast } from "@/components/ui/toaster";
import { MessageSender } from "@/lib/types";
import type { Message as MessageType, MessageAsset } from "@/lib/types";
import { StickToBottom } from "use-stick-to-bottom";
import { MessageList } from "./chat/MessageList";
import { useInputAutoHeight } from "./chat/hooks/useInputAutoHeight";
import { useScrollAnchored } from "./chat/hooks/useScrollAnchored";
import { useBranching } from "./chat/hooks/useBranching";
import { useComparison } from "./chat/hooks/useComparison";
import { useAttachments } from "./chat/hooks/useAttachments";
import { useVotes } from "./chat/hooks/useVotes";
import { useEditing } from "./chat/hooks/useEditing";
import {
	buildAugmentedMessages,
	buildBaseMessagesIfEmpty,
	dedupeAdjacent,
} from "./chat/utils";
import { cn } from "@/lib/utils";
// * Provider switching & capabilities
import { ProviderSwitcher } from "./ProviderSwitcher";
import { useChatProviderStore } from "@/lib/stores/chatProvider";
import { getProvider } from "@/lib/chat/registry";

interface ChatProps {
	chatInput: string;
	isSending: boolean;
	isVoiceChatActive: boolean;
	messages: MessageType[];
	// When true, render only the input area (no messages/scroll area)
	inputOnly?: boolean;
	onArrowDown: () => void;
	onArrowUp: () => void;
	onChatInputChange: (value: string) => void;
	onCopy: (text: string) => void;
	onSendMessage: (text: string, assets?: MessageAsset[]) => void;
	onStartVoiceChat: () => void;
	onStopVoiceChat: () => void;
}

export const Chat: React.FC<ChatProps> = ({
	chatInput,
	isSending,
	isVoiceChatActive,
	messages,
	inputOnly = false,
	onArrowDown,
	onArrowUp,
	onChatInputChange,
	onCopy,
	onSendMessage,
	onStartVoiceChat,
	onStopVoiceChat,
}) => {
	useKeyPress("ArrowUp", onArrowUp);
	useKeyPress("ArrowDown", onArrowDown);

	const { publish } = useToast();
	const { isAvatarTalking, isVoiceChatLoading } = useStreamingAvatarContext();
	const { repeatMessage: apiRepeatMessage } = useTextChat();

	const composerAttachments = useComposerStore((s) => s.assetAttachments);
	const clearComposerAttachments = useComposerStore(
		(s) => s.clearAssetAttachments,
	);
	const removeComposerAttachment = useComposerStore(
		(s) => s.removeAssetAttachment,
	);
	const inputRef = useRef<HTMLTextAreaElement | null>(null);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const branching = useBranching();
	const { voteState, setVote } = useVotes();
	const promptSuggestions = useMemo(
		() => [
			"What can you do?",
			"Summarize the last reply",
			"Explain step by step",
			"Give me an example",
		],
		[],
	);

	// Base messages and demos
	const baseMessages = useMemo(
		() => buildBaseMessagesIfEmpty(messages),
		[messages],
	);

	// Adjacent de-duplication by id + content
	const dedupedMessages = useMemo(
		() => dedupeAdjacent(baseMessages),
		[baseMessages],
	);

	// Always append demo content
	const augmentedMessages = useMemo(
		() => buildAugmentedMessages(dedupedMessages),
		[dedupedMessages],
	);

	// Comparison depends on dedupedMessages, so initialize after it
	const comparison = useComparison(dedupedMessages);

	// Scroll container ref + anchored state (depends on content changes)
	const { isAtBottom, handleScroll } = useScrollAnchored(scrollRef, {
		inputOnly,
		depsForContentChange: [augmentedMessages],
	});

	// Allow enabling Markdown header in chat bubbles via env flag for debugging/UX preference
	const showMarkdownHeaderInBubbles =
		process.env.NEXT_PUBLIC_MARKDOWN_HEADER_IN_BUBBLES === "true";

	const { attachments, onFilesAdded, removeAttachment, sendWithAttachments } =
		useAttachments({
			composerAttachments,
			clearComposerAttachments,
			onSendMessage,
			onChatInputChange,
		});

	const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);

	const { isEditing, handleEditToInput, cancelEdit, confirmEdit } = useEditing({
		chatInput,
		onChatInputChange,
		sendWithAttachments,
		inputRef,
	});

	// Compare dialog state handled by hook

	// Track ChatInput height to prevent message overlap
	const inputWrapRef = useRef<HTMLDivElement | null>(null);
	const inputHeight = useInputAutoHeight(inputWrapRef);

	// Determine active provider capability (voice vs. text-only)
	const mode = useChatProviderStore((s) => s.mode);
	const provider = getProvider(mode);
	const supportsVoice = provider.supportsVoice;

	useEffect(() => {
		if (!scrollRef.current) return;
		if (isAtBottom) {
			try {
				const el = scrollRef.current;
				el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
			} catch {}
		}
	}, [isAtBottom]);

	const handleCopy = async (id: string, content: string) => {
		try {
			await navigator.clipboard.writeText(content);
			setLastCopiedId(id);
			setTimeout(() => {
				setLastCopiedId((prev) => (prev === id ? null : prev));
			}, 1500);
			console.debug("[Chat] message copied", { id });
			onCopy(content);
			publish({ description: "Message copied to clipboard.", title: "Copied" });
		} catch (e) {
			console.error("[Chat] copy failed", e);
			publish({
				description: "Could not copy to clipboard.",
				duration: 4000,
				title: "Copy failed",
			});
		}
	};

	// voting and editing handled by hooks

	// Retry: re-send the previous user message before this AI message
	const handleRetry = (id: string) => {
		const idx = dedupedMessages.findIndex((m) => m.id === id);
		if (idx <= 0) return;
		for (let i = idx - 1; i >= 0; i--) {
			const m = dedupedMessages[i];
			if (m.sender === MessageSender.CLIENT) {
				console.debug("[Chat] retry", {
					forMessageId: id,
					usingUserMessageId: m.id,
				});
				// Prefer API repeat when available
				apiRepeatMessage(m.content);
				publish({ title: "Retrying", description: "Regenerating response..." });
				return;
			}
		}
	};

	const handleCompare = (content: string, id: string) =>
		comparison.handleCompare(content, id);

	const handleChooseComparison = (choice: "A" | "B") => {
		const chosen = comparison.handleChooseComparison(choice);
		if (!chosen) return;
		onSendMessage(`Chosen option ${choice}:\n\n${chosen}`);
		publish({ title: "Choice sent", description: `Picked ${choice}` });
		comparison.setCompareOpen(false);
	};

	return (
		<div className="flex flex-col w-full flex-1 min-h-0 p-4">
			<StickToBottom
				className={cn(
					"flex-1 min-h-0 h-full overflow-hidden text-foreground",
					inputOnly && "hidden",
				)}
			>
				{/* Dynamically pad bottom by input height to avoid overlap */}
				<ProviderSwitcher />
				<ChatContainerRoot
					ref={scrollRef}
					onScroll={handleScroll}
					className="flex-1 min-h-0 h-full text-foreground"
					style={{
						paddingBottom: isAtBottom ? 16 : Math.max(16, inputHeight + 8),
					}}
				>
					<ChatContainerContent>
						<MessageList
							messages={augmentedMessages}
							isAvatarTalking={isAvatarTalking}
							lastCopiedId={lastCopiedId}
							voteState={voteState}
							setVote={setVote}
							handleCopy={handleCopy}
							handleEditToInput={handleEditToInput}
							onBranch={branching.handleBranch}
							onRetry={handleRetry}
							onCompare={handleCompare}
							showMarkdownHeaderInBubbles={showMarkdownHeaderInBubbles}
						/>
					</ChatContainerContent>
					<ChatContainerScrollAnchor />
					<div className="absolute bottom-4 right-4">
						<ScrollButton className="shadow-sm" />
					</div>
				</ChatContainerRoot>
			</StickToBottom>
			{/* Ensure input section never shrinks and visually docks under messages */}
			<div
				ref={inputWrapRef}
				className="shrink-0 border-t border-border pt-3 bg-background"
			>
				{/* Branch Dialog */}
				<BranchDialog
					open={branching.state.branchOpen}
					onOpenChange={branching.setBranchOpen}
					messageContent={branching.state.branchMsgContent}
					agentName={branching.agentName}
					actionText={branching.state.branchAction}
					onActionTextChange={branching.setBranchAction}
					onConfirm={branching.confirmBranch}
				/>

				{/* Compare Dialog */}
				<CompareDialog
					open={comparison.state.compareOpen}
					onOpenChange={comparison.setCompareOpen}
					original={comparison.state.compareOriginal}
					alternative={comparison.state.compareAlternative}
					isGenerating={comparison.state.isGeneratingAlt}
					onChoose={handleChooseComparison}
				/>
				<ChatInput
					attachments={attachments}
					composerAttachments={composerAttachments}
					cancelEdit={cancelEdit}
					chatInput={chatInput}
					confirmEdit={confirmEdit}
					inputRef={inputRef}
					isEditing={isEditing}
					isSending={isSending}
					isVoiceChatActive={supportsVoice ? isVoiceChatActive : false}
					isVoiceChatLoading={supportsVoice ? isVoiceChatLoading : false}
					promptSuggestions={promptSuggestions}
					removeAttachment={removeAttachment}
					removeComposerAttachment={removeComposerAttachment}
					sendWithAttachments={sendWithAttachments}
					onChatInputChange={onChatInputChange}
					onFilesAdded={onFilesAdded}
					onStartVoiceChat={supportsVoice ? onStartVoiceChat : () => {}}
					onStopVoiceChat={supportsVoice ? onStopVoiceChat : () => {}}
				/>
			</div>
		</div>
	);
};
