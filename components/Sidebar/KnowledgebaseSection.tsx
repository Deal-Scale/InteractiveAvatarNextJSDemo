"use client";

import React from "react";
import { ChevronRight } from "lucide-react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
  File,
  Folder,
  Tree,
  type TreeViewElement,
} from "@/components/magicui/file-tree";

export default function KnowledgebaseSection(props: {
  collapsedKnowledge: boolean;
  setCollapsedKnowledge: (fn: (v: boolean) => boolean) => void;
  tree: TreeViewElement[];
  onOpenItem?: (id: string) => void;
  title?: string;
  onOpenMarkdown?: () => void;
  onStartApiSync?: () => void;
}) {
  const {
    collapsedKnowledge,
    setCollapsedKnowledge,
    tree,
    onOpenItem,
    title,
    onOpenMarkdown,
    onStartApiSync,
  } = props;

  return (
    <SidebarGroup>
      <button
        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
        type="button"
        onClick={() => setCollapsedKnowledge((v) => !v)}
      >
        <SidebarGroupLabel>{title || "Knowledge Base"}</SidebarGroupLabel>
        <ChevronRight
          className={`size-3 transition-transform ${collapsedKnowledge ? "rotate-0" : "rotate-90"}`}
        />
      </button>

      {!collapsedKnowledge && (
        <div className="px-2 pb-2">
          <div className="mb-2 flex gap-2">
            <button
              type="button"
              className="rounded border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => (onOpenMarkdown ? onOpenMarkdown() : console.debug("KB: open markdown"))}
            >
              Markdown
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => (onStartApiSync ? onStartApiSync() : console.debug("KB: start OAuth sync"))}
            >
              Live API Sync
            </button>
          </div>
          {tree.length === 0 ? (
            <div className="px-1 py-2 text-xs text-muted-foreground">
              No knowledge items
            </div>
          ) : (
            <Tree className="text-xs">
              {tree.map((folder) => (
                <Folder key={folder.id} element={folder.name} value={folder.id}>
                  {(folder.children || []).map((child) => (
                    <File
                      key={child.id}
                      value={child.id}
                      onClick={() => onOpenItem?.(child.id)}
                    >
                      {child.name}
                    </File>
                  ))}
                </Folder>
              ))}
            </Tree>
          )}
        </div>
      )}
    </SidebarGroup>
  );
}
