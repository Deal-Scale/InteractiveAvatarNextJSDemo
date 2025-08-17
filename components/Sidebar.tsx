"use client";

import type { SidebarProps } from "@/components/Sidebar/types";

import React, { useMemo, useRef } from "react";
import { Plus as PlusIcon, Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/stores/session";
import { useAgentStore } from "@/lib/stores/agent";
import { useSettingsStore } from "@/lib/stores/settings";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ThemeEmotionSelect from "@/components/ui/theme-emotion-select";
import CollapsedEdgeTrigger from "@/components/Sidebar/CollapsedEdgeTrigger";
import ApplicationsStarter from "@/components/Sidebar/ApplicationsStarter";
import AssetsSection from "@/components/Sidebar/AssetsSection";
import AgentsSection from "@/components/Sidebar/AgentsSection";
import BookmarkModal from "@/components/Sidebar/BookmarkModal";
import BookmarksSection from "@/components/Sidebar/BookmarksSection";
import KnowledgebaseSection from "@/components/Sidebar/KnowledgebaseSection";
import useSidebarCollapse from "@/components/Sidebar/hooks/useSidebarCollapse";
import useConversations from "@/components/Sidebar/hooks/useConversations";
import useBookmarkModal from "@/components/Sidebar/hooks/useBookmarkModal";
import SidebarHeaderSection from "@/components/Sidebar/SidebarHeaderSection";
import MessagesSection from "@/components/Sidebar/MessagesSection";

// types, utils, and subcomponents are imported from components/Sidebar/*

const Sidebar: React.FC<SidebarProps> = ({ onSelect, apps }) => {
  const router = useRouter();
  const { agentSettings } = useSessionStore();
  const { currentAgent, updateAgent } = useAgentStore();
  const { globalSettings, setGlobalSettings, clearGlobalSettings } =
    useSettingsStore();
  const [starterScale, setStarterScale] = React.useState<number>(1);
  const [showGlobalForm, setShowGlobalForm] = React.useState<boolean>(true);
  const assetsRef = useRef<HTMLDivElement | null>(null);

  const collapse = useSidebarCollapse();
  const conv = useConversations();

  const bookmark = useBookmarkModal();

  // collapse and archived persistence moved into hooks

  // Placeholder assets (in state so delete works)
  const [assets, setAssets] = React.useState(
    [
      {
        id: "asset-1",
        name: "Demo Image",
        thumbnailUrl: "/demo.png",
        url: "/demo.png",
        mimeType: "image/png",
      },
      {
        id: "asset-2",
        name: "Spec Sheet.pdf",
        url: "/demo.png", // placeholder; replace with real file URL
        mimeType: "application/pdf",
      },
      {
        id: "asset-3",
        name: "Scene Background.jpg",
        thumbnailUrl: "/demo.png",
        url: "/demo.png",
        mimeType: "image/jpeg",
      },
    ] as any[],
  );

  const agents = useMemo(() => {
    const base = [
      { id: "agent-1", name: "Sales Assistant" },
      { id: "agent-2", name: "Support Bot" },
    ];

    if (agentSettings?.id) {
      return [
        {
          id: agentSettings.id,
          name: agentSettings.name || "Configured Agent",
        },
        ...base,
      ];
    }

    return base;
  }, [agentSettings]);
  const openBookmarkModal = bookmark.openBookmarkModal;

  const totalCount = conv.totalCount;

  // Build a map of conversations by ID for fast lookup in bookmarks tree
  const conversationsById = useMemo(() => {
    const map: Record<string, import("@/components/Sidebar/types").Conversation> = {};
    if (conv.groups) {
      for (const g of conv.groups) {
        for (const c of g.conversations) {
          map[c.id] = c;
        }
      }
    }
    return map;
  }, [conv.groups]);

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
    ],
    [],
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
          />
        </SidebarHeader>

        <SidebarContent className="pt-2">
          {/* Theme controls under header (Zola chat/avatar area) */}
          <div className="px-2 pb-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
              <span className="text-xs text-muted-foreground group-data-[state=collapsed]/sidebar:hidden">
                Theme
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
            >
              <PlusIcon className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">
                New Chat
              </span>
            </Button>
            <Button
              className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
              variant="outline"
              onClick={() => router.push("/bookmarks")}
            >
              <Bookmark className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">
                Bookmarks
              </span>
            </Button>
          </div>

          {/* Applications Starter */}
          <ApplicationsStarter
            apps={apps}
            clearGlobalSettings={clearGlobalSettings}
            collapsedStarter={collapse.collapsedStarter}
            currentAgent={currentAgent}
            globalSettings={globalSettings}
            setCollapsedStarter={collapse.setCollapsedStarter}
            setGlobalSettings={setGlobalSettings}
            setShowGlobalForm={setShowGlobalForm}
            setStarterScale={(n) => setStarterScale(n)}
            showGlobalForm={showGlobalForm}
            starterScale={starterScale}
            updateAgent={updateAgent}
          />

          {conv.loading && (
            <div className="px-2">
              <div className="mb-2 h-3 w-24 rounded bg-muted" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mb-2 h-8 rounded bg-muted" />
              ))}
            </div>
          )}

          {/* Assets */}
          <AssetsSection
            assets={assets as any}
            assetsRef={assetsRef}
            collapsedAssets={collapse.collapsedAssets}
            onDelete={(id) => setAssets((prev) => prev.filter((a: any) => a.id !== id))}
            setCollapsedAssets={collapse.setCollapsedAssets}
          />

          {/* Agents */}
          <AgentsSection
            agents={agents as any}
            collapsedAgents={collapse.collapsedAgents}
            setCollapsedAgents={collapse.setCollapsedAgents}
          />

          {/* Bookmarks (File Tree) */}
          <BookmarksSection
            bookmarkFolders={bookmark.bookmarkFolders}
            bookmarkedIds={bookmark.bookmarkedIds}
            bookmarkMeta={bookmark.bookmarkMeta}
            collapsedBookmarks={collapse.collapsedBookmarks}
            conversationsById={conversationsById}
            onOpenChat={(c) => onSelect?.(c)}
            setCollapsedBookmarks={collapse.setCollapsedBookmarks}
          />

          {/* Knowledge Base (File Tree) */}
          <KnowledgebaseSection
            collapsedKnowledge={collapse.collapsedKnowledge}
            setCollapsedKnowledge={collapse.setCollapsedKnowledge}
            tree={knowledgeTree as any}
            onOpenItem={(id) => {
              // TODO: implement real navigation when KB is integrated
              console.debug("Open KB item", id);
            }}
            onOpenMarkdown={() => {
              // Navigate to a markdown viewer route (replace with your implementation)
              router.push("/knowledge/markdown");
            }}
            onStartApiSync={() => {
              // Trigger OAuth flow for API sync (replace with your real auth)
              console.debug("KB OAuth: begin auth flow");
            }}
          />

          {/* Messages Section (threads grouped under their own dropdown) */}
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
        </SidebarContent>

        <SidebarFooter className="px-2" />
      </UISidebar>
      <CollapsedEdgeTrigger />
      {/* Bookmark Modal */}
      <BookmarkModal
        bookmarkFolders={bookmark.bookmarkFolders}
        bookmarkTargetId={bookmark.bookmarkTargetId}
        bookmarkedIds={bookmark.bookmarkedIds}
        draftFolderId={bookmark.draftFolderId}
        draftNewFolder={bookmark.draftNewFolder}
        draftTags={bookmark.draftTags}
        open={bookmark.bookmarkModalOpen}
        setDraftFolderId={bookmark.setDraftFolderId}
        setDraftNewFolder={bookmark.setDraftNewFolder}
        setDraftTags={bookmark.setDraftTags}
        onClose={bookmark.close}
        onRemove={bookmark.handleRemoveBookmark}
        onSave={bookmark.saveBookmark}
      />
    </SidebarProvider>
  );
};

export default Sidebar;
