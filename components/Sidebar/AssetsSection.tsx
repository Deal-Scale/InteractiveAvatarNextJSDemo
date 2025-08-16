"use client";

import { ChevronRight } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton } from "@/components/ui/sidebar";
import React from "react";

export default function AssetsSection(props: {
  assets: { id: string; name: string; thumbnailUrl?: string }[];
  collapsedAssets: boolean;
  setCollapsedAssets: (fn: (v: boolean) => boolean) => void;
  assetsRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  const { assets, collapsedAssets, setCollapsedAssets, assetsRef } = props;

  return (
    <SidebarGroup>
      <button
        type="button"
        className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
        onClick={() => setCollapsedAssets((v) => !v)}
      >
        <SidebarGroupLabel>Assets</SidebarGroupLabel>
        <ChevronRight className={`size-3 transition-transform ${collapsedAssets ? "rotate-0" : "rotate-90"}`} />
      </button>
      <div ref={assetsRef} />
      {!collapsedAssets && (
        <SidebarMenu>
          {assets.map((asset) => (
            <SidebarMenuButton key={asset.id} className="justify-start">
              {asset.thumbnailUrl ? (
                <img src={asset.thumbnailUrl} alt={asset.name} className="mr-2 size-4 rounded object-cover" />
              ) : null}
              <span className="truncate pr-2">{asset.name}</span>
            </SidebarMenuButton>
          ))}
          {assets.length === 0 && <div className="px-3 py-2 text-xs text-zinc-500">No assets found</div>}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
