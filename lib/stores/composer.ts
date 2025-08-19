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
			if (s.assetAttachments.some((x) => x.id === a.id)) {
				console.debug("[composer] duplicate asset ignored", a);
				return s;
			}
			const next = [...s.assetAttachments, a];
			console.debug("[composer] add", { count: next.length, added: a });
			return { assetAttachments: next };
		}),
	removeAssetAttachment: (id) =>
		set((s) => {
			const next = s.assetAttachments.filter((x) => x.id !== id);
			console.debug("[composer] remove", { id, count: next.length });
			return { assetAttachments: next };
		}),
	clearAssetAttachments: () =>
		set((s) => {
			if (s.assetAttachments.length) {
				console.debug("[composer] clear", {
					removed: s.assetAttachments.length,
				});
			}
			return { assetAttachments: [] };
		}),
}));
