"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="w-[92vw] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium">
            {bookmarkedIds.has(bookmarkTargetId || "")
              ? "Edit bookmark"
              : "Add bookmark"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Manage bookmark folder and tags
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Folder</label>
            <Select value={draftFolderId} onValueChange={setDraftFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="No folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No folder</SelectItem>
                {bookmarkFolders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Or create new folder</label>
            <Input
              type="text"
              placeholder="New folder name"
              value={draftNewFolder}
              onChange={(e) => setDraftNewFolder(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Tags (comma separated)</label>
            <Textarea
              rows={2}
              placeholder="e.g. roadmap, Q3, priority"
              value={draftTags}
              onChange={(e) => setDraftTags(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {draftFolderId
              ? `Folder: ${
                  bookmarkFolders.find((f) => f.id === draftFolderId)?.name || "(new)"
                }`
              : draftNewFolder
              ? `Folder: ${draftNewFolder}`
              : "No folder"}
          </div>
          <div className="flex items-center gap-2">
            {bookmarkedIds.has(bookmarkTargetId || "") && onRemove && (
              <Button variant="outline" size="sm" onClick={onRemove}>
                Remove
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

