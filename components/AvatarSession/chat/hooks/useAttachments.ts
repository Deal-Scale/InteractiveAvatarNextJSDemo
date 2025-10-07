import { useState } from "react";
import { formatAttachmentSummary } from "@/components/AvatarSession/utils";
import { buildAssetsFromComposer } from "../utils";
import type { MessageAsset } from "@/lib/types";
import type { ComposerAsset } from "@/lib/stores/composer";

export function useAttachments(opts: {
	composerAttachments: ComposerAsset[];
	clearComposerAttachments: () => void;
	onSendMessage: (text: string, assets?: MessageAsset[]) => void;
	onChatInputChange: (value: string) => void;
}) {
	const {
		composerAttachments,
		clearComposerAttachments,
		onSendMessage,
		onChatInputChange,
	} = opts;

	const [attachments, setAttachments] = useState<File[]>([]);

	const onFilesAdded = (files: File[]) => {
		if (files?.length) {
			console.debug("[Chat] onFilesAdded", {
				count: files.length,
				names: files.map((f) => f.name),
			});
			setAttachments((prev) => [...prev, ...files]);
		}
	};

	const removeAttachment = (idx: number) =>
		setAttachments((prev) => prev.filter((_, i) => i !== idx));

	const sendWithAttachments = (text: string) => {
		console.debug("[Chat] sendWithAttachments invoked", {
			textLength: (text ?? "").length,
			hasFiles: attachments.length > 0,
			fileCount: attachments.length,
			composerCount: composerAttachments.length,
		});

		const trimmed = (text ?? "").trim();
		if (
			!trimmed &&
			attachments.length === 0 &&
			composerAttachments.length === 0
		)
			return;

		const parts: string[] = [];
		if (attachments.length) parts.push(formatAttachmentSummary(attachments));
		const suffix = parts.length ? `\n\n[Attachments: ${parts.join(", ")}]` : "";

		const assets = buildAssetsFromComposer(composerAttachments);
		console.debug("[Chat] built outgoing payload", {
			text: `${trimmed}${suffix}`,
			assets,
		});

		onSendMessage(`${trimmed}${suffix}`, assets);
		console.debug("[Chat] onSendMessage called; clearing attachments");
		setAttachments([]);
		clearComposerAttachments();
		onChatInputChange("");
	};

	return {
		attachments,
		onFilesAdded,
		removeAttachment,
		sendWithAttachments,
	} as const;
}
