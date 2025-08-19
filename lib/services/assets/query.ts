import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
	useAssetsStore,
	type AssetItem,
	type UploadProgress,
} from "@/lib/stores/assets";

function validateFiles(input: File[] | FileList) {
	const files = Array.from(input as File[]);
	const MAX_FILES = 5;
	const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
	const ALLOWED_MIME = new Set([
		"image/png",
		"image/jpeg",
		"image/jpg",
		"image/webp",
		"image/gif",
		"application/pdf",
		"text/plain",
		"text/markdown",
	]);

	if (!files.length) throw new Error("No files selected");
	if (files.length > MAX_FILES)
		throw new Error(`Too many files. Max ${MAX_FILES} per upload.`);
	for (const f of files) {
		if (typeof f.size === "number" && f.size > MAX_SIZE_BYTES) {
			throw new Error(`File '${f.name}' exceeds 10MB limit.`);
		}
		if (!ALLOWED_MIME.has(f.type)) {
			throw new Error(
				`File '${f.name}' has unsupported type '${f.type || "unknown"}'.`,
			);
		}
	}
	return files;
}

async function postUpload(files: File[]) {
	const fd = new FormData();
	for (const f of files) fd.append("files", f);
	const res = await fetch("/api/assets/upload", { method: "POST", body: fd });
	if (!res.ok) throw new Error(`Upload failed (${res.status})`);
	const data = (await res.json()) as { assets: AssetItem[] };
	return data.assets || [];
}

export function useAssetsUploadMutation() {
	const queryClient = useQueryClient();
	const addAssets = useAssetsStore((s) => s.addAssets);
	const setUploads = useAssetsStore.setState;

	return useMutation({
		mutationKey: queryKeys.assets.upload(),
		mutationFn: async (input: File[] | FileList) => {
			const files = validateFiles(input);
			return postUpload(files);
		},
		onMutate: async (input) => {
			const files = Array.from(input as File[]);
			const temps: UploadProgress[] = files.map((f, i) => ({
				id: `temp-${Date.now()}-${i}`,
				name: f.name,
				progress: 0,
				status: "uploading",
			}));
			setUploads((s) => ({ uploads: [...temps, ...s.uploads] }));
			return { temps };
		},
		onError: (err, _vars, ctx) => {
			const msg = err?.message || "Upload failed";
			if (ctx?.temps?.length) {
				setUploads((s) => ({
					uploads: s.uploads.map((u) =>
						ctx.temps.find((t) => t.id === u.id)
							? { ...u, status: "error", progress: 1, error: msg }
							: u,
					),
				}));
			}
		},
		onSuccess: (assets, _vars, ctx) => {
			// Clear temp uploads entries
			if (ctx?.temps?.length) {
				setUploads((s) => ({
					uploads: s.uploads.filter(
						(u) => !ctx.temps.find((t) => t.id === u.id),
					),
				}));
			}
			if (assets?.length) addAssets(assets);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: queryKeys.assets.list });
		},
	});
}
