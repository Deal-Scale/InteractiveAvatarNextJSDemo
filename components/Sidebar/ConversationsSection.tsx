"use client";

import { ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import type { Conversation, ConversationGroup } from "@/components/Sidebar/types";

export default function ConversationsSection(props: {
  groups: ConversationGroup[];
  collapsedGroups: Set<string>;
  setCollapsedGroups: (updater: (prev: Set<string>) => Set<string>) => void;
  bookmarkedIds: Set<string>;
  selectionMode: boolean;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  onSelect?: (c: Conversation) => void;
  openBookmarkModal: (id: string) => void;
  archivedIds: Set<string>;
}) {
  const {
    groups,
    collapsedGroups,
    setCollapsedGroups,
    bookmarkedIds,
    selectionMode,
    selectedIds,
    toggleSelect,
    onSelect,
    openBookmarkModal,
    archivedIds,
  } = props;

  return (
    <>
      {groups.map((group) => (
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
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            openBookmarkModal(conversation.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              openBookmarkModal(conversation.id);
                            }
                          }}
                          aria-label={isBookmarked ? "Edit bookmark" : "Add bookmark"}
                          className="inline-flex cursor-pointer items-center justify-center rounded p-1 text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="size-4 text-primary" />
                          ) : (
                            <Bookmark className="size-4" />
                          )}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  );
                })}
            </SidebarMenu>
          )}
        </SidebarGroup>
      ))}
    </>
  );
}
