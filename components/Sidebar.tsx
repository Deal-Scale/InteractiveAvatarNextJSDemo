"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
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
import { Plus as PlusIcon, PanelLeft, Settings, ChevronRight, Search, AppWindow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

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

export interface SidebarProps {
  onSelect?: (c: Conversation) => void;
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

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const [groups, setGroups] = useState<ConversationGroup[] | null>(() => loadFromCache());
  const [loading, setLoading] = useState<boolean>(!groups);
  const { agentSettings } = useSessionStore();
  const [query, setQuery] = useState("");
  const [starterScale, setStarterScale] = useState<number>(1);
  const [collapsedStarter, setCollapsedStarter] = useState<boolean>(false);
  const [collapsedAssets, setCollapsedAssets] = useState<boolean>(false);
  const [collapsedAgents, setCollapsedAgents] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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

  const filteredAssets = useMemo(
    () => assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [assets, query],
  );
  const filteredAgents = useMemo(
    () => agents.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())),
    [agents, query],
  );

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
      <UISidebar>
        <SidebarHeader className="flex flex-col gap-2 px-2 py-2">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2 px-2">
              <div className="bg-primary/10 size-8 rounded-md" />
              <div className="text-md font-medium text-primary tracking-tight group-data-[state=collapsed]/sidebar:hidden">
                zola.chat
              </div>
            </div>
            <HeaderActionsStack />
          </div>

          {/* Search */}
          <div className="px-2 group-data-[state=collapsed]/sidebar:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assets and agents..."
                className="pl-8 h-9"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="pt-2">
          <div className="px-2">
            <Button
              variant="outline"
              className="mb-3 flex w-full items-center gap-2 group-data-[state=collapsed]/sidebar:justify-center"
            >
              <PlusIcon className="size-4" />
              <span className="group-data-[state=collapsed]/sidebar:hidden">New Chat</span>
            </Button>
          </div>

          {/* Applications Starter */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left"
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
                  {[
                    { id: 'starter-1', label: 'Quick Demo' },
                    { id: 'starter-2', label: 'Sales Flow' },
                    { id: 'starter-3', label: 'Support Flow' },
                  ].map((s) => (
                    <SidebarMenuButton key={s.id} className="justify-start">
                      <AppWindow className="size-4 mr-2" />
                      <span style={{ transform: `scale(${starterScale})`, transformOrigin: 'left center' }}>{s.label}</span>
                    </SidebarMenuButton>
                  ))}
                </SidebarMenu>
              </>
            )}
          </SidebarGroup>

          {/* Assets */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left"
              onClick={() => setCollapsedAssets((v) => !v)}
            >
              <SidebarGroupLabel>Assets</SidebarGroupLabel>
              <ChevronRight
                className={`size-3 transition-transform ${collapsedAssets ? "rotate-0" : "rotate-90"}`}
              />
            </button>
            {!collapsedAssets && (
              <SidebarMenu>
                {filteredAssets.map((asset) => (
                  <SidebarMenuButton key={asset.id} className="justify-start">
                    <span className="truncate pr-2">{asset.name}</span>
                  </SidebarMenuButton>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="px-3 py-2 text-xs text-zinc-500">No assets found</div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroup>

          {/* Agents */}
          <SidebarGroup>
            <button
              type="button"
              className="flex w-full items-center justify-between px-2 py-1 text-left"
              onClick={() => setCollapsedAgents((v) => !v)}
            >
              <SidebarGroupLabel>Agents</SidebarGroupLabel>
              <ChevronRight
                className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`}
              />
            </button>
            {!collapsedAgents && (
              <SidebarMenu>
                {filteredAgents.map((agent) => (
                  <SidebarMenuButton key={agent.id} className="justify-start">
                    <span className="truncate pr-2">{agent.name}</span>
                  </SidebarMenuButton>
                ))}
                {filteredAgents.length === 0 && (
                  <div className="px-3 py-2 text-xs text-zinc-500">No agents found</div>
                )}
              </SidebarMenu>
            )}
          </SidebarGroup>

          {loading && (
            <div className="px-2">
              <div className="mb-2 h-3 w-24 rounded bg-zinc-700/60" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="mb-2 h-8 rounded bg-zinc-700/40" />
              ))}
            </div>
          )}

          {!loading && groups && groups.map((group) => (
            <SidebarGroup key={group.period}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-2 py-1 text-left"
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
                  {group.conversations.map((conversation) => (
                    <SidebarMenuButton
                      key={conversation.id}
                      onClick={() => onSelect?.(conversation)}
                    >
                      <span className="truncate pr-2">{conversation.title}</span>
                    </SidebarMenuButton>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="px-2">
          <div className="text-xs text-zinc-400 group-data-[state=collapsed]/sidebar:hidden">
            {totalCount} conversations
          </div>
        </SidebarFooter>
      </UISidebar>
      <CollapsedEdgeTrigger />
    </SidebarProvider>
  );
};

function HeaderActionsStack() {
  const { openConfigModal } = useSessionStore();
  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="ghost"
        className="size-8"
        aria-label="Avatar settings"
        onClick={openConfigModal}
      >
        <Settings className="size-4" />
      </Button>
      <SidebarTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-zinc-700/60">
        <PanelLeft className="size-4" />
      </SidebarTrigger>
    </div>
  );
}

export default Sidebar;
