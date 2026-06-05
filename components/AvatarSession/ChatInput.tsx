import { SlashCommandPalette } from "@/components/AvatarSession/chat/SlashCommandPalette";
import { KB_CONNECTORS } from "@/components/KnowledgeBase/connectors";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { defaultCommands } from "@/data/commands";
import { resolveConversationStarters } from "@/lib/agent-conversation-starters";
import {
	getChatDragResource,
	hasChatDragResource,
	toComposerAsset,
} from "@/lib/chat-drag";
import { buildKnowledgeTree, flattenKnowledgeTree } from "@/lib/knowledge-tree";
import { useAgentStore } from "@/lib/stores/agent";
import { useAssetsStore } from "@/lib/stores/assets";
import type { ComposerAsset } from "@/lib/stores/composer";
import { useComposerStore } from "@/lib/stores/composer";
import {
	type ChatMode,
	type KnowledgeFolder,
	useSessionStore,
} from "@/lib/stores/session";
import { getTextareaAnchorRect } from "@/lib/utils/caret";
import type { Command } from "@/types/commands";
import {
	Check,
	MicIcon,
	MicOffIcon,
	Paperclip,
	SendIcon,
	Square,
	X,
	XCircle,
} from "lucide-react";
import type React from "react";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";

function buildKbCommands(
	folders: KnowledgeFolder[],
	itemFolders: Record<string, string | undefined>,
	createdItems: Array<{ id: string; name: string }>,
	onAddKb: () => void,
	onAttachKnowledge: (item: {
		id: string;
		name: string;
		description?: string;
	}) => void,
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

	// Map folder ID to list of command children
	const childrenMap: Record<string, Command[]> = {};
	for (const f of folders) {
		childrenMap[f.id] = [];
	}

	const sourceItems = flattenKnowledgeTree(buildKnowledgeTree(createdItems));

	// Add items to their folders or the same unfiled bucket used by the sidebar.
	const rootUserItems: Command[] = [];
	for (const item of sourceItems) {
		const folderId = itemFolders[item.id];
		const cmd: Command = {
			id: item.id,
			label: item.name,
			icon: "📄",
			description: "Knowledge item",
			action: () =>
				onAttachKnowledge({
					id: item.id,
					name: item.name,
					description: "Knowledge item",
				}),
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

	const sortKnowledgeCommands = (commands: Command[]) => {
		commands.sort((a, b) => {
			const aIsFolder = Boolean(a.children);
			const bIsFolder = Boolean(b.children);
			if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;
			return a.label.localeCompare(b.label);
		});
		for (const command of commands) {
			if (command.children) sortKnowledgeCommands(command.children);
		}
	};
	sortKnowledgeCommands(rootUserFolders);
	sortKnowledgeCommands(rootUserItems);

	if (rootUserFolders.length > 0 || rootUserItems.length > 0) {
		rootItems.push(...rootUserFolders);
		if (rootUserItems.length > 0) {
			rootItems.push({
				id: "__kb_unfiled__",
				label: "Knowledge Items",
				icon: "📁",
				description: "Folder",
				children: rootUserItems,
			});
		}
	}

	return rootItems;
}

import { Button } from "@/components/ui/button";
import {
	FileUpload,
	FileUploadContent,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Loader } from "@/components/ui/loader";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { cn } from "@/lib/utils";
import { PromptSuggestions } from "./PromptSuggestions";

interface ChatInputProps {
	chatMode: ChatMode;
	isVoiceChatActive: boolean;
	isSending: boolean;
	isEditing: boolean;
	isVoiceChatLoading: boolean;
	attachments: File[];
	composerAttachments: ComposerAsset[];
	promptSuggestions: string[];
	onStartVoiceChat: () => void;
	onStopVoiceChat: () => void;
	sendWithAttachments: (text: string) => void;
	confirmEdit: () => void;
	cancelEdit: () => void;
	removeAttachment: (idx: number) => void;
	removeComposerAttachment: (id: string) => void;
	onFilesAdded: (files: File[]) => void;
	onStopSending: () => void;
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
	initialValue?: string;
}

export type ChatInputHandle = {
	setDraft: (value: string) => void;
	getDraft: () => string;
	clearDraft: () => void;
	focus: () => void;
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
	(
		{
			chatMode,
			isVoiceChatActive,
			isSending,
			isEditing,
			isVoiceChatLoading,
			attachments,
			composerAttachments,
			promptSuggestions,
			onStartVoiceChat,
			onStopVoiceChat,
			sendWithAttachments,
			confirmEdit,
			cancelEdit,
			removeAttachment,
			removeComposerAttachment,
			onFilesAdded,
			onStopSending,
			inputRef,
			initialValue = "",
		},
		ref,
	) => {
		const [draft, setDraft] = useState(initialValue);
		useEffect(() => {
			setDraft(initialValue);
		}, [initialValue]);

		const addAssetAttachment = useComposerStore((s) => s.addAssetAttachment);
		const currentAgent = useAgentStore((s) => s.currentAgent);
		const pendingResourceMatches = useComposerStore(
			(s) => s.pendingResourceMatches,
		);
		const clearPendingResourceMatches = useComposerStore(
			(s) => s.clearPendingResourceMatches,
		);
		const removePendingResourceMatch = useComposerStore(
			(s) => s.removePendingResourceMatch,
		);
		const storeAssets = useAssetsStore((s) => s.assets);
		const {
			agentSettings,
			kbFolders,
			kbItemFolders,
			createdKnowledgeItems,
			openChatSettings,
		} = useSessionStore();
		const selectedAgent = currentAgent ?? agentSettings ?? null;

		const agents = useMemo(() => {
			const base = [
				{
					id: "agent-1",
					name: "Sales Assistant",
					role: "Revenue",
					description:
						"Qualifies leads, drafts outreach, and coordinates follow-up tasks through MCP actions.",
					icon: "🤖",
					conversationStarters: [
						"Find warm leads and draft a short follow-up sequence.",
						"Summarize the best next step for this prospect.",
						"Create a concise follow-up message for this lead.",
					],
				},
				{
					id: "agent-2",
					name: "Support Bot",
					role: "Customer Success",
					description:
						"Answers product questions, searches knowledge bases, and escalates unresolved issues.",
					icon: "💬",
					conversationStarters: [
						"Summarize this customer issue and suggest the next support step.",
						"Draft a clear response and mention any follow-up needed.",
						"Turn this into a short support ticket summary.",
					],
				},
				{
					id: "agent-3",
					name: "Content Analyst",
					role: "Research",
					description:
						"Reviews messages, extracts structured insights, and turns findings into dashboard-ready notes.",
					icon: "📊",
					conversationStarters: [
						"Analyze the latest chat and create a dashboard insight.",
						"Turn this thread into action items and key takeaways.",
						"Extract the most important metrics from this conversation.",
					],
				},
			];

			const configured = agentSettings?.id
				? [
						{
							id: agentSettings.id,
							name: agentSettings.name || "Configured Agent",
							role: "Configured",
							description:
								"Current saved agent configuration with the selected avatar, voice, knowledge base, and MCP settings.",
							icon: "⚙️",
							conversationStarters: agentSettings.conversationStarters?.length
								? agentSettings.conversationStarters.slice(0, 3)
								: agentSettings.promptStarter
									? [agentSettings.promptStarter]
									: ["Start from my current agent settings."],
						},
					]
				: [];

			const merged = [...configured, ...base];
			const seen = new Set<string>();
			return merged.filter((agent) => {
				if (seen.has(agent.id)) return false;
				seen.add(agent.id);
				return true;
			});
		}, [agentSettings]);

		const allCommands = useMemo(() => {
			const attachKnowledge = (item: {
				id: string;
				name: string;
				description?: string;
			}) => {
				addAssetAttachment({
					id: item.id.startsWith("kb-") ? item.id : `kb-${item.id}`,
					name: item.name,
					kind: "knowledge",
					mimeType: "application/x-knowledge",
					description: item.description ?? "Knowledge base item",
				});
			};

			const kbCommands = buildKbCommands(
				kbFolders,
				kbItemFolders,
				createdKnowledgeItems,
				() => window.dispatchEvent(new CustomEvent("open-add-kb-modal")),
				attachKnowledge,
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
						useSessionStore.getState().setAgentSettings(a as any);
						addAssetAttachment({
							id: a.id.startsWith("agent-") ? a.id : `agent-${a.id}`,
							name: a.name,
							kind: "agent",
							mimeType: "application/x-agent",
							description: a.description || a.role || "Agent",
							thumbnailUrl: (a as { avatarUrl?: string }).avatarUrl,
							conversationStarters: resolveConversationStarters(a as any),
						});
					},
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
						addAssetAttachment({
							id: `tool-${connector.key}`,
							name: connector.name,
							kind: "tool",
							mimeType: "application/x-tool",
							description: connector.description,
						});
					},
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
							kind: "asset",
						});
					},
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

		// Visual affordance for sidebar resource drag-over
		const [resourceDragCounter, setResourceDragCounter] = useState(0);
		const isResourceDragging = resourceDragCounter > 0;

		const isVoiceMode = chatMode === "voice";
		const inputDisabled = isVoiceMode && !isEditing;

		// Prefer provided ref from parent; fall back to a local one
		const localTextareaRef = useRef<HTMLTextAreaElement | null>(null);
		const textareaRef = inputRef ?? localTextareaRef;
		useImperativeHandle(
			ref,
			() => ({
				setDraft,
				getDraft: () => draft,
				clearDraft: () => setDraft(""),
				focus: () => textareaRef.current?.focus(),
			}),
			[draft, textareaRef],
		);

		// Notion-like '/' trigger state (palette UI to be implemented separately)
		const [slashOpen, setSlashOpen] = useState(false);
		const [slashStart, setSlashStart] = useState<number | null>(null); // index of '/'
		const [slashQuery, setSlashQuery] = useState("");
		const [highlightedIndex, setHighlightedIndex] = useState(0);
		const [menuStack, setMenuStack] = useState<Command[][]>([]);
		const [highlightedSubIndex, setHighlightedSubIndex] = useState(0);
		const tourSlashMenuOpenRef = useRef(false);

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

		useEffect(() => {
			const handleTourOpenSlashMenu = () => {
				tourSlashMenuOpenRef.current = true;
				openSlashPalette();
			};
			const handleTourCloseSlashMenu = () => {
				tourSlashMenuOpenRef.current = false;
				setSlashOpen(false);
				setSlashStart(null);
				setSlashQuery("");
				setMenuStack([]);
				setHighlightedIndex(0);
				setHighlightedSubIndex(0);
			};

			window.addEventListener(
				"tour-open-slash-command-menu",
				handleTourOpenSlashMenu,
			);
			window.addEventListener(
				"tour-close-slash-command-menu",
				handleTourCloseSlashMenu,
			);
			return () => {
				window.removeEventListener(
					"tour-open-slash-command-menu",
					handleTourOpenSlashMenu,
				);
				window.removeEventListener(
					"tour-close-slash-command-menu",
					handleTourCloseSlashMenu,
				);
			};
		}, [openSlashPalette]);

		// Show the left "/" button only when the input is truly empty (0 chars)
		const isInputEmpty = draft.length === 0;

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
						data-tour="slash-command-item"
						size="icon"
						variant="secondary"
						type="button"
						className="h-8 w-8 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						onClick={openSlashPalette}
					>
						/
					</Button>
				</PromptInputAction>
			</PromptInputActions>
		);

		// Right: mic, attach, send OR confirm/cancel
		const sendControlClassName = isSending
			? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
			: "";
		const RightActions = (
			<PromptInputActions
				className="shrink-0"
				role="toolbar"
				aria-label="Prompt quick actions"
			>
				{!isEditing ? (
					<>
						<PromptInputAction
							tooltip={
								isVoiceChatActive ? "Stop voice chat" : "Start voice chat"
							}
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
								disabled={isVoiceChatActive || isVoiceMode}
								onFilesAdded={onFilesAdded}
							>
								<FileUploadTrigger asChild>
									<Button
										aria-label="Attach files"
										aria-keyshortcuts="Alt+U"
										disabled={isVoiceChatActive || isVoiceMode}
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
						<PromptInputAction
							tooltip={
								isSending
									? "Stop sending"
									: isVoiceMode
										? "Switch to Text mode to send typed messages"
										: "Send message"
							}
						>
							<Button
								aria-label={isSending ? "Stop sending" : "Send message"}
								aria-keyshortcuts="Enter"
								disabled={isVoiceChatActive || isVoiceMode}
								size="icon"
								type="button"
								variant={isSending ? "outline" : "default"}
								className={cn(
									"transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
									sendControlClassName,
								)}
								onClick={() =>
									isSending ? onStopSending() : sendWithAttachments(draft)
								}
							>
								{isSending ? (
									<Square className="h-4 w-4 fill-current" />
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
			if (isVoiceMode && !isEditing) return;
			// Defer until caret updates
			requestAnimationFrame(() => updateSlashState(next));
		};

		// Close on blur
		useEffect(() => {
			const t = textareaRef?.current;
			if (!t) return;
			const onBlur = () => {
				if (tourSlashMenuOpenRef.current) return;
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
				const resource = getChatDragResource(e.dataTransfer);
				if (resource) {
					console.debug("[ChatInput] chat resource payload detected on drop");
					if (resource.id && resource.name) {
						const attachment = toComposerAsset(resource);
						addAssetAttachment(attachment);
						console.debug("[ChatInput] resource added to composer", attachment);
						// Always swallow the drop so FileUpload doesn't keep its overlay active
						e.preventDefault();
						e.stopPropagation();
						setResourceDragCounter(0);
						return;
					}
				}
			} catch {}
			// If it's not our payload, let it bubble (FileUpload will handle file drops)
		};

		const attachPendingResource = (resource: ComposerAsset) => {
			addAssetAttachment(resource);
			removePendingResourceMatch(resource.id);
		};

		const allowDrop = (e: React.DragEvent) => {
			// If dragging a sidebar chat resource payload, allow drop
			if (hasChatDragResource(e.dataTransfer.types)) {
				console.debug("[ChatInput] dragover chat resource payload", {
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
			if (hasChatDragResource(e.dataTransfer.types)) {
				console.debug("[ChatInput] dragenter chat resource payload");
				e.preventDefault();
				e.stopPropagation();
				setResourceDragCounter((c) => c + 1);
			}
		};
		const onDragLeave = (e: React.DragEvent) => {
			if (hasChatDragResource(e.dataTransfer.types)) {
				console.debug("[ChatInput] dragleave chat resource payload");
				e.preventDefault();
				e.stopPropagation();
				setResourceDragCounter((c) => Math.max(0, c - 1));
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
				{isResourceDragging && (
					<div className="pointer-events-none absolute inset-0 z-10 rounded-lg border-2 border-primary/70 border-dashed bg-primary/5" />
				)}
				{isVoiceMode && !isEditing && (
					<div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/50 border-dashed bg-primary/5 px-3 py-2 text-primary text-xs">
						Voice mode is microphone-first. Switch to Text to resume typing.
					</div>
				)}
				<PromptInput
					className={cn(
						"mt-4 w-full",
						isResourceDragging && "rounded-lg ring-2 ring-primary/50",
					)}
					data-tour="chat-input"
					disabled={false}
					maxHeight={320}
					value={draft}
					textareaRef={textareaRef}
					onSubmit={() => {
						if (isVoiceMode && !isEditing) return;
						if (isEditing) {
							confirmEdit();
						} else {
							sendWithAttachments(draft);
						}
					}}
					onValueChange={(next) => {
						setDraft(next);
						handleValueChange(next);
					}}
				>
					<div className="flex items-end gap-2">
						{isInputEmpty ? LeftActions : null}
						<PromptInputTextarea
							aria-label={isVoiceMode ? "Voice chat input" : "Chat input"}
							className="flex-grow"
							disabled={inputDisabled}
							placeholder={
								isVoiceMode
									? "Voice mode is active — use the microphone controls to speak."
									: "Type a message..."
							}
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
									const usingSubmenu =
										!!submenuItems && submenuItems.length > 0;
									const currentItems: Command[] = usingSubmenu
										? displaySubmenuItems!
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
														: (i - 1 + currentItems.length) %
															currentItems.length,
												);
											} else {
												setHighlightedIndex((i) =>
													currentItems.length === 0
														? 0
														: (i - 1 + currentItems.length) %
															currentItems.length,
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
											const rawActiveIndex = usingSubmenu
												? highlightedSubIndex
												: highlightedIndex;
											const activeIndex = Math.min(
												Math.max(0, rawActiveIndex),
												Math.max(0, currentItems.length - 1),
											);
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
									const anchorRect = getTextareaAnchorRect(
										textareaRef.current!,
									);
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
												if (
													!cmd ||
													!cmd.children ||
													cmd.children.length === 0
												) {
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
					{selectedAgent ? (
						<div className="flex flex-col gap-1 px-2 pt-2">
							<div className="inline-flex items-center gap-2">
								<span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 font-medium text-violet-700 text-xs dark:text-violet-300">
									Selected agent
								</span>
								<span className="max-w-[220px] truncate rounded-full border border-border bg-background px-2 py-1 text-foreground text-xs">
									{selectedAgent.name || "Agent"}
								</span>
							</div>
						</div>
					) : null}
					{/* FileUpload handles file selection and drag/drop */}
					{(attachments.length > 0 ||
						composerAttachments.length > 0 ||
						pendingResourceMatches.length > 0) && (
						<div className="flex flex-wrap items-center gap-2 px-2 pt-2">
							{pendingResourceMatches.length > 0 && (
								<div className="flex w-full flex-wrap items-center gap-2">
									<span className="font-medium text-[0.68rem] text-muted-foreground uppercase tracking-wide">
										Resource matches
									</span>
									{pendingResourceMatches.map((resource) => (
										<div
											key={`pending-${resource.kind}-${resource.id}`}
											className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1 text-secondary-foreground text-xs"
											title={resource.description || resource.name}
										>
											<button
												type="button"
												className="inline-flex items-center gap-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
												onClick={() => attachPendingResource(resource)}
											>
												<span className="rounded bg-muted px-1 text-[0.56rem] text-muted-foreground uppercase leading-4">
													{resource.kind ?? "resource"}
												</span>
												<span className="max-w-[200px] truncate">
													{resource.name}
												</span>
												<span className="text-[0.62rem] text-muted-foreground">
													Attach
												</span>
											</button>
											<button
												aria-label={`Dismiss ${resource.name}`}
												className="hover:text-destructive"
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													removePendingResourceMatch(resource.id);
												}}
											>
												<X className="h-3 w-3" />
											</button>
										</div>
									))}
									{pendingResourceMatches.length > 1 && (
										<button
											type="button"
											className="rounded-full border border-border bg-background px-2 py-1 text-[0.68rem] text-muted-foreground hover:bg-muted"
											onClick={clearPendingResourceMatches}
										>
											Clear matches
										</button>
									)}
								</div>
							)}
							{composerAttachments.map((a) => (
								<div
									key={`asset-${a.id}`}
									className="inline-flex flex-col gap-1 rounded-full border border-border bg-secondary px-2 py-1 text-secondary-foreground text-xs"
									title={a.description || a.url || a.name}
								>
									<div className="inline-flex items-center gap-1">
										<span className="rounded bg-muted px-1 text-[0.56rem] text-muted-foreground uppercase leading-4">
											{a.kind ?? "asset"}
										</span>
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
								</div>
							))}
							{attachments.map((file, idx) => (
								<div
									key={`${file.name}-${idx}`}
									className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-1 text-secondary-foreground text-xs"
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
								chatInput={draft}
								isVoiceChatActive={isVoiceChatActive}
								promptSuggestions={promptSuggestions}
								onChatInputChange={(value) => setDraft(value)}
							/>
						</div>
					) : null}
				</PromptInput>
			</section>
		);
	},
);
