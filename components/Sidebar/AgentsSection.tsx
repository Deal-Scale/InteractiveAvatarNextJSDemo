"use client";

import { ChevronRight } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";

export default function AgentsSection(props: {
  agents: { id: string; name: string }[];
  collapsedAgents: boolean;
  setCollapsedAgents: (fn: (v: boolean) => boolean) => void;
}) {
  const { agents, collapsedAgents, setCollapsedAgents } = props;

  return (
    <SidebarGroup>
      <button
        type="button"
        className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        onClick={() => setCollapsedAgents((v) => !v)}
      >
        <SidebarGroupLabel>Agents</SidebarGroupLabel>
        <ChevronRight className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`} />
      </button>
      {!collapsedAgents && (
        <SidebarMenu>
          {agents.map((agent) => (
            <SidebarMenuButton key={agent.id} className="justify-start">
              <span className="truncate pr-2">{agent.name}</span>
            </SidebarMenuButton>
          ))}
          {agents.length === 0 && <div className="px-3 py-2 text-xs text-zinc-500">No agents found</div>}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
