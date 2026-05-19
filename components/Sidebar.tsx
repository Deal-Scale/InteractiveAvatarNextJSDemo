"use client";

import { Bookmark, Plus as PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useRef } from "react";
import AddKnowledgeBaseModal from "@/components/KnowledgeBase/AddKnowledgeBaseModal";
import ActiveSessionsSection from "@/components/Sidebar/ActiveSessionsSection";
import AgentsSection from "@/components/Sidebar/AgentsSection";
import ApplicationsStarter from "@/components/Sidebar/ApplicationsStarter";
import AssetsSection from "@/components/Sidebar/AssetsSection";
import BookmarkModal from "@/components/Sidebar/BookmarkModal";
import BookmarksSection from "@/components/Sidebar/BookmarksSection";
import useBookmarkModal from "@/components/Sidebar/hooks/useBookmarkModal";
import useConversations from "@/components/Sidebar/hooks/useConversations";
import useSidebarCollapse from "@/components/Sidebar/hooks/useSidebarCollapse";
import KnowledgebaseSection, {
	type KnowledgeFolder,
} from "@/components/Sidebar/KnowledgebaseSection";
import MessagesSection from "@/components/Sidebar/MessagesSection";
import SessionsHistorySection from "@/components/Sidebar/SessionsHistorySection";
import SidebarHeaderSection from "@/components/Sidebar/SidebarHeaderSection";
import ToolConnectionModal from "@/components/Sidebar/ToolConnectionModal";
import ToolsSection from "@/components/Sidebar/ToolsSection";
import type { SidebarProps } from "@/components/Sidebar/types";
import { Button } from "@/components/ui/button";
import {
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
	Sidebar as UISidebar,
} from "@/components/ui/sidebar";
import ThemeEmotionSelect from "@/components/ui/theme-emotion-select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
	useConnectKBSource,
	useScheduleKBSync,
	useTestKBConnection,
} from "@/lib/query/mutations";
import { useAgentStore } from "@/lib/stores/agent";
import { useAssetsStore } from "@/lib/stores/assets";
import { useComposerStore } from "@/lib/stores/composer";
import { useSessionStore } from "@/lib/stores/session";
import { useSettingsStore } from "@/lib/stores/settings";

// types, utils, and subcomponents are imported from components/Sidebar/*

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

const Sidebar: React.FC<SidebarProps> = ({ onSelect, apps }) => {
	const router = useRouter();
	const { agentSettings } = useSessionStore();
	const currentSessionId = useSessionStore((s) => s.currentSessionId);
	const chatExperience = useSessionStore((s) => s.chatExperience);
	const messages = useSessionStore((s) => s.messages);
	const openConfigModal = useSessionStore((s) => s.openConfigModal);
	const openChatSettings = useSessionStore((s) => s.openChatSettings);
	const { currentAgent, updateAgent } = useAgentStore();
	const { globalSettings, setGlobalSettings, clearGlobalSettings } =
		useSettingsStore();
	const [starterScale, setStarterScale] = React.useState<number>(1);
	const [showGlobalForm, setShowGlobalForm] = React.useState<boolean>(true);
	const assetsRef = useRef<HTMLDivElement | null>(null);
	const bookmarksRef = useRef<HTMLDivElement | null>(null);

	const collapse = useSidebarCollapse();
	const conv = useConversations();

	const bookmark = useBookmarkModal();

	// collapse and archived persistence moved into hooks

	const storeAssets = useAssetsStore((s) => s.assets);
	const removeAsset = useAssetsStore((s) => s.removeAsset);

	const agents = useMemo(() => {
		const base = [
			{
				id: "agent-1",
				name: "Sales Assistant",
				role: "Revenue",
				description:
					"Qualifies leads, drafts outreach, and coordinates follow-up tasks through MCP actions.",
				abilities: ["crm.search", "mail.send", "task.plan"],
				modalities: ["chat", "voice", "video"],
				promptStarter: "Find warm leads and draft a short follow-up sequence.",
				isOwnedByUser: true,
			},
			{
				id: "agent-2",
				name: "Support Bot",
				role: "Customer Success",
				description:
					"Answers product questions, searches knowledge bases, and escalates unresolved issues.",
				abilities: ["kb.search", "ticket.create", "toast.publish"],
				modalities: ["chat", "voice"],
				promptStarter:
					"Summarize this customer issue and suggest the next support step.",
				isOwnedByUser: false,
			},
			{
				id: "agent-3",
				name: "Content Analyst",
				role: "Research",
				description:
					"Reviews messages, extracts structured insights, and turns findings into dashboard-ready notes.",
				abilities: ["mcp.resources", "chart.add", "summary.write"],
				modalities: ["chat"],
				promptStarter:
					"Analyze the latest chat and create a dashboard insight.",
				isOwnedByUser: false,
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
					abilities: ["session.start", "kb.use", "mcp.tools"],
					modalities: ["chat", "voice", "video"],
					promptStarter: "Start from my current agent settings.",
					isOwnedByUser: true,
				},
				...base,
			];
		}

		return base;
	}, [agentSettings]);
	const openBookmarkModal = bookmark.openBookmarkModal;
	const addAssetAttachment = useComposerStore((s) => s.addAssetAttachment);

	const totalCount = conv.totalCount;
	const currentBookmarkId = currentSessionId
		? `live-session-${currentSessionId}`
		: "current-chat-session";
	const currentSessionConversation = useMemo(() => {
		const lastMessage = messages[messages.length - 1]?.content;
		const title =
			currentSessionId || messages.length > 0
				? chatExperience === "avatar"
					? "Current LiveAvatar Session"
					: "Current Chat"
				: "Current Session";

		return {
			id: currentBookmarkId,
			title,
			lastMessage: lastMessage || "Live session and current messages",
			timestamp: Date.now(),
		};
	}, [chatExperience, currentBookmarkId, currentSessionId, messages]);

	// Local collapse state for streaming sections
	const [collapsedActiveSessions, setCollapsedActiveSessions] =
		React.useState<boolean>(false);
	const [collapsedSessionsHistory, setCollapsedSessionsHistory] =
		React.useState<boolean>(true);

	// Knowledge Base modal state and hooks
	const [kbModalOpen, setKbModalOpen] = React.useState(false);
	const [kbModalToolsOpen, setKbModalToolsOpen] = React.useState(false);
	const [toolModalOpen, setToolModalOpen] = React.useState(false);
	const [toolModalConnector, setToolModalConnector] = React.useState<
		string | undefined
	>(undefined);
	const kbFolders = useSessionStore((s) => s.kbFolders);
	const setKbFolders = useSessionStore((s) => s.setKbFolders);
	const kbItemFolders = useSessionStore((s) => s.kbItemFolders);
	const setKbItemFolders = useSessionStore((s) => s.setKbItemFolders);
	const createdKnowledgeItems = useSessionStore((s) => s.createdKnowledgeItems);
	const setCreatedKnowledgeItems = useSessionStore(
		(s) => s.setCreatedKnowledgeItems,
	);

	// Register window events to trigger modals from slash commands
	React.useEffect(() => {
		const handleOpenAddKB = () => {
			setKbModalToolsOpen(false);
			setKbModalOpen(true);
		};
		const handleOpenConnectTool = (e: Event) => {
			const customEvent = e as CustomEvent;
			setToolModalConnector(customEvent.detail?.connectorKey);
			setToolModalOpen(true);
		};
		window.addEventListener("open-add-kb-modal", handleOpenAddKB);
		window.addEventListener("open-connect-tool-modal", handleOpenConnectTool);
		return () => {
			window.removeEventListener("open-add-kb-modal", handleOpenAddKB);
			window.removeEventListener(
				"open-connect-tool-modal",
				handleOpenConnectTool,
			);
		};
	}, []);

	const testKB = useTestKBConnection();
	const connectKB = useConnectKBSource({
		onSuccess: async (kb) => {
			// Schedule initial sync for API-based KBs
			if (kb.sourceType === "api") {
				scheduleSync.mutate({ id: kb.id });
			}
		},
	});
	const scheduleSync = useScheduleKBSync();

	function createKnowledgeFolder(name: string, parentId?: string) {
		const folder: KnowledgeFolder = {
			id: `kb-folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			name,
			parentId,
		};
		setKbFolders((prev) => [...prev, folder]);
		return folder;
	}

	function moveKnowledgeFolder(id: string, parentId?: string) {
		setKbFolders((prev) =>
			prev.map((folder) =>
				folder.id === id ? { ...folder, parentId } : folder,
			),
		);
	}

	function deleteKnowledgeFolder(id: string) {
		const descendants = new Set<string>([id]);
		let changed = true;
		while (changed) {
			changed = false;
			for (const folder of kbFolders) {
				if (folder.parentId && descendants.has(folder.parentId)) {
					if (!descendants.has(folder.id)) {
						descendants.add(folder.id);
						changed = true;
					}
				}
			}
		}

		setKbFolders((prev) =>
			prev.filter((folder) => !descendants.has(folder.id)),
		);
		setKbItemFolders((prev) => {
			const next = { ...prev };
			for (const [itemId, folderId] of Object.entries(next)) {
				if (folderId && descendants.has(folderId)) next[itemId] = undefined;
			}
			return next;
		});
	}

	// SSR-safe window alias
	const w = typeof window !== "undefined" ? window : undefined;

	// Build a map of conversations by ID for fast lookup in bookmarks tree
	const conversationsById = useMemo(() => {
		const map: Record<
			string,
			import("@/components/Sidebar/types").Conversation
		> = {};
		if (conv.groups) {
			for (const g of conv.groups) {
				for (const c of g.conversations) {
					map[c.id] = c;
				}
			}
		}
		map[currentSessionConversation.id] = currentSessionConversation;
		return map;
	}, [conv.groups, currentSessionConversation]);

	// Placeholder knowledge base tree (folders/files). Replace with real data.
	const knowledgeTree = useMemo(
		() => [
			{
				id: "kb-guides",
				name: "Guides",
				children: [
					{ id: "kb-getting-started", name: "Getting Started" },
					{ id: "kb-integrations", name: "Integrations" },
				],
			},
			{
				id: "kb-faq",
				name: "FAQ",
				children: [{ id: "kb-general", name: "General" }],
			},
			...(createdKnowledgeItems.length
				? [
						{
							id: "kb-created",
							name: "Added Knowledge",
							children: createdKnowledgeItems,
						},
					]
				: []),
		],
		[createdKnowledgeItems],
	);

	return (
		<SidebarProvider>
			<UISidebar className="bg-background text-foreground">
				<SidebarHeader>
					<SidebarHeaderSection
						query={conv.query}
						setQuery={conv.setQuery}
						onAssetsClick={() => {
							collapse.setCollapsedAssets(() => false);
							assetsRef.current?.scrollIntoView({
								behavior: "smooth",
								block: "start",
							});
						}}
						onScrollToBookmarks={() => {
							collapse.setCollapsedBookmarks(() => false);
							bookmarksRef.current?.scrollIntoView({
								behavior: "smooth",
								block: "start",
							});
						}}
					/>
				</SidebarHeader>

				<SidebarContent className="pt-2">
					{/* Theme controls under header (Zola chat/avatar area) */}
					<div className="px-2 pb-2">
						<div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
							<span className="text-xs text-muted-foreground group-data-[state=collapsed]/sidebar:hidden">
								Emotion
							</span>
							<ThemeEmotionSelect className="group-data-[state=collapsed]/sidebar:hidden" />
							<div className="ml-auto">
								<ThemeToggle />
							</div>
						</div>
					</div>
					<div className="px-2">
						<Button
							className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
							variant="outline"
							onClick={() => {
								openChatSettings("text");
							}}
						>
							<PlusIcon className="size-4" />
							<span className="group-data-[state=collapsed]/sidebar:hidden">
								New Chat
							</span>
						</Button>
						<Button
							className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
							variant="outline"
							onClick={() => bookmark.openBookmarkModal(currentBookmarkId)}
						>
							<Bookmark className="size-4" />
							<span className="group-data-[state=collapsed]/sidebar:hidden">
								Bookmark
							</span>
						</Button>
					</div>

					{conv.loading && (
						<div className="px-2">
							<div className="mb-2 h-3 w-24 rounded bg-muted" />
							{SKELETON_IDS.map((id) => (
								<div key={id} className="mb-2 h-8 rounded bg-muted" />
							))}
						</div>
					)}

					{/* Messages Section */}
					{!conv.loading && conv.filteredGroups && (
						<MessagesSection
							archivedCount={conv.archivedList.length}
							archivedIds={conv.archivedIds}
							bookmarkedIds={bookmark.bookmarkedIds}
							collapsedGroups={collapse.collapsedGroups}
							collapsedMessages={collapse.collapsedMessages}
							clearSelection={conv.clearSelection}
							groups={conv.filteredGroups}
							onSelect={onSelect}
							openBookmarkModal={openBookmarkModal}
							selectedIds={conv.selectedIds}
							selectionMode={conv.selectionMode}
							setCollapsedGroups={collapse.setCollapsedGroups}
							setCollapsedMessages={collapse.setCollapsedMessages}
							setSelectedIds={conv.setSelectedIds}
							setSelectionMode={conv.setSelectionMode}
							toggleSelect={conv.toggleSelect}
							totalCount={totalCount}
							visibleConversationIds={conv.visibleConversationIds}
						/>
					)}

					{/* Bookmarks (File Tree) */}
					<div ref={bookmarksRef}>
						<BookmarksSection
							bookmarkFolders={bookmark.bookmarkFolders}
							bookmarkedIds={bookmark.bookmarkedIds}
							bookmarkMeta={bookmark.bookmarkMeta}
							collapsedBookmarks={collapse.collapsedBookmarks}
							conversationsById={conversationsById}
							onOpenChat={(c) => onSelect?.(c)}
							onOpenBookmarkMove={(id) => bookmark.openBookmarkModal(id)}
							onDeleteBookmark={(id) => bookmark.deleteBookmark(id)}
							onMoveBookmarkFolder={(id, parentId) =>
								bookmark.moveFolder(id, parentId)
							}
							onDeleteBookmarkFolder={(id) => bookmark.deleteFolder(id)}
							setCollapsedBookmarks={collapse.setCollapsedBookmarks}
						/>
					</div>

					{/* Assets */}
					<AssetsSection
						assets={storeAssets as any}
						assetsRef={assetsRef}
						collapsedAssets={collapse.collapsedAssets}
						onDelete={(id) => removeAsset(id)}
						onAttach={(asset) =>
							addAssetAttachment({
								id: asset.id,
								name: asset.name,
								url: asset.url,
								thumbnailUrl: asset.thumbnailUrl,
								mimeType: (asset as any).mimeType,
							})
						}
						setCollapsedAssets={collapse.setCollapsedAssets}
					/>

					{/* Knowledge Base (File Tree) */}
					<KnowledgebaseSection
						collapsedKnowledge={collapse.collapsedKnowledge}
						setCollapsedKnowledge={collapse.setCollapsedKnowledge}
						tree={knowledgeTree as any}
						folders={kbFolders}
						itemFolders={kbItemFolders}
						onCreateFolder={createKnowledgeFolder}
						onMoveFolder={moveKnowledgeFolder}
						onDeleteFolder={deleteKnowledgeFolder}
						onMoveKnowledgeItem={(id, folderId) =>
							setKbItemFolders((prev) => ({ ...prev, [id]: folderId }))
						}
						onOpenItem={(id) => {
							// TODO: implement real navigation when KB is integrated
							console.debug("Open KB item", id);
						}}
						onMoveItem={(id) => {
							// TODO: implement real KB move modal/flow
							console.debug("KB: move item", id);
						}}
						onOpenMarkdown={() => {
							// Navigate to a markdown viewer route (replace with your implementation)
							router.push("/knowledge/markdown");
						}}
						onStartApiSync={() => {
							// Trigger OAuth flow for API sync (replace with your real auth)
							console.debug("KB OAuth: begin auth flow");
						}}
						onOpenAddKB={() => {
							setKbModalToolsOpen(false);
							setKbModalOpen(true);
						}}
					/>

					{/* Tools */}
					<ToolsSection
						collapsedTools={collapse.collapsedTools}
						setCollapsedTools={collapse.setCollapsedTools}
						onOpenTools={(connectorKey) => {
							setToolModalConnector(connectorKey);
							setToolModalOpen(true);
						}}
					/>

					{/* Agents */}
					<AgentsSection
						agents={agents as any}
						collapsedAgents={collapse.collapsedAgents}
						setCollapsedAgents={collapse.setCollapsedAgents}
						onEdit={(a) => {
							updateAgent(a);
						}}
					/>

					{/* Streaming sections */}
					<ActiveSessionsSection
						collapsed={collapsedActiveSessions}
						setCollapsed={setCollapsedActiveSessions}
					/>

					{/* Applications Starter */}
					<ApplicationsStarter
						apps={apps}
						collapsedStarter={collapse.collapsedStarter}
						setCollapsedStarter={collapse.setCollapsedStarter}
						onOpenGlobalSettings={() => openConfigModal("global")}
					/>

					<SessionsHistorySection
						collapsed={collapsedSessionsHistory}
						setCollapsed={setCollapsedSessionsHistory}
					/>
				</SidebarContent>
			</UISidebar>

			{/* Bookmark Modal */}
			<BookmarkModal
				open={bookmark.bookmarkModalOpen}
				bookmarkedIds={bookmark.bookmarkedIds}
				bookmarkTargetId={bookmark.bookmarkTargetId}
				bookmarkFolders={bookmark.bookmarkFolders}
				draftTitle={bookmark.draftTitle}
				setDraftTitle={bookmark.setDraftTitle}
				draftFolderId={bookmark.draftFolderId}
				setDraftFolderId={bookmark.setDraftFolderId}
				draftNewFolder={bookmark.draftNewFolder}
				setDraftNewFolder={bookmark.setDraftNewFolder}
				draftTags={bookmark.draftTags}
				setDraftTags={bookmark.setDraftTags}
				onClose={bookmark.close}
				onRemove={bookmark.handleRemoveBookmark}
				onSave={bookmark.saveBookmark}
			/>

			{/* Knowledge Base Add Modal */}
			<AddKnowledgeBaseModal
				open={kbModalOpen}
				onOpenChange={(open) => {
					setKbModalOpen(open);
					if (!open) setKbModalToolsOpen(false);
				}}
				initialToolsOpen={kbModalToolsOpen}
				folders={kbFolders}
				onCreateFolder={createKnowledgeFolder}
				onCreated={(kb) => {
					setCreatedKnowledgeItems((prev) =>
						prev.some((item) => item.id === kb.id)
							? prev
							: [...prev, { id: kb.id, name: kb.name }],
					);
					if (kb.folderId) {
						setKbItemFolders((prev) => ({ ...prev, [kb.id]: kb.folderId }));
					}
				}}
				onTestConnection={async (connectorKey, cfg) => {
					const res = await testKB.mutateAsync({ connectorKey, config: cfg });
					return res;
				}}
				onConnect={async (connectorKey, cfg) => {
					const kb = await connectKB.mutateAsync({ connectorKey, config: cfg });
					return { id: kb.id, name: kb.name };
				}}
				onStartOAuth={async (connectorKey, authUrl, scopes) => {
					try {
						// Build URL with optional scopes and state
						const state = Math.random().toString(36).slice(2);
						const url = new URL(authUrl);
						if (scopes && scopes.length) {
							url.searchParams.set("scope", scopes.join(" "));
						}
						url.searchParams.set("state", state);
						const popup = w?.open(
							url.toString(),
							"kb-oauth",
							"width=480,height=720",
						);
						if (!popup) return { ok: false };
						// Wait for a postMessage with the code or popup close
						const code: string | undefined = await new Promise((resolve) => {
							const listener = (e: MessageEvent) => {
								if (
									typeof e.data === "object" &&
									e.data &&
									(e.data as any).type === "kb-oauth-callback" &&
									(e.data as any).state === state
								) {
									w?.removeEventListener("message", listener);
									resolve((e.data as any).code as string | undefined);
								}
							};
							w?.addEventListener("message", listener);
							const timer = setInterval(() => {
								if (popup.closed) {
									clearInterval(timer);
									w?.removeEventListener("message", listener);
									resolve(undefined);
								}
							}, 500);
						});
						return { ok: true, code };
					} catch (e) {
						console.error("OAuth start failed", e);
						return { ok: false };
					}
				}}
			/>

			{/* Tool Connector Modal */}
			<ToolConnectionModal
				open={toolModalOpen}
				onOpenChange={(open) => {
					setToolModalOpen(open);
					if (!open) setToolModalConnector(undefined);
				}}
				initialConnectorKey={toolModalConnector}
				onTestConnection={async (connectorKey, cfg) => {
					const res = await testKB.mutateAsync({ connectorKey, config: cfg });
					return res;
				}}
				onConnect={async (connectorKey, cfg) => {
					const kb = await connectKB.mutateAsync({ connectorKey, config: cfg });
					return { id: kb.id, name: kb.name };
				}}
				onStartOAuth={async (connectorKey, authUrl, scopes) => {
					try {
						const state = Math.random().toString(36).slice(2);
						const url = new URL(authUrl);
						if (scopes && scopes.length) {
							url.searchParams.set("scope", scopes.join(" "));
						}
						url.searchParams.set("state", state);
						const popup = w?.open(
							url.toString(),
							"tool-oauth",
							"width=480,height=720",
						);
						if (!popup) return { ok: false };
						const code: string | undefined = await new Promise((resolve) => {
							const listener = (e: MessageEvent) => {
								if (
									typeof e.data === "object" &&
									e.data &&
									(e.data as any).type === "kb-oauth-callback" &&
									(e.data as any).state === state
								) {
									w?.removeEventListener("message", listener);
									resolve((e.data as any).code as string | undefined);
								}
							};
							w?.addEventListener("message", listener);
							const timer = w?.setInterval(() => {
								if (popup.closed) {
									if (timer) w?.clearInterval(timer);
									w?.removeEventListener("message", listener);
									resolve(undefined);
								}
							}, 500);
						});
						return code ? { ok: true, code } : { ok: false };
					} catch {
						return { ok: false };
					}
				}}
			/>
		</SidebarProvider>
	);
};

export default Sidebar;
