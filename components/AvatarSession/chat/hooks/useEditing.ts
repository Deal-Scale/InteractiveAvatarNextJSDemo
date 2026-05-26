import { RefObject, useState } from "react";
import { useToast } from "@/components/ui/toaster";

export function useEditing(opts: {
	chatInput: string;
	onChatInputChange: (v: string) => void;
	sendWithAttachments: (text: string) => void;
	inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
	const { chatInput, onChatInputChange, sendWithAttachments, inputRef } = opts;
	const { publish } = useToast();

	const [isEditing, setIsEditing] = useState(false);
	const [inputBackup, setInputBackup] = useState<string>("");

	const handleEditToInput = (content: string, _messageId?: string) => {
		if (!isEditing) setInputBackup(chatInput);
		setIsEditing(true);
		onChatInputChange(content);

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
		onChatInputChange(inputBackup);
	};

	const confirmEdit = () => {
		const text = chatInput ?? "";
		console.debug("[Chat] confirmEdit", { textLength: text.length });
		sendWithAttachments(text);
		setIsEditing(false);
		onChatInputChange("");
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
