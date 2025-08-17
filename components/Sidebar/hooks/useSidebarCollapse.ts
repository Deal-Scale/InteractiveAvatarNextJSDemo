"use client";

import { useEffect, useState } from "react";

export default function useSidebarCollapse() {
  // Defaults: only Messages open by default
  const [collapsedStarter, setCollapsedStarter] = useState<boolean>(true);
  const [collapsedAssets, setCollapsedAssets] = useState<boolean>(true);
  const [collapsedAgents, setCollapsedAgents] = useState<boolean>(true);
  const [collapsedMessages, setCollapsedMessages] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  // Load persisted collapse state
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // bump version to v2 to apply new defaults for users
      const raw = localStorage.getItem("sidebar.collapsed.v2");

      if (raw) {
        const data = JSON.parse(raw) as {
          starter?: boolean;
          assets?: boolean;
          agents?: boolean;
          messages?: boolean;
          groups?: string[];
        };

        if (typeof data.starter === "boolean")
          setCollapsedStarter(data.starter);
        if (typeof data.assets === "boolean") setCollapsedAssets(data.assets);
        if (typeof data.agents === "boolean") setCollapsedAgents(data.agents);
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
        "sidebar.collapsed.v2",
        JSON.stringify({
          starter: collapsedStarter,
          assets: collapsedAssets,
          agents: collapsedAgents,
          messages: collapsedMessages,
          groups: Array.from(collapsedGroups),
        }),
      );
    } catch {}
  }, [
    collapsedStarter,
    collapsedAssets,
    collapsedAgents,
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
    collapsedMessages,
    setCollapsedMessages,
    collapsedGroups,
    setCollapsedGroups,
  } as const;
}

