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

	const handleEditToInput = (content: string) => {
		if (!isEditing) setInputBackup(chatInput);
		setIsEditing(true);
		onChatInputChange(content);
		requestAnimationFrame(() => {
			const el = inputRef.current;
			if (el) {
				el.focus();
				const len = el.value.length;
				el.setSelectionRange(len, len);
			}
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
