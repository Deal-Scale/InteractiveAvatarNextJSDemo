"use client";

import { useEffect, useState } from "react";

export default function useSidebarCollapse() {
  const [collapsedStarter, setCollapsedStarter] = useState<boolean>(false);
  const [collapsedAssets, setCollapsedAssets] = useState<boolean>(false);
  const [collapsedAgents, setCollapsedAgents] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Load persisted collapse state
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

  // Persist collapse state
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

  return {
    collapsedStarter,
    setCollapsedStarter,
    collapsedAssets,
    setCollapsedAssets,
    collapsedAgents,
    setCollapsedAgents,
    collapsedGroups,
    setCollapsedGroups,
  } as const;
}
