"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import AgentCard, { type Agent } from "./AgentCard";
import AgentModal from "./AgentModal";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function AgentsSection(props: {
  agents: Array<Agent | { id: string; name: string }>;
  collapsedAgents: boolean;
  setCollapsedAgents: (fn: (v: boolean) => boolean) => void;
  onFavorite?: (id: string, next: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (agent: Agent) => void;
  onAdd?: () => void;
}) {
  const {
    agents,
    collapsedAgents,
    setCollapsedAgents,
    onFavorite,
    onDelete,
    onEdit,
    onAdd,
  } = props;

  // Normalize minimal agents
  const normalizedAgents: Agent[] = useMemo(
    () =>
      agents.map((a) => ({
        id: (a as any).id,
        name: (a as any).name,
        avatarUrl: (a as any).avatarUrl,
        role: (a as any).role,
        description: (a as any).description,
        tags: (a as any).tags,
        isOwnedByUser: (a as any).isOwnedByUser,
      })),
    [agents],
  );

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit" | "create">("view");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return normalizedAgents;

    return normalizedAgents.filter((a) => {
      const nameHit = a.name?.toLowerCase().includes(q);
      const roleHit = a.role?.toLowerCase().includes(q);
      const tagHit = (a.tags || []).some((t) => t.toLowerCase().includes(q));

      return nameHit || roleHit || tagHit;
    });
  }, [normalizedAgents, query]);

  const selected = useMemo(
    () => normalizedAgents.find((a) => a.id === selectedId) || null,
    [normalizedAgents, selectedId],
  );

  return (
    <SidebarGroup>
      <button
        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
        type="button"
        onClick={() => setCollapsedAgents((v) => !v)}
      >
        <SidebarGroupLabel>Agents</SidebarGroupLabel>
        <ChevronRight
          className={`size-3 transition-transform ${collapsedAgents ? "rotate-0" : "rotate-90"}`}
        />
      </button>

      {!collapsedAgents && (
        <div className="px-2 pb-2">
          <div className="mb-2 flex items-center gap-2">
            <Button
              onClick={() => {
                // Optional external hook
                onAdd?.();
                // Open create modal locally
                setSelectedId(null);
                setMode("create");
                setOpen(true);
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-1 size-3" />
              Add New
            </Button>
            <input
              aria-label="Search agents by name, role or tag"
              className="w-full rounded-md border bg-background px-2 py-1 text-xs outline-none ring-0 focus:border-primary"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents (e.g., Alice, support, #sales)"
              type="text"
              value={query}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="px-1 py-2 text-xs text-muted-foreground">
              No agents found
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onDelete={onDelete}
                  onFavorite={onFavorite}
                  onOpen={(a) => {
                    setSelectedId(a.id);
                    setMode("view");
                    setOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          <AgentModal
            mode={mode}
            agent={selected}
            open={open}
            onOpenChange={(o) => setOpen(o)}
            onRequestEdit={() => setMode("edit")}
            onSave={(updated) => {
              onEdit?.(updated);
            }}
          />
        </div>
      )}
    </SidebarGroup>
  );
}
