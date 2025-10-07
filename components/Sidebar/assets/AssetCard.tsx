"use client";

import React from "react";
import { Eye, FileIcon, ImageIcon, Plus, X } from "lucide-react";

export type Asset = {
	id: string;
	name: string;
	thumbnailUrl?: string;
	url?: string;
	mimeType?: string;
};

export function isImageAsset(a: Partial<Asset>): boolean {
	if (a?.mimeType) return a.mimeType.startsWith("image/");
	const src = a?.url || a?.thumbnailUrl || "";
	return /(\.png|\.jpg|\.jpeg|\.gif|\.webp|\.bmp|\.svg)$/i.test(src);
}

export default function AssetCard(props: {
	asset: Asset;
	onDelete?: (id: string) => void;
	onAttach?: (asset: Asset) => void;
	onPreview?: (id: string) => void;
}) {
	const { asset, onAttach, onDelete, onPreview } = props;
	const img = isImageAsset(asset);
	const src = asset.thumbnailUrl || asset.url;

	return (
		<div
			className="group relative h-full rounded-md border border-border bg-background overflow-hidden flex flex-col"
			title={asset.name}
			draggable
			onDragStart={(e) => {
				try {
					const payload = JSON.stringify({
						id: asset.id,
						name: asset.name,
						url: asset.url,
						thumbnailUrl: asset.thumbnailUrl,
						mimeType: asset.mimeType,
					});
					e.dataTransfer.setData("application/x-asset", payload);
					e.dataTransfer.setData("text/plain", asset.url || asset.name);
				} catch {}
			}}
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
				type="button"
			>
				<X className="size-4" />
			</button>

			{/* Content */}
			{img && src ? (
				<div className="flex-1">
					<button
						className="block w-full h-full"
						aria-label="Open preview"
						title="Preview"
						onClick={() => onPreview?.(asset.id)}
						type="button"
					>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							alt={asset.name}
							src={src}
							className="h-full w-full object-cover"
						/>
					</button>
				</div>
			) : (
				<div className="flex-1">
					<div className="flex w-full h-full items-center justify-center bg-muted/40">
						<FileIcon className="size-6 text-muted-foreground" />
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="flex items-center gap-1 px-2 py-1 text-xs">
				<span className="inline-flex items-center gap-1 truncate">
					{img ? (
						<ImageIcon className="size-3" />
					) : (
						<FileIcon className="size-3" />
					)}
					<span className="truncate" title={asset.name}>
						{asset.name}
					</span>
				</span>
				<span className="ml-auto inline-flex items-center gap-1">
					{onAttach ? (
						<button
							aria-label="Attach to message"
							className="rounded p-1 hover:bg-muted"
							onClick={() => onAttach(asset)}
							title="Attach"
							type="button"
						>
							<Plus className="size-3" />
							<span className="sr-only">Attach</span>
						</button>
					) : null}
					{img && src ? (
						<button
							aria-label="Open preview"
							className="rounded p-1 hover:bg-muted"
							onClick={() => onPreview?.(asset.id)}
							type="button"
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
							{/* Use the DownloadIcon from parent via CSS? Keep minimal, let parent not pass here. */}
							{/* Fallback to text if icon missing */}
							<span className="sr-only">Download</span>
						</a>
					) : null}
				</span>
			</div>
		</div>
	);
}
