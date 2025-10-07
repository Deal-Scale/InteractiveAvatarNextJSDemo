import { useRef, useState } from "react";
import {
	ClipboardCopy,
	ThumbsUp,
	ThumbsDown,
	Pencil,
	Paperclip,
	RotateCcw,
	GitBranch,
	SplitSquareHorizontal,
	Volume2,
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
	const [isTtsLoading, setIsTtsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleSpeak = async () => {
		if (!message?.content || typeof message.content !== "string") return;
		try {
			setIsTtsLoading(true);
			// Stop any prior playback
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
				audioRef.current.load();
				audioRef.current = null;
			}
			const params = new URLSearchParams({
				prompt: message.content,
				voice: "alloy",
			});
			const res = await fetch(
				`/api/pollinations/text/tts?${params.toString()}`,
			);
			if (!res.ok) {
				// Best-effort surface of error
				const text = await res.text().catch(() => "");
				// eslint-disable-next-line no-console
				console.error("TTS error:", text || res.statusText);
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const audio = new Audio(url);
			audioRef.current = audio;
			audio.onended = () => {
				URL.revokeObjectURL(url);
				audioRef.current = null;
			};
			await audio.play();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error("Failed to play TTS:", e);
		} finally {
			setIsTtsLoading(false);
		}
	};

	// Keyboard shortcuts for quick actions when message is focused
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		const k = e.key.toLowerCase();
		switch (k) {
			case "r": {
				e.preventDefault();
				if (message.sender === MessageSender.AVATAR) {
					onRetry
						? onRetry(message.id, message.content)
						: handleEditToInput(message.content, message.id);
				}
				return;
			}
			case "o": {
				// compare outputs
				if (message.sender === MessageSender.AVATAR) {
					e.preventDefault();
					onCompare
						? onCompare(message.content, message.id)
						: handleEditToInput(message.content, message.id);
				}
				return;
			}
			case "b": {
				// branch to agent
				if (message.sender === MessageSender.AVATAR) {
					e.preventDefault();
					onBranch
						? onBranch(message.content, message.id)
						: handleEditToInput(message.content, message.id);
				}
				return;
			}
			case "c": {
				// copy content
				e.preventDefault();
				handleCopy(message.id, message.content);
				return;
			}
			case "arrowup": {
				// upvote avatar response
				if (message.sender === MessageSender.AVATAR) {
					e.preventDefault();
					setVote(message.id, "up");
				}
				return;
			}
			case "arrowdown": {
				// downvote avatar response
				if (message.sender === MessageSender.AVATAR) {
					e.preventDefault();
					setVote(message.id, "down");
				}
				return;
			}
			default:
				return;
		}
	};

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
			} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
			tabIndex={0}
			aria-label={`${message.sender === MessageSender.AVATAR ? "Avatar" : "User"} message. Press R to retry, C to copy${
				message.sender === MessageSender.AVATAR
					? ", O to compare, B to branch, Arrow Up to upvote, Arrow Down to downvote"
					: ""
			}.`}
			onKeyDown={handleKeyDown}
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
				{(() => {
					const isTalking = Boolean(isStreaming);
					const isToolsRunning = Array.isArray(message.toolParts)
						? message.toolParts.some((p) => p?.state !== "output-available")
						: false;
					const showPill =
						message.sender === MessageSender.AVATAR &&
						(isTalking || isToolsRunning);

					return (
						<div className="flex items-center gap-2 w-full">
							<p className="text-xs text-muted-foreground">
								{message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
							</p>
							{showPill && (
								<span
									className={
										"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " +
										(isTalking
											? "bg-primary/10 text-primary"
											: "bg-secondary/70 text-foreground")
									}
									aria-live="polite"
								>
									{isTalking ? "Talking…" : "Tools running"}
								</span>
							)}
							{message.sender === MessageSender.AVATAR && message.content ? (
								<Button
									aria-label={
										isTtsLoading ? "Generating audio…" : "Speak response"
									}
									title="Speak response"
									size="icon"
									variant="ghost"
									className="ml-auto"
									disabled={isTtsLoading}
									onClick={handleSpeak}
								>
									<Volume2 className="h-4 w-4" />
								</Button>
							) : null}
						</div>
					);
				})()}
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
				<MessageActions role="toolbar" aria-label="Message quick actions">
					{message.sender === MessageSender.AVATAR ? (
						<>
							<MessageAction tooltip={"Retry (regenerate)"}>
								<Button
									aria-label="Retry"
									aria-keyshortcuts="R"
									size="icon"
									variant={onRetry ? "secondary" : "ghost"}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="O"
									size="icon"
									variant={onCompare ? "secondary" : "ghost"}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="B"
									size="icon"
									variant={onBranch ? "secondary" : "ghost"}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="C"
									size="icon"
									variant="ghost"
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="ArrowUp"
									size="icon"
									variant={
										voteState[message.id] === "up" ? "secondary" : "ghost"
									}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="ArrowDown"
									size="icon"
									variant={
										voteState[message.id] === "down" ? "secondary" : "ghost"
									}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
									aria-keyshortcuts="C"
									size="icon"
									variant="ghost"
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
									onClick={() => handleCopy(message.id, message.content)}
								>
									<ClipboardCopy className="h-4 w-4" />
								</Button>
							</MessageAction>
							<MessageAction tooltip="Edit into input">
								<Button
									aria-label="Edit into input"
									aria-keyshortcuts="E"
									size="icon"
									variant="ghost"
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
