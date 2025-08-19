import {
	MicIcon,
	MicOffIcon,
	SendIcon,
	Paperclip,
	X,
	Check,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { SlashCommandPalette } from "@/components/AvatarSession/chat/SlashCommandPalette";
import { defaultCommands } from "@/data/commands";
import type { Command } from "@/types/commands";
import { getTextareaAnchorRect } from "@/lib/utils/caret";
import type { ComposerAsset } from "@/lib/stores/composer";
import { useComposerStore } from "@/lib/stores/composer";

import { PromptSuggestions } from "./PromptSuggestions";

import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import {
	FileUpload,
	FileUploadContent,
	FileUploadTrigger,
} from "@/components/ui/file-upload";

interface ChatInputProps {
	chatInput: string;
	isVoiceChatActive: boolean;
	isSending: boolean;
	isEditing: boolean;
	isVoiceChatLoading: boolean;
	attachments: File[];
	composerAttachments: ComposerAsset[];
	promptSuggestions: string[];
	onChatInputChange: (value: string) => void;
	onStartVoiceChat: () => void;
	onStopVoiceChat: () => void;
	sendWithAttachments: (text: string) => void;
	confirmEdit: () => void;
	cancelEdit: () => void;
	removeAttachment: (idx: number) => void;
	removeComposerAttachment: (id: string) => void;
	onFilesAdded: (files: File[]) => void;
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
	chatInput,
	isVoiceChatActive,
	isSending,
	isEditing,
	isVoiceChatLoading,
	attachments,
	composerAttachments,
	promptSuggestions,
	onChatInputChange,
	onStartVoiceChat,
	onStopVoiceChat,
	sendWithAttachments,
	confirmEdit,
	cancelEdit,
	removeAttachment,
	removeComposerAttachment,
	onFilesAdded,
	inputRef,
}) => {
	const addAssetAttachment = useComposerStore((s) => s.addAssetAttachment);
	// Visual affordance for sidebar asset drag-over
	const [assetDragCounter, setAssetDragCounter] = useState(0);
	const isAssetDragging = assetDragCounter > 0;

	// Prefer provided ref from parent; fall back to a local one
	const localTextareaRef = useRef<HTMLTextAreaElement | null>(null);
	const textareaRef = inputRef ?? localTextareaRef;

	// Notion-like '/' trigger state (palette UI to be implemented separately)
	const [slashOpen, setSlashOpen] = useState(false);
	const [slashStart, setSlashStart] = useState<number | null>(null); // index of '/'
	const [slashQuery, setSlashQuery] = useState("");
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const [menuStack, setMenuStack] = useState<Command[][]>([]);
	const [highlightedSubIndex, setHighlightedSubIndex] = useState(0);

	// Helper: is whitespace or start
	const isBoundary = (ch: string | undefined) => !ch || /\s/.test(ch);

	// Update slash state based on current value and caret
	const updateSlashState = (value: string) => {
		const t = textareaRef?.current;
		if (!t) return;
		const caret = t.selectionStart ?? value.length;

		// If palette is open, maintain or close depending on caret and token
		if (slashOpen) {
			if (slashStart == null) {
				setSlashOpen(false);
				setSlashQuery("");
				return;
			}
			// Close if caret moved before slash, or '/' was deleted
			if (caret <= slashStart || value[slashStart] !== "/") {
				setSlashOpen(false);
				setSlashStart(null);
				setSlashQuery("");
				return;
			}
			// Token runs from slashStart to before next whitespace
			const afterSlash = value.slice(slashStart + 1, caret);
			// Close on whitespace/newline just after slash (user didn't use it)
			if (afterSlash.length === 0 && isBoundary(value[caret])) {
				setSlashOpen(false);
				setSlashStart(null);
				setSlashQuery("");
				return;
			}
			// If whitespace typed inside the token, close
			if (/\s/.test(afterSlash)) {
				setSlashOpen(false);
				setSlashStart(null);
				setSlashQuery("");
				return;
			}
			// Otherwise keep it open and update query
			setSlashQuery(afterSlash);
			setHighlightedIndex(0);
			return;
		}

		// If not open, detect an immediately-typed '/'
		const prev = value[caret - 2]; // char before '/'
		const last = value[caret - 1]; // potentially '/'
		if (last === "/" && isBoundary(prev)) {
			// Open only when '/' was just typed at start of a token
			setSlashOpen(true);
			setSlashStart(caret - 1);
			setSlashQuery("");
			setMenuStack([]);
			setHighlightedIndex(0);
			setHighlightedSubIndex(0);
		}
	};

	// Wrap parent onValueChange to also maintain slash trigger state
	const handleValueChange = (next: string) => {
		onChatInputChange(next);
		// Defer until caret updates
		requestAnimationFrame(() => updateSlashState(next));
	};

	// Close on blur
	useEffect(() => {
		const t = textareaRef?.current;
		if (!t) return;
		const onBlur = () => {
			if (slashOpen) {
				setSlashOpen(false);
				setSlashStart(null);
				setSlashQuery("");
			}
		};
		t.addEventListener("blur", onBlur);
		return () => t.removeEventListener("blur", onBlur);
	}, [textareaRef, slashOpen]);

	// Debug: keep console trace minimal
	useEffect(() => {
		if (slashOpen) {
			console.debug("[/] trigger", { start: slashStart, query: slashQuery });
		}
	}, [slashOpen, slashStart, slashQuery]);

	// Helper: replace the '/<query>' token with provided text (or remove if empty)
	const replaceSlashToken = (text?: string) => {
		const t = textareaRef.current;
		if (!t) return;
		if (slashStart == null) return;
		const tokenStart = slashStart;
		const tokenEnd = slashStart + 1 + slashQuery.length;
		const insert = text ?? "";
		t.setRangeText(insert, tokenStart, tokenEnd, "end");
		t.dispatchEvent(new Event("input", { bubbles: true }));
	};

	const handleDrop = (e: React.DragEvent) => {
		console.debug("[ChatInput] drop", {
			types: Array.from(e.dataTransfer.types || []),
		});
		try {
			const data = e.dataTransfer.getData("application/x-asset");
			if (data) {
				console.debug("[ChatInput] asset payload detected on drop");
				const asset = JSON.parse(data) as ComposerAsset;
				if (asset?.id && asset.name) {
					addAssetAttachment({
						id: asset.id,
						name: asset.name,
						url: asset.url,
						thumbnailUrl: asset.thumbnailUrl,
						mimeType: asset.mimeType,
					});
					console.debug("[ChatInput] asset added to composer", asset);
					// Always swallow the drop so FileUpload doesn't keep its overlay active
					e.preventDefault();
					e.stopPropagation();
					setAssetDragCounter(0);
					return;
				}
			}
		} catch {}
		// If it's not our payload, let it bubble (FileUpload will handle file drops)
	};

	const allowDrop = (e: React.DragEvent) => {
		// If dragging an asset payload, allow drop
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragover asset payload", {
				types: Array.from(e.dataTransfer.types || []),
			});
			e.preventDefault();
			// Stop FileUpload from entering drag state (prevents persistent overlay)
			e.stopPropagation();
			try {
				e.dataTransfer.dropEffect = "copy";
			} catch {}
		}
	};
	const onDragEnter = (e: React.DragEvent) => {
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragenter asset payload");
			e.preventDefault();
			e.stopPropagation();
			setAssetDragCounter((c) => c + 1);
		}
	};
	const onDragLeave = (e: React.DragEvent) => {
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragleave asset payload");
			e.preventDefault();
			e.stopPropagation();
			setAssetDragCounter((c) => Math.max(0, c - 1));
		}
	};
	return (
		<section
			aria-label="Chat input drop area"
			className="relative"
			onDragEnter={onDragEnter}
			onDragOver={allowDrop}
			onDragLeave={onDragLeave}
			onDrop={handleDrop}
		>
			{isAssetDragging && (
				<div className="pointer-events-none absolute inset-0 z-10 rounded-lg border-2 border-dashed border-primary/70 bg-primary/5" />
			)}
			<PromptInput
				className={cn(
					"w-full mt-4",
					isAssetDragging && "ring-2 ring-primary/50 rounded-lg",
				)}
				disabled={false}
				maxHeight={320}
				value={chatInput}
				textareaRef={textareaRef}
				onSubmit={() =>
					isEditing ? confirmEdit() : sendWithAttachments(chatInput)
				}
				onValueChange={handleValueChange}
			>
				<div className="flex items-end gap-2">
					<PromptInputTextarea
						aria-label="Chat input"
						className="flex-grow"
						placeholder="Type a message..."
						onKeyDown={(e) => {
							// Escape cancels the slash palette immediately
							if (e.key === "Escape" && slashOpen) {
								e.stopPropagation();
								setSlashOpen(false);
								setSlashStart(null);
								setSlashQuery("");
								setMenuStack([]);
								setHighlightedIndex(0);
								return;
							}
							// Close when user types whitespace/tab while palette is open (treat as cancel)
							if (slashOpen && (e.key === " " || e.key === "Tab")) {
								setSlashOpen(false);
								setSlashStart(null);
								setSlashQuery("");
								setMenuStack([]);
								setHighlightedIndex(0);
								return;
							}

							// Handle navigation when palette is open
							if (slashOpen) {
								e.preventDefault();
								const rootFiltered = defaultCommands.filter((cmd) => {
									const q = slashQuery.toLowerCase();
									if (!q) return true;
									const pool = [cmd.label, ...(cmd.keywords || [])].map((s) =>
										s.toLowerCase(),
									);
									return pool.some((s) => s.includes(q));
								});
								const submenuItems: Command[] | undefined =
									menuStack.length > 0
										? menuStack[menuStack.length - 1]
										: undefined;
								const usingSubmenu = !!submenuItems && submenuItems.length > 0;
								const currentItems: Command[] = usingSubmenu
									? submenuItems!
									: rootFiltered;

								switch (e.key) {
									case "ArrowDown": {
										if (usingSubmenu) {
											setHighlightedSubIndex((i) =>
												currentItems.length === 0
													? 0
													: (i + 1) % currentItems.length,
											);
										} else {
											setHighlightedIndex((i) =>
												currentItems.length === 0
													? 0
													: (i + 1) % currentItems.length,
											);
										}
										return;
									}
									case "ArrowUp": {
										if (usingSubmenu) {
											setHighlightedSubIndex((i) =>
												currentItems.length === 0
													? 0
													: (i - 1 + currentItems.length) % currentItems.length,
											);
										} else {
											setHighlightedIndex((i) =>
												currentItems.length === 0
													? 0
													: (i - 1 + currentItems.length) % currentItems.length,
											);
										}
										return;
									}
									case "ArrowRight": {
										if (usingSubmenu) return; // no deeper nesting
										const item = currentItems[highlightedIndex];
										if (item?.children) {
											setMenuStack((st) => [...st, item.children!]);
											setHighlightedSubIndex(0);
										}
										return;
									}
									case "ArrowLeft": {
										if (menuStack.length > 0) {
											setMenuStack((st) => st.slice(0, -1));
											setHighlightedSubIndex(0);
										}
										return;
									}
									case "Enter": {
										const activeIndex = usingSubmenu
											? highlightedSubIndex
											: highlightedIndex;
										const item = currentItems[activeIndex];
										if (!item) return;
										if (item.children) {
											setMenuStack((st) => [...st, item.children!]);
											setHighlightedSubIndex(0);
											return;
										}
										// Execute leaf command
										const execInsert = item.insertText;
										let didReplace = false;
										if (item.mcpPrompt) {
											const prompt =
												typeof item.mcpPrompt === "function"
													? item.mcpPrompt()
													: item.mcpPrompt;
											const text = `/mcp ${prompt}`;
											replaceSlashToken(text);
											didReplace = true;
										} else if (execInsert) {
											const text =
												typeof execInsert === "function"
													? execInsert()
													: execInsert;
											replaceSlashToken(text);
											didReplace = true;
										}
										if (item.action) {
											item.action();
										} else {
											if (item.id === "start-voice") onStartVoiceChat();
											if (item.id === "stop-voice") onStopVoiceChat();
										}
										// For action-only, remove the token (no text inserted)
										if (!didReplace) {
											replaceSlashToken("");
										}
										setSlashOpen(false);
										setSlashStart(null);
										setSlashQuery("");
										setMenuStack([]);
										setHighlightedIndex(0);
										setHighlightedSubIndex(0);
										return;
									}
									default:
										return;
								}
							}
						}}
					/>

					{/* Slash command palette (anchored near caret) */}
					{slashOpen && textareaRef.current
						? (() => {
								const anchorRect = getTextareaAnchorRect(textareaRef.current!);
								const rootFiltered = defaultCommands.filter((cmd) => {
									const q = slashQuery.toLowerCase();
									if (!q) return true;
									const pool = [cmd.label, ...(cmd.keywords || [])].map((s) =>
										s.toLowerCase(),
									);
									return pool.some((s) => s.includes(q));
								});
								const submenuItems: Command[] | undefined =
									menuStack.length > 0
										? menuStack[menuStack.length - 1]
										: undefined;
								return (
									<SlashCommandPalette
										anchorRect={anchorRect}
										items={rootFiltered}
										submenuItems={submenuItems}
										highlightedIndex={Math.min(
											highlightedIndex,
											Math.max(0, rootFiltered.length - 1),
										)}
										highlightedSubIndex={
											submenuItems
												? Math.min(
														highlightedSubIndex,
														Math.max(0, submenuItems.length - 1),
													)
												: 0
										}
										onHighlight={setHighlightedIndex}
										onHighlightSub={setHighlightedSubIndex}
										onSelect={(cmd) => {
											if (cmd.children) {
												setMenuStack((st) => [...st, cmd.children!]);
												setHighlightedSubIndex(0);
												return;
											}
											let didReplace = false;
											if (cmd.mcpPrompt) {
												const prompt =
													typeof cmd.mcpPrompt === "function"
														? cmd.mcpPrompt()
														: cmd.mcpPrompt;
												const text = `/mcp ${prompt}`;
												replaceSlashToken(text);
												didReplace = true;
											} else if (cmd.insertText) {
												const text =
													typeof cmd.insertText === "function"
														? cmd.insertText()
														: cmd.insertText;
												replaceSlashToken(text);
												didReplace = true;
											}
											if (cmd.action) {
												cmd.action();
											} else {
												if (cmd.id === "start-voice") onStartVoiceChat();
												if (cmd.id === "stop-voice") onStopVoiceChat();
											}
											if (!didReplace) {
												replaceSlashToken("");
											}
											setSlashOpen(false);
											setSlashStart(null);
											setSlashQuery("");
											setMenuStack([]);
											setHighlightedIndex(0);
											setHighlightedSubIndex(0);
										}}
										onOpenSubmenu={(cmd) => {
											if (cmd.children && cmd.children.length > 0) {
												setMenuStack((st) =>
													st.length > 0 && st[st.length - 1] === cmd.children
														? st
														: [...st, cmd.children!],
												);
												setHighlightedSubIndex(0);
											}
										}}
										onClose={() => {
											setSlashOpen(false);
											setSlashStart(null);
											setSlashQuery("");
											setMenuStack([]);
											setHighlightedIndex(0);
											setHighlightedSubIndex(0);
										}}
									/>
								);
							})()
						: null}
					<PromptInputActions className="shrink-0">
						{!isEditing ? (
							<>
								<PromptInputAction
									tooltip={
										isVoiceChatActive ? "Stop voice chat" : "Start voice chat"
									}
								>
									<div className="flex items-center">
										<Button
											size="icon"
											variant={isVoiceChatActive ? "destructive" : "default"}
											onClick={
												isVoiceChatActive ? onStopVoiceChat : onStartVoiceChat
											}
										>
											{isVoiceChatActive ? (
												<MicOffIcon className="h-4 w-4" />
											) : (
												<MicIcon className="h-4 w-4" />
											)}
										</Button>
										{isVoiceChatLoading && (
											<div className="ml-2">
												<Loader size="sm" variant="dots" />
											</div>
										)}
									</div>
								</PromptInputAction>
								<PromptInputAction tooltip="Attach files">
									<FileUpload
										multiple
										accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md"
										disabled={isVoiceChatActive}
										onFilesAdded={onFilesAdded}
									>
										<FileUploadTrigger asChild>
											<Button
												aria-label="Attach files"
												disabled={isVoiceChatActive}
												size="icon"
												type="button"
											>
												<Paperclip className="h-4 w-4" />
											</Button>
										</FileUploadTrigger>
										<FileUploadContent className="border-border/60 bg-background/80 text-foreground/90">
											<div className="rounded-lg border px-6 py-4 text-center">
												<p className="text-sm">Drop files to attach</p>
											</div>
										</FileUploadContent>
									</FileUpload>
								</PromptInputAction>
								<PromptInputAction tooltip="Send message">
									<Button
										aria-label="Send message"
										disabled={isVoiceChatActive || isSending}
										size="icon"
										type="button"
										onClick={() => sendWithAttachments(chatInput)}
									>
										{isSending ? (
											<Loader size="sm" variant="circular" />
										) : (
											<SendIcon />
										)}
									</Button>
								</PromptInputAction>
							</>
						) : (
							<>
								<PromptInputAction tooltip="Confirm edit and send">
									<Button
										aria-label="Confirm edit and send"
										size="icon"
										type="button"
										onClick={confirmEdit}
									>
										<Check className="h-4 w-4" />
									</Button>
								</PromptInputAction>
								<PromptInputAction tooltip="Cancel editing">
									<Button
										aria-label="Cancel editing"
										size="icon"
										type="button"
										variant="secondary"
										onClick={cancelEdit}
									>
										<XCircle className="h-4 w-4" />
									</Button>
								</PromptInputAction>
							</>
						)}
					</PromptInputActions>
				</div>
				{/* FileUpload handles file selection and drag/drop */}
				{(attachments.length > 0 || composerAttachments.length > 0) && (
					<div className="flex flex-wrap items-center gap-2 px-2 pt-2">
						{composerAttachments.map((a) => (
							<div
								key={`asset-${a.id}`}
								className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
								title={a.url ? `${a.name} – ${a.url}` : a.name}
							>
								<span className="max-w-[200px] truncate">{a.name}</span>
								<button
									aria-label={`Remove ${a.name}`}
									className="hover:text-destructive"
									type="button"
									onClick={() => removeComposerAttachment(a.id)}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
						{attachments.map((file, idx) => (
							<div
								key={`${file.name}-${idx}`}
								className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
							>
								<span className="max-w-[200px] truncate">{file.name}</span>
								<button
									aria-label={`Remove ${file.name}`}
									className="hover:text-destructive"
									type="button"
									onClick={() => removeAttachment(idx)}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
					</div>
				)}
				{promptSuggestions && promptSuggestions.length > 0 ? (
					<div className="mt-4">
						<PromptSuggestions
							chatInput={chatInput}
							isVoiceChatActive={isVoiceChatActive}
							promptSuggestions={promptSuggestions}
							onChatInputChange={onChatInputChange}
						/>
					</div>
				) : null}
			</PromptInput>
		</section>
	);
};
