"use client";

import React, { useMemo, useRef } from "react";
import { Plus as PlusIcon, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/stores/session";
import { useAgentStore } from "@/lib/stores/agent";
import { useSettingsStore } from "@/lib/stores/settings";
import { useRouter } from "next/navigation";
import { Sidebar as UISidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarFooter } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ThemeEmotionSelect from "@/components/ui/theme-emotion-select";

import type { SidebarProps } from "@/components/Sidebar/types";
import { formatCompactNumber } from "@/components/Sidebar/utils/format";
import CollapsedEdgeTrigger from "@/components/Sidebar/CollapsedEdgeTrigger";
import ApplicationsStarter from "@/components/Sidebar/ApplicationsStarter";
import ConversationsSection from "@/components/Sidebar/ConversationsSection";
import AssetsSection from "@/components/Sidebar/AssetsSection";
import AgentsSection from "@/components/Sidebar/AgentsSection";
import BookmarkModal from "@/components/Sidebar/BookmarkModal";
import useSidebarCollapse from "@/components/Sidebar/hooks/useSidebarCollapse";
import useConversations from "@/components/Sidebar/hooks/useConversations";
import useBookmarkModal from "@/components/Sidebar/hooks/useBookmarkModal";
import SidebarHeaderSection from "@/components/Sidebar/SidebarHeaderSection";

// types, utils, and subcomponents are imported from components/Sidebar/*

const Sidebar: React.FC<SidebarProps> = ({ onSelect, apps }) => {
  const router = useRouter();
  const { agentSettings } = useSessionStore();
  const { currentAgent, updateAgent } = useAgentStore();
  const { globalSettings, setGlobalSettings, clearGlobalSettings } = useSettingsStore();
  const [starterScale, setStarterScale] = React.useState<number>(1);
  const [showGlobalForm, setShowGlobalForm] = React.useState<boolean>(true);
  const assetsRef = useRef<HTMLDivElement | null>(null);

  const collapse = useSidebarCollapse();
  const conv = useConversations();

  const bookmark = useBookmarkModal();

  // collapse and archived persistence moved into hooks

  // Placeholder assets and agents; agents include current store agent when present
  const assets = useMemo(
    () => [
      { id: "asset-1", name: "Default Avatar 1" },
      { id: "asset-2", name: "Studio Background" },
      { id: "asset-3", name: "Office Background" },
    ],
    [],
  );

  const agents = useMemo(
    () => {
      const base = [
        { id: "agent-1", name: "Sales Assistant" },
        { id: "agent-2", name: "Support Bot" },
      ];
      if (agentSettings?.id) {
        return [
          { id: agentSettings.id, name: agentSettings.name || "Configured Agent" },
          ...base,
        ];
      }
      return base;
    },
    [agentSettings],
  );
  const openBookmarkModal = bookmark.openBookmarkModal;

  const totalCount = conv.totalCount;

  return (
    <SidebarProvider>
      <UISidebar className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <SidebarHeader>
          <SidebarHeaderSection
            onAssetsClick={() => {
              collapse.setCollapsedAssets(() => false);
              assetsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            query={conv.query}
            setQuery={conv.setQuery}
          />
        </SidebarHeader>

        <SidebarContent className="pt-2">
          <div className="px-2">
            <Button
              variant="outline"
              className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
            >
              <PlusIcon className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">New Chat</span>
            </Button>
            <Button
              variant="outline"
              className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
              onClick={() => router.push("/bookmarks")}
            >
              <Bookmark className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">Bookmarks</span>
            </Button>
          </div>

          

          {/* Applications Starter */}
          <ApplicationsStarter
            collapsedStarter={collapse.collapsedStarter}
            setCollapsedStarter={collapse.setCollapsedStarter}
            starterScale={starterScale}
            setStarterScale={(n) => setStarterScale(n)}
            currentAgent={currentAgent}
            updateAgent={updateAgent}
            globalSettings={globalSettings}
            setGlobalSettings={setGlobalSettings}
            clearGlobalSettings={clearGlobalSettings}
            showGlobalForm={showGlobalForm}
            setShowGlobalForm={setShowGlobalForm}
            apps={apps}
          />

          

          {conv.loading && (
            <div className="px-2">
              <div className="mb-2 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700/60" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mb-2 h-8 rounded bg-zinc-100 dark:bg-zinc-700/40" />
              ))}
            </div>
          )}

          {/* Selection toggle above chats */}
          {!conv.loading && (
            <div className="px-2 pb-2 group-data-[state=collapsed]/sidebar:hidden">
              <Button
                variant="outline"
                className="w-full justify-center border border-border hover:bg-muted"
                onClick={() => {
                  if (conv.selectionMode) {
                    conv.clearSelection();
                    conv.setSelectionMode(false);
                  } else {
                    conv.setSelectionMode(true);
                    conv.setSelectedIds(new Set(conv.visibleConversationIds));
                  }
                }}
                disabled={!conv.filteredGroups || conv.visibleConversationIds.length === 0}
              >
                {conv.selectionMode ? "Deselect All" : "Select Visible"}
              </Button>
            </div>
          )}

          {/* Conversations count above chats */}
          {!conv.loading && (
            <div className="px-2 pb-1 text-center text-xs group-data-[state=collapsed]/sidebar:hidden">
              <span className="inline-block px-1 bg-aurora bg-clip-text text-transparent">
                {formatCompactNumber(totalCount)} conversations • {formatCompactNumber(conv.archivedList.length)} archived
              </span>
            </div>
          )}

          {!conv.loading && conv.filteredGroups && (
            <ConversationsSection
              groups={conv.filteredGroups}
              collapsedGroups={collapse.collapsedGroups}
              setCollapsedGroups={collapse.setCollapsedGroups}
              bookmarkedIds={bookmark.bookmarkedIds}
              selectionMode={conv.selectionMode}
              selectedIds={conv.selectedIds}
              toggleSelect={conv.toggleSelect}
              onSelect={onSelect}
              openBookmarkModal={openBookmarkModal}
              archivedIds={conv.archivedIds}
            />
          )}

          {/* Assets (moved after messages) */}
          <AssetsSection assets={assets as any} collapsedAssets={collapse.collapsedAssets} setCollapsedAssets={collapse.setCollapsedAssets} assetsRef={assetsRef} />

          {/* Agents (moved after messages) */}
          <AgentsSection agents={agents as any} collapsedAgents={collapse.collapsedAgents} setCollapsedAgents={collapse.setCollapsedAgents} />
        </SidebarContent>

        <SidebarFooter className="px-2">
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
            <span className="text-xs text-muted-foreground group-data-[state=collapsed]/sidebar:hidden">Theme</span>
            <ThemeEmotionSelect className="group-data-[state=collapsed]/sidebar:hidden" />
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
          <div className="h-2" />
        </SidebarFooter>
      </UISidebar>
      <CollapsedEdgeTrigger />
      {/* Bookmark Modal */}
      <BookmarkModal
        open={bookmark.bookmarkModalOpen}
        onClose={bookmark.close}
        bookmarkedIds={bookmark.bookmarkedIds}
        bookmarkTargetId={bookmark.bookmarkTargetId}
        bookmarkFolders={bookmark.bookmarkFolders}
        draftFolderId={bookmark.draftFolderId}
        setDraftFolderId={bookmark.setDraftFolderId}
        draftNewFolder={bookmark.draftNewFolder}
        setDraftNewFolder={bookmark.setDraftNewFolder}
        draftTags={bookmark.draftTags}
        setDraftTags={bookmark.setDraftTags}
        onRemove={bookmark.handleRemoveBookmark}
        onSave={bookmark.saveBookmark}
      />
    </SidebarProvider>
  );
};

export default Sidebar;
