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
import React, { useMemo, useState } from "react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
}) {
  const { assets, collapsedAssets, setCollapsedAssets, assetsRef, onDelete, onAdd } = props;

  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewAsset = useMemo(() => assets.find((a) => a.id === previewId), [assets, previewId]);

  const isImage = (a: {
    mimeType?: string;
    url?: string;
    thumbnailUrl?: string;
  }) => {
    if (a?.mimeType) return a.mimeType.startsWith("image/");
    const src = a.url || a.thumbnailUrl || "";
    return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)$/i.test(src);
  };

  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    const isExtQuery = q.startsWith(".") || q.startsWith("ext:");
    const wanted = q.startsWith("ext:") ? q.slice(4) : q.startsWith(".") ? q.slice(1) : q;
    const getExt = (a: { name: string; url?: string; thumbnailUrl?: string }) => {
      const src = a.url || a.thumbnailUrl || a.name;
      const m = /\.([a-z0-9]+)(?:$|\?)/i.exec(src);
      return (m?.[1] || "").toLowerCase();
    };
    return assets.filter((a) => {
      const nameHit = a.name.toLowerCase().includes(q);
      if (!isExtQuery) return nameHit;
      return getExt(a) === wanted;
    });
  }, [assets, query]);

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
            <Button onClick={() => onAdd?.()} size="sm" variant="outline">
              <Plus className="mr-1 size-3" />
              Add New
            </Button>
            <input
              aria-label="Search assets by name or extension"
              className="w-full rounded-md border bg-background px-2 py-1 text-xs outline-none ring-0 focus:border-primary"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assets (e.g., hero, .png, ext:pdf)"
              type="text"
              value={query}
            />
          </div>
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

