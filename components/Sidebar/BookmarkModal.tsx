"use client";

import { Button } from "@/components/ui/button";

export default function BookmarkModal(props: {
  open: boolean;
  onClose: () => void;
  bookmarkedIds: Set<string>;
  bookmarkTargetId: string | null;
  bookmarkFolders: { id: string; name: string }[];
  draftFolderId: string;
  setDraftFolderId: (v: string) => void;
  draftNewFolder: string;
  setDraftNewFolder: (v: string) => void;
  draftTags: string;
  setDraftTags: (v: string) => void;
  onRemove?: () => void;
  onSave: () => void;
}) {
  const {
    open,
    onClose,
    bookmarkedIds,
    bookmarkTargetId,
    bookmarkFolders,
    draftFolderId,
    setDraftFolderId,
    draftNewFolder,
    setDraftNewFolder,
    draftTags,
    setDraftTags,
    onRemove,
    onSave,
  } = props;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[61] w-[92vw] max-w-md rounded-lg border border-border bg-background p-4 text-foreground shadow-lg">
        <div className="mb-3 text-sm font-medium">
          {bookmarkedIds.has(bookmarkTargetId || "") ? "Edit bookmark" : "Add bookmark"}
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Folder</label>
            <select
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
              value={draftFolderId}
              onChange={(e) => setDraftFolderId(e.target.value)}
            >
              <option value="">No folder</option>
              {bookmarkFolders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Or create new folder</label>
            <input
              type="text"
              placeholder="New folder name"
              value={draftNewFolder}
              onChange={(e) => setDraftNewFolder(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Tags (comma separated)</label>
            <textarea
              rows={2}
              placeholder="e.g. roadmap, Q3, priority"
              value={draftTags}
              onChange={(e) => setDraftTags(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {draftFolderId
              ? `Folder: ${bookmarkFolders.find((f) => f.id === draftFolderId)?.name || "(new)"}`
              : draftNewFolder
              ? `Folder: ${draftNewFolder}`
              : "No folder"}
          </div>
          <div className="flex items-center gap-2">
            {bookmarkedIds.has(bookmarkTargetId || "") && onRemove && (
              <Button variant="outline" size="sm" className="border-border hover:bg-muted" onClick={onRemove}>
                Remove
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-border hover:bg-muted" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
