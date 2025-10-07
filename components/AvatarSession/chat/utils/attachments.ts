import { MessageAsset } from "@/lib/types";
import type { ComposerAsset } from "@/lib/stores/composer";

export function buildAssetsFromComposer(
	composerAttachments: ComposerAsset[],
): MessageAsset[] | undefined {
	if (!composerAttachments?.length) return undefined;
	return composerAttachments.map((a) => ({
		id: a.id,
		name: a.name,
		url: a.url ?? undefined,
		thumbnailUrl: a.thumbnailUrl ?? undefined,
		mimeType: a.mimeType ?? undefined,
	}));
}
