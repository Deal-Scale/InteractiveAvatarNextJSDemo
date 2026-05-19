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
import { useEffect, useMemo, useRef, useState } from "react";
import { SlashCommandPalette } from "@/components/AvatarSession/chat/SlashCommandPalette";
import { defaultCommands } from "@/data/commands";
import type { Command } from "@/types/commands";
import { getTextareaAnchorRect } from "@/lib/utils/caret";
import type { ComposerAsset } from "@/lib/stores/composer";
import { useComposerStore } from "@/lib/stores/composer";
import { useAssetsStore } from "@/lib/stores/assets";
import { useAgentStore } from "@/lib/stores/agent";
import { KB_CONNECTORS } from "@/components/KnowledgeBase/connectors";
import { useSessionStore, type KnowledgeFolder } from "@/lib/stores/session";

function buildKbCommands(
	folders: KnowledgeFolder[],
	itemFolders: Record<string, string | undefined>,
	createdItems: Array<{ id: string; name: string }>,
	onAddKb: () => void,
): Command[] {
	const rootItems: Command[] = [
		{
			id: "action-add-kb",
			label: "+ Add Knowledge Base",
			icon: "➕",
			description: "Configure a new knowledge source",
			action: onAddKb,
		},
	];

	// Static categories and guides
	const staticItems: Command[] = [
		{
			id: "kb-guides",
			label: "Guides",
			icon: "📁",
			description: "Folder",
			children: [
				{
					id: "kb-getting-started",
					label: "Getting Started",
					icon: "📄",
					description: "Guide",
					insertText: "[KB: Getting Started]",
				},
				{
					id: "kb-integrations",
					label: "Integrations",
					icon: "📄",
					description: "Guide",
					insertText: "[KB: Integrations]",
				},
			],
		},
		{
			id: "kb-faq",
			label: "FAQ",
			icon: "📁",
			description: "Folder",
			children: [
				{
					id: "kb-general",
					label: "General FAQ",
					icon: "📄",
					description: "FAQ",
					insertText: "[KB: General FAQ]",
				},
			],
		},
	];
	rootItems.push(...staticItems);

	// Map folder ID to list of command children
	const childrenMap: Record<string, Command[]> = {};
	for (const f of folders) {
		childrenMap[f.id] = [];
	}

	// Add items to their folders or root
	const rootUserItems: Command[] = [];
	for (const item of createdItems) {
		const folderId = itemFolders[item.id];
		const cmd: Command = {
			id: item.id,
			label: item.name,
			icon: "📄",
			description: "Added Knowledge",
			insertText: `[KB: ${item.name}]`,
		};
		if (folderId && childrenMap[folderId]) {
			childrenMap[folderId].push(cmd);
		} else {
			rootUserItems.push(cmd);
		}
	}

	// Add subfolders to their parent folders or root
	const rootUserFolders: Command[] = [];
	const folderCommandMap: Record<string, Command> = {};
	for (const f of folders) {
		folderCommandMap[f.id] = {
			id: f.id,
			label: f.name,
			icon: "📁",
			description: "Folder",
			children: childrenMap[f.id],
		};
	}

	for (const f of folders) {
		const cmd = folderCommandMap[f.id];
		if (f.parentId && folderCommandMap[f.parentId]) {
			const parentCmd = folderCommandMap[f.parentId];
			parentCmd.children = parentCmd.children || [];
			parentCmd.children.push(cmd);
		} else {
			rootUserFolders.push(cmd);
		}
	}

	if (rootUserFolders.length > 0 || rootUserItems.length > 0) {
		rootItems.push({
			id: "kb-added-root",
			label: "Added Knowledge",
			icon: "📁",
			description: "Folder",
			children: [...rootUserFolders, ...rootUserItems],
		});
	}

	return rootItems;
}

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
	const storeAssets = useAssetsStore((s) => s.assets);
	const {
		agentSettings,
		kbFolders,
		kbItemFolders,
		createdKnowledgeItems,
		openChatSettings,
	} = useSessionStore();

	const agents = useMemo(() => {
		const base = [
			{
				id: "agent-1",
				name: "Sales Assistant",
				role: "Revenue",
				description:
					"Qualifies leads, drafts outreach, and coordinates follow-up tasks through MCP actions.",
				icon: "🤖",
			},
			{
				id: "agent-2",
				name: "Support Bot",
				role: "Customer Success",
				description:
					"Answers product questions, searches knowledge bases, and escalates unresolved issues.",
				icon: "💬",
			},
			{
				id: "agent-3",
				name: "Content Analyst",
				role: "Research",
				description:
					"Reviews messages, extracts structured insights, and turns findings into dashboard-ready notes.",
				icon: "📊",
			},
		];

		if (agentSettings?.id) {
			return [
				{
					id: agentSettings.id,
					name: agentSettings.name || "Configured Agent",
					role: "Configured",
					description:
						"Current saved agent configuration with the selected avatar, voice, knowledge base, and MCP settings.",
					icon: "⚙️",
				},
				...base,
			];
		}
		return base;
	}, [agentSettings]);

	const allCommands = useMemo(() => {
		const kbCommands = buildKbCommands(
			kbFolders,
			kbItemFolders,
			createdKnowledgeItems,
			() => window.dispatchEvent(new CustomEvent("open-add-kb-modal")),
		);

		const agentCommands: Command[] = [
			{
				id: "action-create-agent",
				label: "+ Create Agent",
				icon: "➕",
				description: "Configure a new agent",
				action: () => openChatSettings("avatar"),
			},
			...agents.map((a) => ({
				id: a.id,
				label: a.name,
				icon: a.icon || "🤖",
				description: a.role || "Agent",
				action: () => {
					useAgentStore.getState().setAgent(a as any);
				},
				insertText: `@${a.name} `,
			})),
		];

		const toolCommands: Command[] = [
			{
				id: "action-connect-tool",
				label: "+ Connect Tool",
				icon: "➕",
				description: "Connect a new MCP tool",
				action: () => {
					window.dispatchEvent(new CustomEvent("open-connect-tool-modal"));
				},
			},
			...KB_CONNECTORS.map((connector) => ({
				id: `tool-${connector.key}`,
				label: connector.name,
				icon: "🛠️",
				description: connector.description,
				action: () => {
					window.dispatchEvent(
						new CustomEvent("open-connect-tool-modal", {
							detail: { connectorKey: connector.key },
						}),
					);
				},
				insertText: `[Tool: ${connector.name}]`,
			})),
		];

		const assetCommands: Command[] = [
			{
				id: "action-upload-asset",
				label: "+ Upload Asset",
				icon: "➕",
				description: "Upload a file to assets",
				action: () => {
					const fileInput = document.querySelector(
						'input[type="file"]',
					) as HTMLInputElement;
					fileInput?.click();
				},
			},
			...storeAssets.map((asset) => ({
				id: asset.id,
				label: asset.name,
				icon: asset.mimeType?.startsWith("image/") ? "🖼️" : "📄",
				description: asset.mimeType || "File",
				action: () => {
					addAssetAttachment({
						id: asset.id,
						name: asset.name,
						url: asset.url,
						thumbnailUrl: asset.thumbnailUrl,
						mimeType: asset.mimeType,
					});
				},
				insertText: `[Asset: ${asset.name}]`,
			})),
		];

		return [
			{
				id: "submenu-agents",
				label: "Agents ▸",
				icon: "🤖",
				description: "Manage and select agents",
				children: agentCommands,
			},
			{
				id: "submenu-kb",
				label: "Knowledge Base ▸",
				icon: "📚",
				description: "Browse knowledge items",
				children: kbCommands,
			},
			{
				id: "submenu-tools",
				label: "Tools ▸",
				icon: "🛠️",
				description: "Connect and configure tools",
				children: toolCommands,
			},
			{
				id: "submenu-assets",
				label: "Assets ▸",
				icon: "📎",
				description: "Upload and attach assets",
				children: assetCommands,
			},
			...defaultCommands.map((cmd) => {
				if (cmd.id === "start-voice") {
					return { ...cmd, disabled: isVoiceChatActive };
				}
				if (cmd.id === "stop-voice") {
					return { ...cmd, disabled: !isVoiceChatActive };
				}
				return cmd;
			}),
		];
	}, [
		kbFolders,
		kbItemFolders,
		createdKnowledgeItems,
		openChatSettings,
		agents,
		storeAssets,
		addAssetAttachment,
		isVoiceChatActive,
	]);

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

	// Open the slash command palette programmatically for accessibility
	const openSlashPalette = () => {
		const t = textareaRef.current;
		if (!t) return;
		const caret = t.selectionStart ?? t.value.length;
		// If there isn't already a '/' at caret, insert it to create the trigger token
		if (t.value[caret] !== "/" && t.value[caret - 1] !== "/") {
			try {
				t.setRangeText("/", caret, caret, "end");
				t.dispatchEvent(new Event("input", { bubbles: true }));
			} catch {}
		}
		// Find the index of the '/' we just ensured
		const newCaret = t.selectionStart ?? caret;
		const slashPos = t.value.lastIndexOf("/", newCaret);
		setSlashOpen(true);
		setSlashStart(slashPos >= 0 ? slashPos : newCaret);
		setSlashQuery("");
		setMenuStack([]);
		setHighlightedIndex(0);
		setHighlightedSubIndex(0);
		// Keep focus in the textarea for SR users
		requestAnimationFrame(() => t.focus());
	};

	// Show the left "/" button only when the input is truly empty (0 chars)
	const isInputEmpty = (chatInput ?? "").length === 0;

	// Left-only: Open commands (slash) button
	const LeftActions = (
		<PromptInputActions
			className="shrink-0"
			role="toolbar"
			aria-label="Left prompt action"
		>
			<PromptInputAction tooltip="Open commands (Alt+/)">
				<Button
					aria-label="Open commands"
					aria-keyshortcuts="Alt+/"
					size="icon"
					variant="secondary"
					type="button"
					className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background h-8 w-8 p-0"
					onClick={openSlashPalette}
				>
					/
				</Button>
			</PromptInputAction>
		</PromptInputActions>
	);

	// Right: mic, attach, send OR confirm/cancel
	const RightActions = (
		<PromptInputActions
			className="shrink-0"
			role="toolbar"
			aria-label="Prompt quick actions"
		>
			{!isEditing ? (
				<>
					<PromptInputAction
						tooltip={isVoiceChatActive ? "Stop voice chat" : "Start voice chat"}
					>
						<div className="flex items-center">
							<Button
								aria-label={
									isVoiceChatActive ? "Stop voice chat" : "Start voice chat"
								}
								aria-keyshortcuts="Alt+M"
								size="icon"
								variant={isVoiceChatActive ? "destructive" : "default"}
								className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								onClick={isVoiceChatActive ? onStopVoiceChat : onStartVoiceChat}
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
									aria-keyshortcuts="Alt+U"
									disabled={isVoiceChatActive}
									size="icon"
									type="button"
									className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
							aria-keyshortcuts="Enter"
							disabled={isVoiceChatActive || isSending}
							size="icon"
							type="button"
							className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
							aria-keyshortcuts="Enter"
							size="icon"
							type="button"
							className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							onClick={confirmEdit}
						>
							<Check className="h-4 w-4" />
						</Button>
					</PromptInputAction>
					<PromptInputAction tooltip="Cancel editing">
						<Button
							aria-label="Cancel editing"
							aria-keyshortcuts="Escape"
							size="icon"
							type="button"
							variant="secondary"
							className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							onClick={cancelEdit}
						>
							<XCircle className="h-4 w-4" />
						</Button>
					</PromptInputAction>
				</>
			)}
		</PromptInputActions>
	);

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
					{isInputEmpty ? LeftActions : null}
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

							// Shortcut to open slash palette without typing '/': Alt+/
							if (e.altKey && e.key === "/") {
								e.preventDefault();
								openSlashPalette();
								return;
							}

							// Handle navigation when palette is open
							if (slashOpen) {
								e.preventDefault();
								const rootFiltered = allCommands.filter((cmd) => {
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
										const activeIdx = usingSubmenu
											? highlightedSubIndex
											: highlightedIndex;
										const item = currentItems[activeIdx];
										if (item?.children && item.children.length > 0) {
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
										if (item.disabled) return;
										if (item.id === "back-button") {
											item.action?.();
											return;
										}
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
								const rootFiltered = allCommands.filter((cmd) => {
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
								let displaySubmenuItems = submenuItems;
								if (submenuItems && menuStack.length > 1) {
									displaySubmenuItems = [
										{
											id: "back-button",
											label: "↩ Back",
											icon: "📁",
											description: "Go to parent folder",
											action: () => {
												setMenuStack((st) => st.slice(0, -1));
												setHighlightedSubIndex(0);
											},
										},
										...submenuItems,
									];
								}
								return (
									<SlashCommandPalette
										anchorRect={anchorRect}
										items={rootFiltered}
										submenuItems={displaySubmenuItems}
										highlightedIndex={Math.min(
											highlightedIndex,
											Math.max(0, rootFiltered.length - 1),
										)}
										highlightedSubIndex={
											displaySubmenuItems
												? Math.min(
														highlightedSubIndex,
														Math.max(0, displaySubmenuItems.length - 1),
													)
												: 0
										}
										onHighlight={setHighlightedIndex}
										onHighlightSub={setHighlightedSubIndex}
										onSelect={(cmd) => {
											if (cmd.id === "back-button") {
												cmd.action?.();
												return;
											}
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
											// If undefined or no children, collapse submenu
											if (!cmd || !cmd.children || cmd.children.length === 0) {
												setMenuStack([]);
												setHighlightedSubIndex(0);
												return;
											}
											// Open/update submenu
											setMenuStack((st) =>
												st.length > 0 && st[st.length - 1] === cmd.children
													? st
													: [...st, cmd.children!],
											);
											setHighlightedSubIndex(0);
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
					{RightActions}
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
