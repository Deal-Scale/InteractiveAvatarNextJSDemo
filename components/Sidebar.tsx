"use client";

import React, { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { Plus as PlusIcon, PanelLeft, Settings, ChevronRight, Search, AppWindow, Image as ImageIcon, Trash2, Archive, Bookmark, BookmarkCheck, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useSessionStore } from "@/lib/stores/session";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
};

type ConversationGroup = {
  period: string;
  conversations: Conversation[];
};

export interface AppOption {
  id: string;
  label: string;
  icon?: ReactNode;
  imageUrl?: string; // optional image support for app tiles
}

export interface SidebarProps {
  onSelect?: (c: Conversation) => void;
  apps?: AppOption[];
}

function CollapsedEdgeTrigger() {
  const { open, setOpen } = useSidebar();
  const { openConfigModal } = useSessionStore();
  if (open) return null;
  return (
    <div className="fixed left-3 bottom-3 z-50 flex flex-col items-start gap-2">
      <Button
        aria-label="Open sidebar"
        className="size-9 inline-flex items-center justify-center rounded-full bg-zinc-800/90 text-white shadow hover:bg-zinc-700"
        onClick={() => setOpen(true)}
        variant="ghost"
      >
        <ChevronRight className="size-5" />
      </Button>
      <Button
        aria-label="Avatar settings"
        className="size-9 inline-flex items-center justify-center rounded-full bg-zinc-800/90 text-white shadow hover:bg-zinc-700"
        onClick={openConfigModal}
        variant="ghost"
      >
        <Settings className="size-5" />
      </Button>
    </div>
  );
}

// Cache key and TTL for conversations
const CACHE_KEY = "conversations.cache.v1";
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

function loadFromCache(): ConversationGroup[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: ConversationGroup[] };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function saveToCache(data: ConversationGroup[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {}
}

// Simulated fetch to demonstrate lazy load + caching
async function fetchConversations(): Promise<ConversationGroup[]> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 350));
  return [
    {
      period: "Today",
      conversations: [
        {
          id: "t1",
          title: "Project roadmap discussion",
          lastMessage:
            "Let's prioritize the authentication features for the next sprint.",
          timestamp: Date.now() - 2 * 60 * 60 * 1000,
        },
        {
          id: "t2",
          title: "API Documentation Review",
          lastMessage:
            "The endpoint descriptions need more detail about rate limiting.",
          timestamp: Date.now() - 5 * 60 * 60 * 1000,
        },
        {
          id: "t3",
          title: "Frontend Bug Analysis",
          lastMessage:
            "I found the issue - we need to handle the null state in the user profile component.",
          timestamp: Date.now() - 8 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Yesterday",
      conversations: [
        {
          id: "y1",
          title: "Database Schema Design",
          lastMessage:
            "Let's add indexes to improve query performance on these tables.",
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
        },
        {
          id: "y2",
          title: "Performance Optimization",
          lastMessage:
            "The lazy loading implementation reduced initial load time by 40%.",
          timestamp: Date.now() - 24 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Last 7 days",
      conversations: [
        {
          id: "w1",
          title: "Authentication Flow",
          lastMessage: "We should implement the OAuth2 flow with refresh tokens.",
          timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        },
        {
          id: "w2",
          title: "Component Library",
          lastMessage:
            "These new UI components follow the design system guidelines perfectly.",
          timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
        {
          id: "w3",
          title: "UI/UX Feedback",
          lastMessage:
            "The navigation redesign received positive feedback from the test group.",
          timestamp: Date.now() - 6 * 24 * 60 * 60 * 1000,
        },
      ],
    },
    {
      period: "Last month",
      conversations: [
        {
          id: "m1",
          title: "Initial Project Setup",
          lastMessage:
            "All the development environments are now configured consistently.",
          timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
        },
      ],
    },
  ];
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect, apps }) => {
  const [groups, setGroups] = useState<ConversationGroup[] | null>(() => loadFromCache());
  const [loading, setLoading] = useState<boolean>(!groups);
  const { agentSettings } = useSessionStore();
  const [query, setQuery] = useState("");
  const [starterScale, setStarterScale] = useState<number>(1);
  const [collapsedStarter, setCollapsedStarter] = useState<boolean>(false);
  const [collapsedAssets, setCollapsedAssets] = useState<boolean>(false);
  const [collapsedAgents, setCollapsedAgents] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("sidebar.bookmarks.v1");
      if (!raw) return new Set();
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  const [archivedIds, setArchivedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem("sidebar.archived.v1");
      if (!raw) return new Set();
      return new Set<string>(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  const assetsRef = useRef<HTMLDivElement | null>(null);

  // Persisted collapse state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("sidebar.collapsed.v1");
      if (raw) {
        const data = JSON.parse(raw) as {
          starter?: boolean;
          assets?: boolean;
          agents?: boolean;
          groups?: string[];
        };
        if (typeof data.starter === "boolean") setCollapsedStarter(data.starter);
        if (typeof data.assets === "boolean") setCollapsedAssets(data.assets);
        if (typeof data.agents === "boolean") setCollapsedAgents(data.agents);
        if (Array.isArray(data.groups)) setCollapsedGroups(new Set(data.groups));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "sidebar.collapsed.v1",
        JSON.stringify({
          starter: collapsedStarter,
          assets: collapsedAssets,
          agents: collapsedAgents,
          groups: Array.from(collapsedGroups),
        }),
      );
    } catch {}
  }, [collapsedStarter, collapsedAssets, collapsedAgents, collapsedGroups]);

  // Persist bookmarks and archived
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("sidebar.bookmarks.v1", JSON.stringify(Array.from(bookmarkedIds)));
    } catch {}
  }, [bookmarkedIds]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("sidebar.archived.v1", JSON.stringify(Array.from(archivedIds)));
    } catch {}
  }, [archivedIds]);

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

  // Search only filters conversations (title and lastMessage)
  const filteredGroups = useMemo(() => {
    if (!groups) return null;
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        conversations: g.conversations.filter(
          (c) =>
            !archivedIds.has(c.id) &&
            (c.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.conversations.length > 0);
  }, [groups, query, archivedIds]);

  // Derived archived conversations list
  const archivedList = useMemo(() => {
    if (!groups) return [] as Conversation[];
    const all = groups.flatMap((g) => g.conversations);
    return all.filter((c) => archivedIds.has(c.id));
  }, [groups, archivedIds]);

  // Handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const deleteSelected = () => {
    if (!groups || selectedIds.size === 0) return;
    const nextGroups = groups.map((g) => ({
      ...g,
      conversations: g.conversations.filter((c) => !selectedIds.has(c.id)),
    }));
    setGroups(nextGroups);
    saveToCache(nextGroups);
    clearSelection();
    setSelectionMode(false);
  };

  const archiveSelected = () => {
    if (selectedIds.size === 0) return;
    setArchivedIds((prev) => new Set([...Array.from(prev), ...Array.from(selectedIds)]));
    clearSelection();
    setSelectionMode(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Initial lazy load with cache
  useEffect(() => {
    let mounted = true;
    if (!groups) {
      fetchConversations().then((data) => {
        if (!mounted) return;
        setGroups(data);
        saveToCache(data);
        setLoading(false);
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = useMemo(
    () => groups?.reduce((acc, g) => acc + g.conversations.length, 0) ?? 0,
    [groups]
  );

  return (
    <SidebarProvider>
      <UISidebar className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
        <SidebarHeader className="flex flex-col gap-2 px-2 py-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2 px-2">
              <div className="bg-primary/10 size-8 rounded-md" />
              <div className="text-md font-medium tracking-tight text-foreground group-data-[state=collapsed]/sidebar:hidden">
                zola.chat
              </div>
            </div>
            <HeaderActionsStack
              onAssetsClick={() => {
                setCollapsedAssets(false);
                assetsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          </div>

          {/* Search (filters conversations only) */}
          <div className="px-2 group-data-[state=collapsed]/sidebar:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 pl-8 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="pt-2">
          {/* Bulk selection toolbar */}
          <div className="px-2 pb-2 group-data-[state=collapsed]/sidebar:hidden">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-background text-foreground border border-border hover:bg-muted"
                onClick={() => {
                  if (selectionMode) {
                    clearSelection();
                    setSelectionMode(false);
                  } else {
                    setSelectionMode(true);
                  }
                }}
              >
                <CheckSquare className="size-4" />
                <span>{selectionMode ? "Cancel Select" : "Select"}</span>
              </Button>
              {selectionMode && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-red-600 border-border hover:bg-muted"
                    onClick={deleteSelected}
                  >
                    <Trash2 className="size-4" /> Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-border hover:bg-muted"
                    onClick={archiveSelected}
                  >
                    <Archive className="size-4" /> Archive
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="px-2">
            <Button
              variant="outline"
              className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center bg-background text-foreground border border-border hover:bg-muted"
            >
              <PlusIcon className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">New Chat</span>
            </Button>
          </div>

          {/* Applications Starter */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
              onClick={() => setCollapsedStarter((v) => !v)}
            >
              <SidebarGroupLabel>Applications Starter</SidebarGroupLabel>
              <ChevronRight
                className={`size-3 transition-transform ${collapsedStarter ? "rotate-0" : "rotate-90"}`}
              />
            </button>
            {!collapsedStarter && (
              <>
                <div className="px-2 py-1 group-data-[state=collapsed]/sidebar:hidden">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>Card size</span>
                    <span>{starterScale.toFixed(1)}x</span>
                  </div>
                  <Slider value={[starterScale]} min={0.8} max={1.4} step={0.1} onValueChange={(v) => setStarterScale(v[0] ?? 1)} />
                </div>
                <SidebarMenu>
                  {(
                    (apps && apps.length > 0
                      ? apps
                      : [
                          { id: "starter-1", label: "Quick Demo", icon: <AppWindow className="size-4" /> },
                          { id: "starter-2", label: "Sales Flow", icon: <AppWindow className="size-4" /> },
                          { id: "starter-3", label: "Support Flow", icon: <AppWindow className="size-4" /> },
                        ]) as AppOption[]
                  ).map((s) => (
                    <SidebarMenuButton key={s.id} className="justify-start">
                      <span className="mr-2 inline-flex size-4 items-center justify-center overflow-hidden rounded">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt={s.label} className="h-4 w-4 object-cover" />
                        ) : (
                          s.icon ?? <AppWindow className="size-4" />
                        )}
                      </span>
                      <span
                        style={{ transform: `scale(${starterScale})`, transformOrigin: "left center" }}
                      >
                        {s.label}
                      </span>
                    </SidebarMenuButton>
                  ))}
                </SidebarMenu>
              </>
            )}
          </SidebarGroup>

          

          {loading && (
            <div className="px-2">
              <div className="mb-2 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700/60" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mb-2 h-8 rounded bg-zinc-100 dark:bg-zinc-700/40" />
              ))}
            </div>
          )}

          {!loading && filteredGroups && filteredGroups.map((group) => (
            <SidebarGroup key={group.period}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                onClick={() =>
                  setCollapsedGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(group.period)) next.delete(group.period);
                    else next.add(group.period);
                    return next;
                  })
                }
              >
                <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
                <ChevronRight
                  className={`size-3 transition-transform ${collapsedGroups.has(group.period) ? "rotate-0" : "rotate-90"}`}
                />
              </button>
              {!collapsedGroups.has(group.period) && (
                <SidebarMenu>
                  {group.conversations
                    .filter((c) => !archivedIds.has(c.id))
                    .map((conversation) => {
                      const isBookmarked = bookmarkedIds.has(conversation.id);
                      const isSelected = selectedIds.has(conversation.id);
                      return (
                        <SidebarMenuButton
                          key={conversation.id}
                          onClick={() => {
                            if (selectionMode) toggleSelect(conversation.id);
                            else onSelect?.(conversation);
                          }}
                          className=""
                        >
                          <div className="flex w-full items-center gap-2">
                            {selectionMode && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(conversation.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="size-4 accent-primary"
                                aria-label={isSelected ? "Deselect conversation" : "Select conversation"}
                              />
                            )}
                            <div className="min-w-0 flex-1 truncate pr-2">{conversation.title}</div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(conversation.id);
                              }}
                              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                              className="inline-flex items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted"
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="size-4 text-primary" />
                              ) : (
                                <Bookmark className="size-4" />
                              )}
                            </button>
                          </div>
                        </SidebarMenuButton>
                      );
                    })}
                </SidebarMenu>
              )}
            </SidebarGroup>
          ))}

          {/* Assets (moved after messages) */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
              onClick={() => setCollapsedAssets((v) => !v)}
            >
              <SidebarGroupLabel>Assets</SidebarGroupLabel>
              <ChevronRight
                className={`size-3 transition-transform ${collapsedAssets ? "rotate-0" : "rotate-90"}`}
              />
            </button>
            <div ref={assetsRef} />
            {!collapsedAssets && (
              <SidebarMenu>
                {assets.map((asset) => (
                  <SidebarMenuButton key={asset.id} className="justify-start">
                    {"thumbnailUrl" in (asset as any) && (asset as any).thumbnailUrl ? (
                      <img
                        src={(asset as any).thumbnailUrl as string}
                        alt={asset.name}
                        className="mr-2 size-4 rounded object-cover"
                      />
                    ) : null}
                    <span className="truncate pr-2">{asset.name}</span>
                  </SidebarMenuButton>
                ))}
                {assets.length === 0 && (
                  <div className="px-3 py-2 text-xs text-zinc-500">No assets found</div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroup>

          {/* Agents (moved after messages) */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
              onClick={() => setCollapsedAgents((v) => !v)}
            >
              <SidebarGroupLabel>Agents</SidebarGroupLabel>
              <ChevronRight
                className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`}
              />
            </button>
            {!collapsedAgents && (
              <SidebarMenu>
                {agents.map((agent) => (
                  <SidebarMenuButton key={agent.id} className="justify-start">
                    <span className="truncate pr-2">{agent.name}</span>
                  </SidebarMenuButton>
                ))}
                {agents.length === 0 && (
                  <div className="px-3 py-2 text-xs text-zinc-500">No agents found</div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2">
          <div className="text-xs text-muted-foreground group-data-[state=collapsed]/sidebar:hidden">
            {totalCount} conversations • {archivedList.length} archived
          </div>
        </SidebarFooter>
      </UISidebar>
      <CollapsedEdgeTrigger />
    </SidebarProvider>
  );
};

function HeaderActionsStack({ onAssetsClick }: { onAssetsClick?: () => void }) {
  const { openConfigModal } = useSessionStore();
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        className="size-8 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        aria-label="Assets"
        onClick={onAssetsClick}
      >
        <ImageIcon className="size-4" />
      </Button>
      <Button
        variant="ghost"
        className="size-8 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        aria-label="Avatar settings"
        onClick={openConfigModal}
      >
        <Settings className="size-4" />
      </Button>
      <SidebarTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60">
        <PanelLeft className="size-4" />
      </SidebarTrigger>
    </div>
  );
}

export default Sidebar;
