"use client";

import { ChevronRight, Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAssetsStore } from "@/lib/stores/assets";
import { useToast } from "@/components/ui/toaster";
import AssetCard from "@/components/Sidebar/assets/AssetCard";
import UploadsList from "@/components/Sidebar/assets/UploadsList";
import PreviewDialog from "@/components/Sidebar/assets/PreviewDialog";

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
	const {
		assets,
		collapsedAssets,
		setCollapsedAssets,
		assetsRef,
		onDelete,
		onAdd,
		onAttach,
	} = props;

	const storeAssets = useAssetsStore((s) => s.assets);
	const uploads = useAssetsStore((s) => s.uploads);
	const uploadFiles = useAssetsStore((s) => s.uploadFiles);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const { publish } = useToast();
	const notifiedErrors = useRef<Set<string>>(new Set());

	const [query, setQuery] = useState("");
	const [previewId, setPreviewId] = useState<string | null>(null);

	const mergedAssets = useMemo(() => {
		const seen = new Set<string>();
		const out: typeof assets = [];
		for (const a of storeAssets) {
			if (!seen.has(a.id)) {
				seen.add(a.id);
				out.push({
					id: a.id,
					name: a.name,
					url: a.url,
					thumbnailUrl: a.thumbnailUrl,
					mimeType: a.mimeType,
				});
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
		const wanted = q.startsWith("ext:")
			? q.slice(4)
			: q.startsWith(".")
				? q.slice(1)
				: q;
		const getExt = (a: {
			name: string;
			url?: string;
			thumbnailUrl?: string;
		}) => {
			const src = a.url || a.thumbnailUrl || a.name;
			const m = /(\.([a-z0-9]+)(?:$|\?))/i.exec(src);
			return (m?.[2] || "").toLowerCase();
		};
		return mergedAssets.filter((a) => {
			const nameHit = a.name.toLowerCase().includes(q);
			if (!isExtQuery) return nameHit;
			return getExt(a) === wanted;
		});
	}, [mergedAssets, query]);

	// Surface upload errors as toasts (deduplicated per temp upload id)
	useEffect(() => {
		for (const u of uploads) {
			if (
				u.status === "error" &&
				u.error &&
				!notifiedErrors.current.has(u.id)
			) {
				publish({
					title: "Upload failed",
					description: u.error,
					duration: 5000,
				});
				notifiedErrors.current.add(u.id);
			}
		}
	}, [uploads, publish]);

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
							accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md"
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

					{uploads.length > 0 && <UploadsList uploads={uploads as any} />}
					{filteredAssets.length === 0 ? (
						<div className="px-1 py-2 text-xs text-muted-foreground">
							No assets found
						</div>
					) : (
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
							{filteredAssets.map((asset) => {
								return (
									<AssetCard
										key={asset.id}
										asset={asset}
										onDelete={onDelete}
										onAttach={onAttach as any}
										onPreview={(id) => setPreviewId(id)}
									/>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Preview Modal */}
			<PreviewDialog
				asset={previewAsset}
				open={!!previewId}
				onOpenChange={(o) => !o && setPreviewId(null)}
			/>
		</SidebarGroup>
	);
}
