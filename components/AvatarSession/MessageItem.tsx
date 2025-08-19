import {
	ClipboardCopy,
	ThumbsUp,
	ThumbsDown,
	Pencil,
	Paperclip,
	RotateCcw,
	GitBranch,
	SplitSquareHorizontal,
} from "lucide-react";

import {
	Message as MessageType,
	MessageSender,
	type MessageAsset,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message";
import {
	ResponseStream,
	type Mode as ResponseStreamMode,
} from "@/components/ui/response-stream";
import { useTextStream } from "@/components/ui/response-stream";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import { JSXPreview } from "@/components/ui/jsx-preview";
import { Tool } from "@/components/ui/tool";
import { Source, SourceContent, SourceTrigger } from "@/components/ui/source";
import { StatBadge } from "@/components/PromptKit/StatBadge";
import { DataCard, MetricGrid, Metric } from "@/components/ui/jsx-demo";
import { Mermaid } from "@/components/ui/mermaid";

// Strict Markdown detection: only treat as markdown when strong cues exist
function isStrictMarkdown(text: string | undefined | null): boolean {
	if (!text) return false;
	const str = String(text);
	if (str.trim().length < 4) return false;
	if (/```|~~~/.test(str)) return true; // fenced code blocks
	const hasTableRow = /^\s*\|.+\|\s*$/m.test(str);
	const hasTableSep = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/m.test(
		str,
	);
	if (hasTableRow && hasTableSep) return true; // proper table
	return false;
}

// For debugging: which strong signal matched
function markdownStrongReason(
	text: string | undefined | null,
): "fence" | "table" | null {
	if (!text) return null;
	const str = String(text);
	if (/```|~~~/.test(str)) return "fence";
	const hasTableRow = /^\s*\|.+\|\s*$/m.test(str);
	const hasTableSep = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/m.test(
		str,
	);
	if (hasTableRow && hasTableSep) return "table";
	return null;
}

interface MessageItemProps {
	message: MessageType;
	lastCopiedId: string | null;
	voteState: Record<string, "up" | "down" | null>;
	handleCopy: (id: string, content: string) => void;
	setVote: (id: string, dir: "up" | "down") => void;
	handleEditToInput: (content: string, id: string) => void;
	onBranch?: (content: string, id: string) => void;
	onRetry?: (id: string, content: string) => void;
	onCompare?: (content: string, id: string) => void;
	// Optional streaming controls for avatar messages
	streamMode?: ResponseStreamMode; // "typewriter" | "fade"
	streamSpeed?: number; // 1-100
	fadeDuration?: number; // ms
	segmentDelay?: number; // ms
	characterChunkSize?: number; // override speed
	// Optional reasoning panel for avatar messages
	reasoning?: string;
	reasoningMarkdown?: boolean;
	reasoningOpen?: boolean;
	isStreaming?: boolean;
	// Control showing the Markdown header on avatar messages (for copy UX)
	avatarMarkdownShowHeader?: boolean;
	avatarMarkdownHeaderLabel?: string; // defaults to "Markdown" if showHeader is true and label is not provided
}

export const MessageItem: React.FC<MessageItemProps> = ({
	message,
	lastCopiedId,
	voteState,
	handleCopy,
	setVote,
	handleEditToInput,
	onBranch,
	onRetry,
	onCompare,
	streamMode = "typewriter",
	streamSpeed = 20,
	fadeDuration,
	segmentDelay,
	characterChunkSize,
	reasoning,
	reasoningMarkdown = false,
	reasoningOpen,
	isStreaming,
	avatarMarkdownShowHeader = false,
	avatarMarkdownHeaderLabel,
}) => {
	const hasJsx = Boolean(message.jsx && message.jsx.trim().length > 0);

	// If we have JSX, stream it using the same text streaming hook used by ResponseStream.
	const jsxStream = useTextStream({
		textStream: message.jsx ?? "",
		mode: streamMode,
		speed: streamSpeed,
		fadeDuration,
		segmentDelay,
		characterChunkSize,
	});

	// Show header ONLY when content is strict markdown (env flag no longer forces it on)
	const showMdHeader = Boolean(isStrictMarkdown(message.content));

	// Dev-only logging to inspect detection behavior
	if (process.env.NODE_ENV !== "production") {
		try {
			const preview = (message.content || "").slice(0, 80);
			// eslint-disable-next-line no-console
			console.debug("[MessageItem] markdown-detect", {
				id: message.id,
				sender: message.sender,
				isStrictMarkdown: isStrictMarkdown(message.content),
				reason: markdownStrongReason(message.content),
				showMdHeader,
				hasJsx,
				preview,
			});
		} catch {}
	}

	const renderAssets = (assets?: MessageAsset[]) => {
		if (!assets || assets.length === 0) return null;
		const isImg = (a: MessageAsset) =>
			(a.mimeType?.startsWith("image/") ?? false) ||
			/\.(png|jpe?g|webp|gif)$/i.test(a.url ?? "");
		return (
			<div className="mt-2 flex w-full flex-wrap gap-2">
				{assets.map((a) => (
					<a
						key={`${message.id}-asset-${a.id}`}
						href={a.url}
						target="_blank"
						rel="noreferrer noopener"
						className="inline-flex items-center gap-2 rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
						title={a.name}
					>
						{isImg(a) ? (
							// Thumbnail preview for images
							<img
								src={a.thumbnailUrl || a.url}
								alt={a.name}
								className="h-6 w-6 rounded object-cover"
							/>
						) : (
							<Paperclip className="h-4 w-4" />
						)}
						<span className="max-w-[180px] truncate">{a.name}</span>
					</a>
				))}
			</div>
		);
	};

	return (
		<Message
			key={message.id}
			className={`flex gap-2 ${
				message.sender === MessageSender.AVATAR
					? "items-start"
					: "items-end flex-row-reverse"
			}`}
		>
			<MessageAvatar
				alt={message.sender === MessageSender.AVATAR ? "Avatar" : "User"}
				fallback={message.sender === MessageSender.AVATAR ? "A" : "U"}
				src={message.sender === MessageSender.AVATAR ? "/heygen-logo.png" : ""}
			/>
			<div
				className={`flex flex-col gap-1 ${
					message.sender === MessageSender.AVATAR ? "items-start" : "items-end"
				}`}
			>
				<p className="text-xs text-muted-foreground">
					{message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
				</p>
				{message.sender === MessageSender.AVATAR ? (
					<div className="break-words whitespace-normal rounded-lg bg-muted p-2 text-sm text-foreground">
						{reasoning && (
							<div className="mb-2">
								<Reasoning isStreaming={isStreaming} open={reasoningOpen}>
									<ReasoningTrigger className="text-xs text-muted-foreground">
										Reasoning
									</ReasoningTrigger>
									<ReasoningContent
										contentClassName="mt-1"
										markdown={reasoningMarkdown}
									>
										{reasoning}
									</ReasoningContent>
								</Reasoning>
							</div>
						)}
						{hasJsx ? (
							<div className="w-full">
								{message.content && (
									<MessageContent
										markdown={isStrictMarkdown(message.content)}
										showHeader={showMdHeader}
										headerLabel={avatarMarkdownHeaderLabel}
										className="mb-2 bg-muted"
									>
										{message.content}
									</MessageContent>
								)}
								<JSXPreview
									isStreaming={Boolean(isStreaming && !jsxStream.isComplete)}
									jsx={jsxStream.displayedText}
									components={{
										StatBadge: StatBadge as unknown as React.ComponentType<any>,
										Source: Source as unknown as React.ComponentType<any>,
										SourceTrigger:
											SourceTrigger as unknown as React.ComponentType<any>,
										SourceContent:
											SourceContent as unknown as React.ComponentType<any>,
										DataCard: DataCard as unknown as React.ComponentType<any>,
										MetricGrid:
											MetricGrid as unknown as React.ComponentType<any>,
										Metric: Metric as unknown as React.ComponentType<any>,
										Mermaid: Mermaid as unknown as React.ComponentType<any>,
									}}
								/>
							</div>
						) : (
							// Render markdown for avatar messages (tables, code fences, etc.)
							<MessageContent
								markdown={isStrictMarkdown(message.content)}
								showHeader={showMdHeader}
								headerLabel={avatarMarkdownHeaderLabel}
								className="bg-muted"
							>
								{message.content}
							</MessageContent>
						)}
						{Array.isArray(message.toolParts) &&
							message.toolParts.length > 0 && (
								<div className="w-full">
									{message.toolParts.map((part, idx) => (
										<Tool
											key={`${part.toolCallId ?? `${message.id}-tool`}-${idx}`}
											defaultOpen={part.state !== "output-available"}
											toolPart={part}
										/>
									))}
								</div>
							)}
						{Array.isArray(message.sources) && message.sources.length > 0 && (
							<div className="mt-2 flex w-full flex-wrap gap-1">
								{message.sources.map((s, idx) => (
									<Source key={`${message.id}-src-${idx}`} href={s.href}>
										<SourceTrigger
											className="bg-muted"
											label={s.label}
											showFavicon={s.showFavicon}
										/>
										<SourceContent
											description={s.description}
											title={s.title}
										/>
									</Source>
								))}
							</div>
						)}
						{renderAssets(message.assets)}
					</div>
				) : (
					<MessageContent className="text-sm bg-primary text-primary-foreground">
						{message.content}
					</MessageContent>
				)}
				{message.sender !== MessageSender.AVATAR &&
					renderAssets(message.assets)}
				<MessageActions>
					{message.sender === MessageSender.AVATAR ? (
						<>
							<MessageAction tooltip={"Retry (regenerate)"}>
								<Button
									aria-label="Retry"
									size="icon"
									variant={onRetry ? "secondary" : "ghost"}
									onClick={() =>
										onRetry
											? onRetry(message.id, message.content)
											: handleEditToInput(message.content, message.id)
									}
								>
									<RotateCcw className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction tooltip={"Compare outputs"}>
								<Button
									aria-label="Compare outputs"
									size="icon"
									variant={onCompare ? "secondary" : "ghost"}
									onClick={() =>
										onCompare
											? onCompare(message.content, message.id)
											: handleEditToInput(message.content, message.id)
									}
								>
									<SplitSquareHorizontal className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction tooltip={"Branch to agent"}>
								<Button
									aria-label="Branch to agent"
									size="icon"
									variant={onBranch ? "secondary" : "ghost"}
									onClick={() =>
										onBranch
											? onBranch(message.content, message.id)
											: handleEditToInput(message.content, message.id)
									}
								>
									<GitBranch className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction
								tooltip={
									lastCopiedId === message.id ? "Copied!" : "Copy message"
								}
							>
								<Button
									aria-label="Copy message"
									size="icon"
									variant="ghost"
									onClick={() => handleCopy(message.id, message.content)}
								>
									<ClipboardCopy className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction
								tooltip={
									voteState[message.id] === "up" ? "Upvoted" : "Upvote response"
								}
							>
								<Button
									aria-label="Upvote response"
									size="icon"
									variant={
										voteState[message.id] === "up" ? "secondary" : "ghost"
									}
									onClick={() => setVote(message.id, "up")}
								>
									<ThumbsUp className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction
								tooltip={
									voteState[message.id] === "down"
										? "Downvoted"
										: "Downvote response"
								}
							>
								<Button
									aria-label="Downvote response"
									size="icon"
									variant={
										voteState[message.id] === "down" ? "secondary" : "ghost"
									}
									onClick={() => setVote(message.id, "down")}
								>
									<ThumbsDown className="h-4 w-4" />
								</Button>
							</MessageAction>
						</>
					) : (
						<>
							<MessageAction
								tooltip={
									lastCopiedId === message.id ? "Copied!" : "Copy message"
								}
							>
								<Button
									aria-label="Copy message"
									size="icon"
									variant="ghost"
									onClick={() => handleCopy(message.id, message.content)}
								>
									<ClipboardCopy className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction tooltip="Edit into input">
								<Button
									aria-label="Edit into input"
									size="icon"
									variant="ghost"
									onClick={() => handleEditToInput(message.content, message.id)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
							</MessageAction>
						</>
					)}
				</MessageActions>
			</div>
		</Message>
	);
};
