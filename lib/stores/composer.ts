import { create } from "zustand";

export type ComposerAsset = {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  mimeType?: string;
};

export type ComposerState = {
  assetAttachments: ComposerAsset[];
  addAssetAttachment: (a: ComposerAsset) => void;
  removeAssetAttachment: (id: string) => void;
  clearAssetAttachments: () => void;
};

export const useComposerStore = create<ComposerState>((set) => ({
  assetAttachments: [],
  addAssetAttachment: (a) =>
    set((s) => {
      // de-duplicate by id
      if (s.assetAttachments.some((x) => x.id === a.id)) return s;
      return { assetAttachments: [...s.assetAttachments, a] };
    }),
  removeAssetAttachment: (id) =>
    set((s) => ({ assetAttachments: s.assetAttachments.filter((x) => x.id !== id) })),
  clearAssetAttachments: () => set({ assetAttachments: [] }),
}));
