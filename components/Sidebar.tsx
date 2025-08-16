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
import { Plus as PlusIcon, PanelLeft, Settings, ChevronRight } from "lucide-react";

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
        <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-2 py-2">
          <div className="flex flex-row items-center gap-2 px-2">
            <div className="bg-primary/10 size-8 rounded-md" />
            <div className="text-md font-medium text-primary tracking-tight group-data-[state=collapsed]/sidebar:hidden">
              zola.chat
            </div>
          </div>
          <HeaderActionsStack />
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
              <SidebarGroupLabel>{group.period}</SidebarGroupLabel>
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
