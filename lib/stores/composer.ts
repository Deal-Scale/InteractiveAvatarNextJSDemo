import { create } from "zustand";

export type ComposerAsset = {
	id: string;
	name: string;
	url?: string;
	thumbnailUrl?: string;
	mimeType?: string;
	kind?: "asset" | "tool" | "knowledge" | "agent";
	description?: string;
	conversationStarters?: string[];
	chainOrder?: number;
};

export type ComposerState = {
	assetAttachments: ComposerAsset[];
	pendingResourceMatches: ComposerAsset[];
	addAssetAttachment: (a: ComposerAsset) => void;
	removeAssetAttachment: (id: string) => void;
	clearAssetAttachments: () => void;
	setPendingResourceMatches: (items: ComposerAsset[]) => void;
	removePendingResourceMatch: (id: string) => void;
	clearPendingResourceMatches: () => void;
};

export const useComposerStore = create<ComposerState>((set) => ({
	assetAttachments: [],
	pendingResourceMatches: [],
	addAssetAttachment: (a) =>
		set((s) => {
			const existingIndex = s.assetAttachments.findIndex((x) => x.id === a.id);
			if (existingIndex >= 0) {
				const next = [...s.assetAttachments];
				next[existingIndex] = { ...next[existingIndex], ...a };
				console.debug("[composer] update", { id: a.id, updated: a });
				return { assetAttachments: next };
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
	setPendingResourceMatches: (items) =>
		set(() => ({
			pendingResourceMatches: items,
		})),
	removePendingResourceMatch: (id) =>
		set((s) => ({
			pendingResourceMatches: s.pendingResourceMatches.filter(
				(item) => item.id !== id,
			),
		})),
	clearPendingResourceMatches: () =>
		set(() => ({
			pendingResourceMatches: [],
		})),
}));
