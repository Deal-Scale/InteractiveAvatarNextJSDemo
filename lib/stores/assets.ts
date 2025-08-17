import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AssetItem = {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
};

export type UploadProgress = {
  id: string; // temp id while uploading
  name: string;
  progress: number; // 0-1
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

export type AssetsState = {
  assets: AssetItem[];
  uploads: UploadProgress[];

  addAssets: (items: AssetItem[]) => void;
  removeAsset: (id: string) => void;
  clear: () => void;

  uploadFiles: (files: File[] | FileList) => Promise<AssetItem[]>;
};

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set, _get) => ({
      assets: [],
      uploads: [],

      addAssets: (items) => set((s) => ({ assets: [...items, ...s.assets] })),
      removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
      clear: () => set({ assets: [], uploads: [] }),

      uploadFiles: async (input) => {
        const files = Array.from(input as File[]);
        if (!files.length) return [];

        const temp: UploadProgress[] = files.map((f, i) => ({
          id: `temp-${Date.now()}-${i}`,
          name: f.name,
          progress: 0,
          status: "pending",
        }));

        set((s) => ({ uploads: [...temp, ...s.uploads] }));

        try {
          const fd = new FormData();
          for (const f of files) fd.append("files", f);

          // Browser fetch doesn't expose progress for multipart easily; set to uploading and then done.
          set((s) => ({
            uploads: s.uploads.map((u) =>
              temp.find((t) => t.id === u.id)
                ? { ...u, status: "uploading", progress: 0.5 }
                : u,
            ),
          }));

          const res = await fetch("/api/assets/upload", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) throw new Error(`Upload failed (${res.status})`);
          const data = (await res.json()) as { assets: AssetItem[] };

          set((s) => ({
            uploads: s.uploads.filter((u) => !temp.find((t) => t.id === u.id)),
            assets: [...data.assets, ...s.assets],
          }));

          return data.assets;
        } catch (e: any) {
          const msg = e?.message || "Upload failed";
          set((s) => ({
            uploads: s.uploads.map((u) =>
              temp.find((t) => t.id === u.id)
                ? { ...u, status: "error", progress: 1, error: msg }
                : u,
            ),
          }));
          return [];
        }
      },
    }),
    {
      name: "sidebar.assets.store.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ assets: s.assets }),
    },
  ),
);
