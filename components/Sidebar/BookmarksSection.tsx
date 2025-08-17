"use client";

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
  File,
  Folder,
  Tree,
  type TreeViewElement,
} from "@/components/magicui/file-tree";
import type { Conversation } from "@/components/Sidebar/types";

export default function BookmarksSection(props: {
  collapsedBookmarks: boolean;
  setCollapsedBookmarks: (fn: (v: boolean) => boolean) => void;
  bookmarkedIds: Set<string>;
  bookmarkFolders: Array<{ id: string; name: string }>;
  bookmarkMeta: Record<
    string,
    { folderId?: string; tags?: string[] } | undefined
  >;
  conversationsById: Record<string, Conversation | undefined>;
  onOpenChat?: (c: Conversation) => void;
}) {
  const {
    collapsedBookmarks,
    setCollapsedBookmarks,
    bookmarkedIds,
    bookmarkFolders,
    bookmarkMeta,
    conversationsById,
    onOpenChat,
  } = props;

  const tree: TreeViewElement[] = useMemo(() => {
    const folders: Record<string, TreeViewElement> = {};

    // initialize folders
    for (const f of bookmarkFolders || []) {
      folders[f.id] = { id: f.id, name: f.name, children: [] };
    }

    const uncategorized: TreeViewElement = {
      id: "__uncategorized__",
      name: "Uncategorized",
      children: [],
    };

    for (const id of Array.from(bookmarkedIds || [])) {
      const conv = conversationsById[id];
      if (!conv) continue;

      const node: TreeViewElement = {
        id: conv.id,
        name: conv.title,
      };

      const meta = bookmarkMeta[id];
      const folderId = meta?.folderId;

      if (folderId && folders[folderId]) {
        folders[folderId].children = folders[folderId].children || [];
        folders[folderId].children!.push(node);
      } else {
        uncategorized.children!.push(node);
      }
    }

    const result = Object.values(folders).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    if (uncategorized.children && uncategorized.children.length > 0) {
      result.push(uncategorized);
    }
    return result;
  }, [bookmarkFolders, bookmarkedIds, bookmarkMeta, conversationsById]);

  return (
    <SidebarGroup>
      <button
        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted"
        type="button"
        onClick={() => setCollapsedBookmarks((v) => !v)}
      >
        <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
        <ChevronRight
          className={`size-3 transition-transform ${collapsedBookmarks ? "rotate-0" : "rotate-90"}`}
        />
      </button>

      {!collapsedBookmarks && (
        <div className="px-2 pb-2">
          {tree.length === 0 ? (
            <div className="px-1 py-2 text-xs text-muted-foreground">
              No bookmarks yet
            </div>
          ) : (
            <Tree className="text-xs">
              {tree.map((folder) => (
                <Folder key={folder.id} element={folder.name} value={folder.id}>
                  {(folder.children || []).map((child) => (
                    <File
                      key={child.id}
                      value={child.id}
                      onClick={() => {
                        const c = conversationsById[child.id];
                        if (c) onOpenChat?.(c);
                      }}
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
