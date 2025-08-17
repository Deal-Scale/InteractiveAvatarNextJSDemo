"use client";

import { useEffect, useState } from "react";

export default function useSidebarCollapse() {
  // Defaults: only Messages open by default
  const [collapsedStarter, setCollapsedStarter] = useState<boolean>(true);
  const [collapsedAssets, setCollapsedAssets] = useState<boolean>(true);
  const [collapsedAgents, setCollapsedAgents] = useState<boolean>(true);
  const [collapsedBookmarks, setCollapsedBookmarks] = useState<boolean>(true);
  const [collapsedKnowledge, setCollapsedKnowledge] = useState<boolean>(true);
  const [collapsedMessages, setCollapsedMessages] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Load persisted collapse state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // bump version to v3 to include bookmarks and knowledge sections
      const rawV3 = localStorage.getItem("sidebar.collapsed.v3");
      const rawV2 = localStorage.getItem("sidebar.collapsed.v2");

      const raw = rawV3 || rawV2;

      if (raw) {
        const data = JSON.parse(raw) as {
          starter?: boolean;
          assets?: boolean;
          agents?: boolean;
          bookmarks?: boolean;
          knowledge?: boolean;
          messages?: boolean;
          groups?: string[];
        };

        if (typeof data.starter === "boolean")
          setCollapsedStarter(data.starter);
        if (typeof data.assets === "boolean") setCollapsedAssets(data.assets);
        if (typeof data.agents === "boolean") setCollapsedAgents(data.agents);
        if (typeof data.bookmarks === "boolean")
          setCollapsedBookmarks(data.bookmarks);
        if (typeof data.knowledge === "boolean")
          setCollapsedKnowledge(data.knowledge);
        if (typeof data.messages === "boolean")
          setCollapsedMessages(data.messages);
        if (Array.isArray(data.groups))
          setCollapsedGroups(new Set(data.groups));
      }
    } catch {}
  }, []);

  // Persist collapse state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "sidebar.collapsed.v3",
        JSON.stringify({
          starter: collapsedStarter,
          assets: collapsedAssets,
          agents: collapsedAgents,
          bookmarks: collapsedBookmarks,
          knowledge: collapsedKnowledge,
          messages: collapsedMessages,
          groups: Array.from(collapsedGroups),
        }),
      );
    } catch {}
  }, [
    collapsedStarter,
    collapsedAssets,
    collapsedAgents,
    collapsedBookmarks,
    collapsedKnowledge,
    collapsedMessages,
    collapsedGroups,
  ]);

  return {
    collapsedStarter,
    setCollapsedStarter,
    collapsedAssets,
    setCollapsedAssets,
    collapsedAgents,
    setCollapsedAgents,
    collapsedBookmarks,
    setCollapsedBookmarks,
    collapsedKnowledge,
    setCollapsedKnowledge,
    collapsedMessages,
    setCollapsedMessages,
    collapsedGroups,
    setCollapsedGroups,
  } as const;
}

