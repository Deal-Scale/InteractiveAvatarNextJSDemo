import { RefObject, useState } from "react";
import { useToast } from "@/components/ui/toaster";
import type { ChatInputHandle } from "../../ChatInput";

export function useEditing(opts: {
	sendWithAttachments: (text: string) => void;
	inputRef: RefObject<HTMLTextAreaElement | null>;
	composerRef: RefObject<ChatInputHandle | null>;
}) {
	const { sendWithAttachments, inputRef, composerRef } = opts;
	const { publish } = useToast();

	const [isEditing, setIsEditing] = useState(false);
	const [inputBackup, setInputBackup] = useState<string>("");

	const handleEditToInput = (content: string, _messageId?: string) => {
		const currentDraft = composerRef.current?.getDraft() ?? "";
		if (!isEditing) setInputBackup(currentDraft);
		setIsEditing(true);
		composerRef.current?.setDraft(content);

		const focusTextarea = () => {
			const el = inputRef.current;
			if (el) {
				if (el.value !== content) {
					el.value = content;
				}
				el.focus();
				const len = el.value.length;
				el.setSelectionRange(len, len);
			}
		};

		requestAnimationFrame(focusTextarea);
		setTimeout(focusTextarea, 0);
		publish({
			description: "The message is loaded into the chat input.",
			title: "Editing message",
		});
	};

	const cancelEdit = () => {
		setIsEditing(false);
		composerRef.current?.setDraft(inputBackup);
	};

	const confirmEdit = () => {
		const text = composerRef.current?.getDraft() ?? "";
		console.debug("[Chat] confirmEdit", { textLength: text.length });
		sendWithAttachments(text);
		setIsEditing(false);
		composerRef.current?.clearDraft();
		publish({ description: "Edited message sent.", title: "Edited" });
	};

	return {
		isEditing,
		inputBackup,
		handleEditToInput,
		cancelEdit,
		confirmEdit,
	} as const;
}
