"use client";

import {
  ChevronRight,
  ImageIcon,
  FileIcon,
  X,
  Eye,
  Download as DownloadIcon,
  Plus,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAssetsStore } from "@/lib/stores/assets";

export default function AssetsSection(props: {
  assets: {
    id: string;
    name: string;
    thumbnailUrl?: string;
    url?: string;
    mimeType?: string;
  }[];
  collapsedAssets: boolean;
  setCollapsedAssets: (fn: (v: boolean) => boolean) => void;
  assetsRef: React.MutableRefObject<HTMLDivElement | null>;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onAttach?: (asset: {
    id: string;
    name: string;
    thumbnailUrl?: string;
    url?: string;
    mimeType?: string;
  }) => void;
}) {
  const { assets, collapsedAssets, setCollapsedAssets, assetsRef, onDelete, onAdd, onAttach } = props;

  const storeAssets = useAssetsStore((s) => s.assets);
  const uploads = useAssetsStore((s) => s.uploads);
  const uploadFiles = useAssetsStore((s) => s.uploadFiles);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const isImage = (a: {
    mimeType?: string;
    url?: string;
    thumbnailUrl?: string;
  }) => {
    if (a?.mimeType) return a.mimeType.startsWith("image/");
    const src = a.url || a.thumbnailUrl || "";
    return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)$/i.test(src);
  };

  const mergedAssets = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof assets = [];
    for (const a of storeAssets) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        out.push({ id: a.id, name: a.name, url: a.url, thumbnailUrl: a.thumbnailUrl, mimeType: a.mimeType });
      }
    }
    for (const a of assets) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        out.push(a);
      }
    }
    return out;
  }, [storeAssets, assets]);

  const previewAsset = useMemo(
    () => mergedAssets.find((a) => a.id === previewId),
    [mergedAssets, previewId],
  );

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mergedAssets;
    const isExtQuery = q.startsWith(".") || q.startsWith("ext:");
    const wanted = q.startsWith("ext:") ? q.slice(4) : q.startsWith(".") ? q.slice(1) : q;
    const getExt = (a: { name: string; url?: string; thumbnailUrl?: string }) => {
      const src = a.url || a.thumbnailUrl || a.name;
      const m = /\.([a-z0-9]+)(?:$|\?)/i.exec(src);
      return (m?.[1] || "").toLowerCase();
    };
    return mergedAssets.filter((a) => {
      const nameHit = a.name.toLowerCase().includes(q);
      if (!isExtQuery) return nameHit;
      return getExt(a) === wanted;
    });
  }, [mergedAssets, query]);

  return (
    <SidebarGroup>
      <button
        className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
        type="button"
        onClick={() => setCollapsedAssets((v) => !v)}
      >
        <SidebarGroupLabel>Assets</SidebarGroupLabel>
        <ChevronRight
          className={`size-3 transition-transform ${collapsedAssets ? "rotate-0" : "rotate-90"}`}
        />
      </button>
      <div ref={assetsRef} />
      {!collapsedAssets && (
        <div className="px-2 pb-2">
          <div className="mb-2 flex items-center gap-2">
            <Button
              onClick={() => {
                if (onAdd) return onAdd();
                fileInputRef.current?.click();
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-1 size-3" />
              Add New
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = e.currentTarget.files;
                if (files && files.length) {
                  await uploadFiles(files);
                  // reset so selecting the same file again triggers change
                  e.currentTarget.value = "";
                }
              }}
            />
            <input
              aria-label="Search assets by name or extension"
              className="w-full rounded-md border bg-background px-2 py-1 text-xs outline-none ring-0 focus:border-primary"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets (e.g., hero, .png, ext:pdf)"
              type="text"
              value={query}
            />
          </div>

          {uploads.length > 0 && (
            <div className="mb-2 space-y-1 px-1">
              {uploads.map((u) => (
                <div key={u.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="min-w-0 flex-1 truncate">{u.name}</div>
                  <div className="w-24">
                    <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                      <div
                        className={`h-full ${u.status === "error" ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.round((u.progress ?? 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-14 text-right">
                    {u.status === "uploading" && "Uploading"}
                    {u.status === "pending" && "Queued"}
                    {u.status === "error" && "Error"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredAssets.length === 0 ? (
            <div className="px-1 py-2 text-xs text-muted-foreground">No assets found</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredAssets.map((asset) => {
                const img = isImage(asset);
                const src = asset.thumbnailUrl || asset.url;
                return (
                  <div
                    key={asset.id}
                    className="group relative rounded-md border border-border bg-background overflow-hidden"
                    title={asset.name}
                  >
                    {/* Delete button */}
                    <button
                      aria-label="Delete asset"
                      className="absolute right-1 top-1 z-10 inline-flex items-center justify-center rounded bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDelete) onDelete(asset.id);
                        else console.warn("onDelete not provided for AssetsSection");
                      }}
                    >
                      <X className="size-4" />
                    </button>

                    {/* Content */}
                    {img && src ? (
                      <button
                        className="block w-full aspect-square"
                        aria-label="Open preview"
                        title="Preview"
                        onClick={() => setPreviewId(asset.id)}
                      >
                        <img
                          alt={asset.name}
                          src={src}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center bg-muted/40">
                        <FileIcon className="size-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-1 px-2 py-1 text-xs">
                      <span className="inline-flex items-center gap-1 truncate">
                        {img ? <ImageIcon className="size-3" /> : <FileIcon className="size-3" />}
                        <span className="truncate" title={asset.name}>{asset.name}</span>
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1">
                        {onAttach ? (
                          <button
                            aria-label="Attach to message"
                            className="rounded p-1 hover:bg-muted"
                            onClick={() => onAttach(asset)}
                            title="Attach"
                          >
                            <Plus className="size-3" />
                            <span className="sr-only">Attach</span>
                          </button>
                        ) : null}
                        {img && src ? (
                          <button
                            aria-label="Open preview"
                            className="rounded p-1 hover:bg-muted"
                            onClick={() => setPreviewId(asset.id)}
                          >
                            <Eye className="size-3" />
                            <span className="sr-only">Preview</span>
                          </button>
                        ) : null}
                        {asset.url ? (
                          <a
                            aria-label="Download file"
                            className="rounded p-1 hover:bg-muted"
                            download
                            href={asset.url}
                            title="Download"
                          >
                            <DownloadIcon className="size-3" />
                            <span className="sr-only">Download</span>
                          </a>
                        ) : null}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="max-w-3xl">
          {previewAsset && (
            <>
              <DialogHeader>
                <DialogTitle>{previewAsset.name}</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] w-full overflow-auto">
                <img
                  alt={previewAsset.name}
                  src={previewAsset.url || previewAsset.thumbnailUrl}
                  className="mx-auto h-auto max-h-[70vh] w-auto max-w-full"
                />
              </div>
              {previewAsset.url && (
                <div className="flex justify-end">
                  <Button asChild title="Download" variant="outline">
                    <a aria-label="Download file" download href={previewAsset.url}>
                      <DownloadIcon className="size-4" />
                      <span className="sr-only">Download</span>
                    </a>
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}

