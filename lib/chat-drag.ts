import type { ComposerAsset } from "@/lib/stores/composer";

export const CHAT_RESOURCE_MIME = "application/x-chat-resource";
export const ASSET_RESOURCE_MIME = "application/x-asset";

export type ChatResourceKind = "asset" | "tool" | "knowledge" | "agent";

export type ChatDragResource = ComposerAsset & {
	kind: ChatResourceKind;
	description?: string;
};

export function toComposerAsset(resource: ChatDragResource): ComposerAsset {
	return {
		id: resource.id,
		name: resource.name,
		url: resource.url,
		thumbnailUrl: resource.thumbnailUrl,
		mimeType: resource.mimeType,
		kind: resource.kind,
		description: resource.description,
	};
}

export function setChatDragData(
	dataTransfer: DataTransfer,
	resource: ChatDragResource,
) {
	const payload = JSON.stringify(resource);
	dataTransfer.effectAllowed = "copy";
	dataTransfer.setData(CHAT_RESOURCE_MIME, payload);
	dataTransfer.setData("text/plain", resource.name);
	if (resource.kind === "asset") {
		dataTransfer.setData(ASSET_RESOURCE_MIME, payload);
	}
}

export function getChatDragResource(dataTransfer: DataTransfer) {
	for (const mimeType of [CHAT_RESOURCE_MIME, ASSET_RESOURCE_MIME]) {
		const raw = dataTransfer.getData(mimeType);
		if (!raw) continue;
		try {
			const parsed = JSON.parse(raw) as Partial<ChatDragResource>;
			if (parsed?.id && parsed.name) {
				return {
					...parsed,
					kind: parsed.kind ?? "asset",
				} as ChatDragResource;
			}
		} catch {}
	}
	return null;
}

export function hasChatDragResource(types: DOMStringList | readonly string[]) {
	const values = Array.from(types);
	return (
		values.includes(CHAT_RESOURCE_MIME) || values.includes(ASSET_RESOURCE_MIME)
	);
}
