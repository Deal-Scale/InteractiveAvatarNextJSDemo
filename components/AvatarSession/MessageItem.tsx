import { PromptKitStatsDemo } from "@/components/PromptKit/PromptKitStatsDemo";
import { StatBadge } from "@/components/PromptKit/StatBadge";
import { Button } from "@/components/ui/button";
import { DataCard, Metric, MetricGrid } from "@/components/ui/jsx-demo";
import { JSXPreview } from "@/components/ui/jsx-preview";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageAvatar,
	MessageContent,
} from "@/components/ui/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ui/reasoning";
import {
	type Mode as ResponseStreamMode,
	useTextStream,
} from "@/components/ui/response-stream";
import { Source, SourceContent, SourceTrigger } from "@/components/ui/source";
import { Tool } from "@/components/ui/tool";
import {
	type MessageAsset,
	MessageSender,
	type Message as MessageType,
} from "@/lib/types";
import {
	ClipboardCopy,
	GitBranch,
	Paperclip,
	Pencil,
	RotateCcw,
	SplitSquareHorizontal,
	ThumbsDown,
	ThumbsUp,
	Volume2,
} from "lucide-react";
import { memo, useMemo, useRef, useState } from "react";
import { LiveMermaidChart } from "../ui/live-mermaid-chart";
import { Mermaid } from "../ui/mermaid";

const PROVIDER_LABELS: Record<string, string> = {
	heygen: "Heygen",
	pollinations: "Pollinations",
	gemini: "Gemini",
	openrouter: "OpenRouter",
	claude: "Claude",
	openai: "OpenAI",
	deepseek: "DeepSeek",
	mcp: "MCP",
	"mock-openrouter": "Mock OpenRouter",
};

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

const jsxPreviewComponentMap = {
	StatBadge: StatBadge as unknown as React.ComponentType<unknown>,
	PromptKitStatsDemo:
		PromptKitStatsDemo as unknown as React.ComponentType<unknown>,
	Source: Source as unknown as React.ComponentType<unknown>,
	SourceTrigger: SourceTrigger as unknown as React.ComponentType<unknown>,
	SourceContent: SourceContent as unknown as React.ComponentType<unknown>,
	DataCard: DataCard as unknown as React.ComponentType<unknown>,
	MetricGrid: MetricGrid as unknown as React.ComponentType<unknown>,
	Metric: Metric as unknown as React.ComponentType<unknown>,
	Mermaid: Mermaid as unknown as React.ComponentType<unknown>,
	LiveMermaidChart: LiveMermaidChart as unknown as React.ComponentType<unknown>,
} as const;

const StreamingJsxPreview = memo(function StreamingJsxPreview(props: {
	messageJsx: string;
	isStreaming?: boolean;
	streamMode: ResponseStreamMode;
	streamSpeed: number;
	fadeDuration?: number;
	segmentDelay?: number;
	characterChunkSize?: number;
}) {
	const {
		messageJsx,
		isStreaming,
		streamMode,
		streamSpeed,
		fadeDuration,
		segmentDelay,
		characterChunkSize,
	} = props;
	const jsxStream = useTextStream({
		textStream: isStreaming ? messageJsx : "",
		mode: streamMode,
		speed: streamSpeed,
		fadeDuration,
		segmentDelay,
		characterChunkSize,
	});
	const previewJsx = isStreaming ? jsxStream.displayedText : messageJsx;
	const previewIsStreaming = Boolean(isStreaming && !jsxStream.isComplete);

	return (
		<JSXPreview
			isStreaming={previewIsStreaming}
			jsx={previewJsx}
			components={jsxPreviewComponentMap}
		/>
	);
});

const MessageBody = memo(
	function MessageBody(props: {
		message: MessageType;
		isStreaming?: boolean;
		reasoning?: string;
		reasoningMarkdown?: boolean;
		reasoningOpen?: boolean;
		avatarMarkdownShowHeader?: boolean;
		avatarMarkdownHeaderLabel?: string;
		streamMode?: ResponseStreamMode;
		streamSpeed?: number;
		fadeDuration?: number;
		segmentDelay?: number;
		characterChunkSize?: number;
	}) {
		const {
			message,
			isStreaming,
			reasoning,
			reasoningMarkdown = false,
			reasoningOpen,
			avatarMarkdownShowHeader = false,
			avatarMarkdownHeaderLabel,
			streamMode = "typewriter",
			streamSpeed = 20,
			fadeDuration,
			segmentDelay,
			characterChunkSize,
		} = props;

		const hasJsx = Boolean(message.jsx && message.jsx.trim().length > 0);
		const renderMarkdown = message.sender === MessageSender.AVATAR;
		const showMdHeader = Boolean(
			avatarMarkdownShowHeader || isStrictMarkdown(message.content),
		);

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

		return message.sender === MessageSender.AVATAR ? (
			<div className="whitespace-normal break-words rounded-lg bg-muted p-2 text-foreground text-sm">
				{reasoning && (
					<div className="mb-2">
						<Reasoning isStreaming={isStreaming} open={reasoningOpen}>
							<ReasoningTrigger className="text-muted-foreground text-xs">
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
				{message.content && (
					<MessageContent
						markdown={renderMarkdown}
						showHeader={showMdHeader}
						headerLabel={avatarMarkdownHeaderLabel}
						className={hasJsx ? "mb-2 bg-muted" : "bg-muted"}
					>
						{message.content}
					</MessageContent>
				)}
				{hasJsx ? (
					<div className="w-full">
						<StreamingJsxPreview
							characterChunkSize={characterChunkSize}
							fadeDuration={fadeDuration}
							isStreaming={isStreaming}
							messageJsx={message.jsx ?? ""}
							segmentDelay={segmentDelay}
							streamMode={streamMode}
							streamSpeed={streamSpeed}
						/>
					</div>
				) : null}
				{Array.isArray(message.toolParts) && message.toolParts.length > 0 && (
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
								<SourceContent description={s.description} title={s.title} />
							</Source>
						))}
					</div>
				)}
				{renderAssets(message.assets)}
			</div>
		) : (
			<>
				<MessageContent className="bg-primary text-primary-foreground text-sm">
					{message.content}
				</MessageContent>
				{renderAssets(message.assets)}
			</>
		);
	},
	(prev, next) => {
		if (prev.message !== next.message) return false;
		if (prev.isStreaming !== next.isStreaming) return false;
		if (prev.reasoning !== next.reasoning) return false;
		if (prev.reasoningMarkdown !== next.reasoningMarkdown) return false;
		if (prev.reasoningOpen !== next.reasoningOpen) return false;
		if (prev.avatarMarkdownShowHeader !== next.avatarMarkdownShowHeader)
			return false;
		if (prev.avatarMarkdownHeaderLabel !== next.avatarMarkdownHeaderLabel)
			return false;
		if (prev.streamMode !== next.streamMode) return false;
		if (prev.streamSpeed !== next.streamSpeed) return false;
		if (prev.fadeDuration !== next.fadeDuration) return false;
		if (prev.segmentDelay !== next.segmentDelay) return false;
		if (prev.characterChunkSize !== next.characterChunkSize) return false;
		return true;
	},
);

const MessageHeader = memo(
	function MessageHeader(props: {
		sender: MessageSender;
		isStreaming?: boolean;
		isTtsLoading: boolean;
		providerBadge: { baseLabel: string; fallbackLabel: string | null } | null;
		messageContent: string;
		onSpeak: () => void;
	}) {
		const {
			sender,
			isStreaming,
			isTtsLoading,
			providerBadge,
			messageContent,
			onSpeak,
		} = props;
		const isTalking = Boolean(isStreaming);
		const isToolsRunning = false;
		const showPill =
			sender === MessageSender.AVATAR && (isTalking || isToolsRunning);
		return (
			<div className="flex w-full items-center gap-2">
				<p className="text-muted-foreground text-xs">
					{sender === MessageSender.AVATAR ? "Avatar" : "You"}
				</p>
				{showPill && (
					<span
						className={
							"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[11px] " +
							(isTalking
								? "bg-primary/10 text-primary"
								: "bg-secondary/70 text-foreground")
						}
						aria-live="polite"
					>
						{isTalking ? "Talkingâ€¦" : "Tools running"}
					</span>
				)}
				{providerBadge ? (
					<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 font-medium text-[11px] text-muted-foreground">
						<span className="uppercase tracking-wide">
							{providerBadge.baseLabel}
						</span>
						{providerBadge.fallbackLabel ? (
							<span className="font-normal text-[10px] normal-case">
								(fallback from {providerBadge.fallbackLabel})
							</span>
						) : null}
					</span>
				) : null}
				{sender === MessageSender.AVATAR && messageContent ? (
					<Button
						aria-label={isTtsLoading ? "Generating audioâ€¦" : "Speak response"}
						data-tour="message-speak"
						title="Speak response"
						size="icon"
						variant="ghost"
						className={providerBadge ? "" : "ml-auto"}
						disabled={isTtsLoading}
						onClick={onSpeak}
					>
						<Volume2 className="h-4 w-4" />
					</Button>
				) : null}
			</div>
		);
	},
	(prev, next) =>
		prev.sender === next.sender &&
		prev.isStreaming === next.isStreaming &&
		prev.isTtsLoading === next.isTtsLoading &&
		prev.providerBadge?.baseLabel === next.providerBadge?.baseLabel &&
		prev.providerBadge?.fallbackLabel === next.providerBadge?.fallbackLabel &&
		prev.messageContent === next.messageContent &&
		prev.onSpeak === next.onSpeak,
);

const MessageQuickActions = memo(
	function MessageQuickActions(props: {
		messageId: string;
		messageContent: string;
		sender: MessageSender;
		isCopied: boolean;
		voteState: "up" | "down" | null;
		handleCopy: (id: string, content: string) => void;
		setVote: (id: string, dir: "up" | "down") => void;
		handleEditToInput: (content: string, id: string) => void;
		onBranch?: (content: string, id: string) => void;
		onRetry?: (id: string, content: string) => void;
		onCompare?: (content: string, id: string) => void;
	}) {
		const {
			messageId,
			messageContent,
			sender,
			isCopied,
			voteState,
			handleCopy,
			setVote,
			handleEditToInput,
			onBranch,
			onRetry,
			onCompare,
		} = props;

		return (
			<MessageActions
				role="toolbar"
				aria-label="Message quick actions"
				data-tour="message-actions"
			>
				{sender === MessageSender.AVATAR ? (
					<>
						<MessageAction tooltip={"Retry (regenerate)"}>
							<Button
								aria-label="Retry"
								aria-keyshortcuts="R"
								data-tour="message-restream"
								size="icon"
								variant={onRetry ? "secondary" : "ghost"}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() =>
									onRetry
										? onRetry(messageId, messageContent)
										: handleEditToInput(messageContent, messageId)
								}
							>
								<RotateCcw className="h-4 w-4" />
							</Button>
						</MessageAction>
						{process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" && (
							<MessageAction tooltip={"Compare outputs"}>
								<Button
									aria-label="Compare outputs"
									aria-keyshortcuts="O"
									size="icon"
									variant={onCompare ? "secondary" : "ghost"}
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
									onClick={() =>
										onCompare
											? onCompare(messageContent, messageId)
											: handleEditToInput(messageContent, messageId)
									}
								>
									<SplitSquareHorizontal className="h-4 w-4" />
								</Button>
							</MessageAction>
						)}
						<MessageAction tooltip={"Branch to agent"}>
							<Button
								aria-label="Branch to agent"
								aria-keyshortcuts="B"
								data-tour="message-branch-agent"
								size="icon"
								variant={onBranch ? "secondary" : "ghost"}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() =>
									onBranch
										? onBranch(messageContent, messageId)
										: handleEditToInput(messageContent, messageId)
								}
							>
								<GitBranch className="h-4 w-4" />
							</Button>
						</MessageAction>
						<MessageAction tooltip={isCopied ? "Copied!" : "Copy message"}>
							<Button
								aria-label="Copy message"
								aria-keyshortcuts="C"
								data-tour="message-copy"
								size="icon"
								variant="ghost"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() => handleCopy(messageId, messageContent)}
							>
								<ClipboardCopy className="h-4 w-4" />
							</Button>
						</MessageAction>
						<MessageAction
							tooltip={voteState === "up" ? "Upvoted" : "Upvote response"}
						>
							<Button
								aria-label="Upvote response"
								aria-keyshortcuts="ArrowUp"
								data-tour="message-upvote"
								size="icon"
								variant={voteState === "up" ? "secondary" : "ghost"}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() => setVote(messageId, "up")}
							>
								<ThumbsUp className="h-4 w-4" />
							</Button>
						</MessageAction>
						<MessageAction
							tooltip={voteState === "down" ? "Downvoted" : "Downvote response"}
						>
							<Button
								aria-label="Downvote response"
								aria-keyshortcuts="ArrowDown"
								data-tour="message-downvote"
								size="icon"
								variant={voteState === "down" ? "secondary" : "ghost"}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() => setVote(messageId, "down")}
							>
								<ThumbsDown className="h-4 w-4" />
							</Button>
						</MessageAction>
					</>
				) : (
					<>
						<MessageAction tooltip={isCopied ? "Copied!" : "Copy message"}>
							<Button
								aria-label="Copy message"
								aria-keyshortcuts="C"
								size="icon"
								variant="ghost"
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={() => handleCopy(messageId, messageContent)}
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
								onClick={() => handleEditToInput(messageContent, messageId)}
							>
								<Pencil className="h-4 w-4" />
							</Button>
						</MessageAction>
					</>
				)}
			</MessageActions>
		);
	},
	(prev, next) =>
		prev.messageId === next.messageId &&
		prev.messageContent === next.messageContent &&
		prev.sender === next.sender &&
		prev.isCopied === next.isCopied &&
		prev.voteState === next.voteState &&
		prev.handleCopy === next.handleCopy &&
		prev.setVote === next.setVote &&
		prev.handleEditToInput === next.handleEditToInput &&
		prev.onBranch === next.onBranch &&
		prev.onRetry === next.onRetry &&
		prev.onCompare === next.onCompare,
);

interface MessageItemProps {
	message: MessageType;
	isCopied: boolean;
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

function MessageItemImpl({
	message,
	isCopied,
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
}: MessageItemProps) {
	const [isTtsLoading, setIsTtsLoading] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const providerBadge = useMemo(() => {
		if (!message.provider) return null;
		const baseLabel = PROVIDER_LABELS[message.provider] ?? message.provider;
		const fallbackLabel = message.fallbackFrom
			? (PROVIDER_LABELS[message.fallbackFrom] ?? message.fallbackFrom)
			: null;
		return { baseLabel, fallbackLabel } as const;
	}, [message.fallbackFrom, message.provider]);
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

	return (
		<Message
			key={message.id}
			className={`flex gap-2 ${
				message.sender === MessageSender.AVATAR
					? "items-start"
					: "flex-row-reverse items-end"
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
						<div className="flex w-full items-center gap-2">
							<p className="text-muted-foreground text-xs">
								{message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
							</p>
							{showPill && (
								<span
									className={
										"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[11px] " +
										(isTalking
											? "bg-primary/10 text-primary"
											: "bg-secondary/70 text-foreground")
									}
									aria-live="polite"
								>
									{isTalking ? "Talking…" : "Tools running"}
								</span>
							)}
							{providerBadge ? (
								<span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2 py-0.5 font-medium text-[11px] text-muted-foreground">
									<span className="uppercase tracking-wide">
										{providerBadge.baseLabel}
									</span>
									{providerBadge.fallbackLabel ? (
										<span className="font-normal text-[10px] normal-case">
											(fallback from {providerBadge.fallbackLabel})
										</span>
									) : null}
								</span>
							) : null}
							{message.sender === MessageSender.AVATAR && message.content ? (
								<Button
									aria-label={
										isTtsLoading ? "Generating audio…" : "Speak response"
									}
									data-tour="message-speak"
									title="Speak response"
									size="icon"
									variant="ghost"
									className={providerBadge ? "" : "ml-auto"}
									disabled={isTtsLoading}
									onClick={handleSpeak}
								>
									<Volume2 className="h-4 w-4" />
								</Button>
							) : null}
						</div>
					);
				})()}
				<MessageBody
					avatarMarkdownHeaderLabel={avatarMarkdownHeaderLabel}
					avatarMarkdownShowHeader={avatarMarkdownShowHeader}
					characterChunkSize={characterChunkSize}
					fadeDuration={fadeDuration}
					isStreaming={isStreaming}
					message={message}
					reasoning={reasoning}
					reasoningMarkdown={reasoningMarkdown}
					reasoningOpen={reasoningOpen}
					segmentDelay={segmentDelay}
					streamMode={streamMode}
					streamSpeed={streamSpeed}
				/>
				<MessageActions
					role="toolbar"
					aria-label="Message quick actions"
					data-tour="message-actions"
				>
					{message.sender === MessageSender.AVATAR ? (
						<>
							<MessageAction tooltip={"Retry (regenerate)"}>
								<Button
									aria-label="Retry"
									aria-keyshortcuts="R"
									data-tour="message-restream"
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
							{process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" && (
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
							)}
							<MessageAction tooltip={"Branch to agent"}>
								<Button
									aria-label="Branch to agent"
									aria-keyshortcuts="B"
									data-tour="message-branch-agent"
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
							<MessageAction tooltip={isCopied ? "Copied!" : "Copy message"}>
								<Button
									aria-label="Copy message"
									aria-keyshortcuts="C"
									data-tour="message-copy"
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
									data-tour="message-upvote"
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
									data-tour="message-downvote"
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
							<MessageAction tooltip={isCopied ? "Copied!" : "Copy message"}>
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
}

export const MessageItem = memo(MessageItemImpl, (prev, next) => {
	if (prev.message.id !== next.message.id) return false;
	if (prev.message.sender !== next.message.sender) return false;
	if (prev.message.content !== next.message.content) return false;
	if (prev.message.jsx !== next.message.jsx) return false;
	if (prev.message.provider !== next.message.provider) return false;
	if (prev.message.fallbackFrom !== next.message.fallbackFrom) return false;
	if (prev.message.toolParts !== next.message.toolParts) return false;
	if (prev.message.sources !== next.message.sources) return false;
	if (prev.message.assets !== next.message.assets) return false;
	if (prev.message.reasoning !== next.message.reasoning) return false;
	if (prev.message.reasoningMarkdown !== next.message.reasoningMarkdown)
		return false;
	if (prev.message.reasoningOpen !== next.message.reasoningOpen) return false;
	if (prev.isCopied !== next.isCopied) return false;
	if (prev.isStreaming !== next.isStreaming) return false;
	if (prev.avatarMarkdownShowHeader !== next.avatarMarkdownShowHeader)
		return false;
	if (prev.avatarMarkdownHeaderLabel !== next.avatarMarkdownHeaderLabel)
		return false;
	if (prev.reasoning !== next.reasoning) return false;
	if (prev.reasoningMarkdown !== next.reasoningMarkdown) return false;
	if (prev.reasoningOpen !== next.reasoningOpen) return false;
	if (prev.streamMode !== next.streamMode) return false;
	if (prev.streamSpeed !== next.streamSpeed) return false;
	if (prev.fadeDuration !== next.fadeDuration) return false;
	if (prev.segmentDelay !== next.segmentDelay) return false;
	if (prev.characterChunkSize !== next.characterChunkSize) return false;
	if (prev.voteState[prev.message.id] !== next.voteState[next.message.id])
		return false;
	return (
		prev.handleCopy === next.handleCopy &&
		prev.setVote === next.setVote &&
		prev.handleEditToInput === next.handleEditToInput &&
		prev.onBranch === next.onBranch &&
		prev.onRetry === next.onRetry &&
		prev.onCompare === next.onCompare
	);
});
