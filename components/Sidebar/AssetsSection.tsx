"use client";

import { ChevronRight, Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAssetsStore } from "@/lib/stores/assets";
import { useToast } from "@/components/ui/toaster";
import AssetCard, { type Asset } from "@/components/Sidebar/assets/AssetCard";
import UploadsList from "@/components/Sidebar/assets/UploadsList";
import PreviewDialog from "@/components/Sidebar/assets/PreviewDialog";
import type { GridFetcher, GridResponse } from "@/types/component-grid";
import ComponentGrid from "@/components/ui/grid/components/ComponentGrid";
import type { GridItemRendererProps } from "@/components/ui/grid/types";

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

	// Derive categories from primary mime type (e.g., image, video, application) or file extension
	const categories = useMemo(() => {
		const set = new Set<string>();
		const getExt = (a: {
			name: string;
			url?: string;
			thumbnailUrl?: string;
		}) => {
			const src = a.url || a.thumbnailUrl || a.name;
			const m = /(\.([a-z0-9]+)(?:$|\?))/i.exec(src);
			return (m?.[2] || "").toLowerCase();
		};
		for (const a of mergedAssets) {
			if (a.mimeType && a.mimeType.includes("/")) {
				set.add(a.mimeType.split("/")[0]);
			} else {
				const ext = getExt(a);
				if (ext) set.add(ext);
			}
		}
		return Array.from(set);
	}, [mergedAssets]);

	// Local fetcher with search across name, mimeType, and extension; category filter matches primary mime or extension
	const fetchAssets: GridFetcher<Asset> = async ({
		page,
		pageSize,
		search,
		categories: cats,
	}) => {
		const q = (search || "").trim().toLowerCase();
		const getExt = (a: {
			name: string;
			url?: string;
			thumbnailUrl?: string;
		}) => {
			const src = a.url || a.thumbnailUrl || a.name;
			const m = /(\.([a-z0-9]+)(?:$|\?))/i.exec(src);
			return (m?.[2] || "").toLowerCase();
		};
		const primaryType = (a: { mimeType?: string }) =>
			a.mimeType && a.mimeType.includes("/") ? a.mimeType.split("/")[0] : "";

		const filtered = mergedAssets.filter((a) => {
			const nameHit = !q || a.name.toLowerCase().includes(q);
			const mimeHit = !q || (a.mimeType || "").toLowerCase().includes(q);
			const extHit =
				!q || getExt(a).includes(q.replace(/^ext:/, "").replace(/^\./, ""));
			const matchesSearch = nameHit || mimeHit || extHit;
			const cat = primaryType(a) || getExt(a);
			const matchesCats =
				!cats || cats.length === 0 || (cat && cats.includes(cat));
			return matchesSearch && matchesCats;
		});

		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		const items = filtered.slice(start, end);
		const resp: GridResponse<(typeof items)[number]> = {
			items,
			total: filtered.length,
			page,
			pageSize,
		};
		return new Promise((resolve) => setTimeout(() => resolve(resp), 50));
	};

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

	// Prevent hydration mismatches by deferring render until after mount.
	// This component depends on client-only stores/state that may differ from SSR.
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	if (!mounted) return null;

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
					</div>

					{uploads.length > 0 && <UploadsList uploads={uploads as any} />}

					<ComponentGrid<Asset>
						fetcher={fetchAssets}
						ItemComponent={({ item }: GridItemRendererProps<Asset>) => (
							<AssetCard
								asset={item}
								onDelete={onDelete}
								onAttach={onAttach}
								onPreview={(id) => setPreviewId(id)}
							/>
						)}
						categories={categories}
						pageSize={12}
						mode="infinite"
						columns={2}
						queryKeyBase={["sidebar", "assets"]}
						className="[&_[role=grid]]:grid-cols-2 sm:[&_[role=grid]]:grid-cols-3"
					/>
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
