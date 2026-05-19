"use client";

import {
	ChevronLeft,
	ChevronRight,
	LayoutGrid,
	List,
	Plus,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

import AssetCard, { type Asset } from "@/components/Sidebar/assets/AssetCard";
import PreviewDialog from "@/components/Sidebar/assets/PreviewDialog";
import UploadsList from "@/components/Sidebar/assets/UploadsList";
import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/toaster";
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
	const [search, setSearch] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [layout, setLayout] = useState<"comfortable" | "dense">("dense");
	const [page, setPage] = useState(1);

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

	const getAssetExt = (a: {
		name: string;
		url?: string;
		thumbnailUrl?: string;
	}) => {
		const src = a.url || a.thumbnailUrl || a.name;
		const m = /(\.([a-z0-9]+)(?:$|\?))/i.exec(src);
		return (m?.[2] || "").toLowerCase();
	};

	const getPrimaryType = (a: { mimeType?: string }) =>
		a.mimeType && a.mimeType.includes("/") ? a.mimeType.split("/")[0] : "";

	const filteredAssets = useMemo(() => {
		const q = search.trim().toLowerCase();
		return mergedAssets.filter((a) => {
			const nameHit = !q || a.name.toLowerCase().includes(q);
			const mimeHit = !q || (a.mimeType || "").toLowerCase().includes(q);
			const extHit =
				!q ||
				getAssetExt(a).includes(q.replace(/^ext:/, "").replace(/^\./, ""));
			const matchesSearch = nameHit || mimeHit || extHit;
			const cat = getPrimaryType(a) || getAssetExt(a);
			const matchesCategory =
				selectedCategory === "all" || cat === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [mergedAssets, search, selectedCategory]);

	const pageSize = layout === "dense" ? 8 : 4;
	const pageCount = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
	const safePage = Math.min(page, pageCount);
	const pagedAssets = useMemo(() => {
		const start = (safePage - 1) * pageSize;
		return filteredAssets.slice(start, start + pageSize);
	}, [filteredAssets, pageSize, safePage]);

	const resetPage = () => setPage(1);

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
				<SidebarGroupLabel className="border-cyan-400/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
					Assets
				</SidebarGroupLabel>
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
						<div className="ml-auto flex rounded-md border border-border bg-background p-0.5">
							<button
								type="button"
								aria-label="Comfortable asset layout"
								className={`rounded px-1.5 py-1 text-xs ${layout === "comfortable" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
								onClick={() => {
									setLayout("comfortable");
									resetPage();
								}}
							>
								<List className="size-3.5" />
							</button>
							<button
								type="button"
								aria-label="Dense asset layout"
								className={`rounded px-1.5 py-1 text-xs ${layout === "dense" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
								onClick={() => {
									setLayout("dense");
									resetPage();
								}}
							>
								<LayoutGrid className="size-3.5" />
							</button>
						</div>
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

					<div className="mb-2 space-y-2">
						<input
							aria-label="Search assets"
							className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							placeholder="Search assets..."
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
								resetPage();
							}}
						/>
						{categories.length > 0 ? (
							<select
								aria-label="Filter assets by type"
								className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
								value={selectedCategory}
								onChange={(event) => {
									setSelectedCategory(event.target.value);
									resetPage();
								}}
							>
								<option value="all">All types</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						) : null}
					</div>

					{pagedAssets.length > 0 ? (
						<div
							className={
								layout === "dense"
									? "grid grid-cols-2 gap-2"
									: "grid grid-cols-1 gap-2"
							}
						>
							{pagedAssets.map((asset) => (
								<div
									key={asset.id}
									className={
										layout === "dense" ? "h-36 min-w-0" : "h-48 min-w-0"
									}
								>
									<AssetCard
										asset={asset}
										onDelete={onDelete}
										onAttach={onAttach}
										onPreview={(id) => setPreviewId(id)}
									/>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-md border border-dashed border-border px-2 py-4 text-center text-xs text-muted-foreground">
							No assets found
						</div>
					)}

					<div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
						<button
							type="button"
							className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							disabled={safePage <= 1}
							onClick={() => setPage((value) => Math.max(1, value - 1))}
						>
							<ChevronLeft className="size-3" />
							Prev
						</button>
						<span>
							Page {safePage} / {pageCount}
						</span>
						<button
							type="button"
							className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							disabled={safePage >= pageCount}
							onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
						>
							Next
							<ChevronRight className="size-3" />
						</button>
					</div>
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
