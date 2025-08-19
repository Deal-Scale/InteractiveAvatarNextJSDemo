import {
	MicIcon,
	MicOffIcon,
	SendIcon,
	Paperclip,
	X,
	Check,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ComposerAsset } from "@/lib/stores/composer";
import { useComposerStore } from "@/lib/stores/composer";

import { PromptSuggestions } from "./PromptSuggestions";

import { Button } from "@/components/ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import {
	FileUpload,
	FileUploadContent,
	FileUploadTrigger,
} from "@/components/ui/file-upload";

interface ChatInputProps {
	chatInput: string;
	isVoiceChatActive: boolean;
	isSending: boolean;
	isEditing: boolean;
	isVoiceChatLoading: boolean;
	attachments: File[];
	composerAttachments: ComposerAsset[];
	promptSuggestions: string[];
	onChatInputChange: (value: string) => void;
	onStartVoiceChat: () => void;
	onStopVoiceChat: () => void;
	sendWithAttachments: (text: string) => void;
	confirmEdit: () => void;
	cancelEdit: () => void;
	removeAttachment: (idx: number) => void;
	removeComposerAttachment: (id: string) => void;
	onFilesAdded: (files: File[]) => void;
	inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
	chatInput,
	isVoiceChatActive,
	isSending,
	isEditing,
	isVoiceChatLoading,
	attachments,
	composerAttachments,
	promptSuggestions,
	onChatInputChange,
	onStartVoiceChat,
	onStopVoiceChat,
	sendWithAttachments,
	confirmEdit,
	cancelEdit,
	removeAttachment,
	removeComposerAttachment,
	onFilesAdded,
	inputRef,
}) => {
	const addAssetAttachment = useComposerStore((s) => s.addAssetAttachment);
	// Visual affordance for sidebar asset drag-over
	const [assetDragCounter, setAssetDragCounter] = useState(0);
	const isAssetDragging = assetDragCounter > 0;

	const handleDrop = (e: React.DragEvent) => {
		console.debug("[ChatInput] drop", {
			types: Array.from(e.dataTransfer.types || []),
		});
		try {
			const data = e.dataTransfer.getData("application/x-asset");
			if (data) {
				console.debug("[ChatInput] asset payload detected on drop");
				const asset = JSON.parse(data) as ComposerAsset;
				if (asset?.id && asset.name) {
					addAssetAttachment({
						id: asset.id,
						name: asset.name,
						url: asset.url,
						thumbnailUrl: asset.thumbnailUrl,
						mimeType: asset.mimeType,
					});
					console.debug("[ChatInput] asset added to composer", asset);
					// Always swallow the drop so FileUpload doesn't keep its overlay active
					e.preventDefault();
					e.stopPropagation();
					setAssetDragCounter(0);
					return;
				}
			}
		} catch {}
		// If it's not our payload, let it bubble (FileUpload will handle file drops)
	};

	const allowDrop = (e: React.DragEvent) => {
		// If dragging an asset payload, allow drop
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragover asset payload", {
				types: Array.from(e.dataTransfer.types || []),
			});
			e.preventDefault();
			// Stop FileUpload from entering drag state (prevents persistent overlay)
			e.stopPropagation();
			try {
				e.dataTransfer.dropEffect = "copy";
			} catch {}
		}
	};
	const onDragEnter = (e: React.DragEvent) => {
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragenter asset payload");
			e.preventDefault();
			e.stopPropagation();
			setAssetDragCounter((c) => c + 1);
		}
	};
	const onDragLeave = (e: React.DragEvent) => {
		if (e.dataTransfer.types.includes("application/x-asset")) {
			console.debug("[ChatInput] dragleave asset payload");
			e.preventDefault();
			e.stopPropagation();
			setAssetDragCounter((c) => Math.max(0, c - 1));
		}
	};
	return (
		<section
			aria-label="Chat input drop area"
			className="relative"
			onDragEnter={onDragEnter}
			onDragOver={allowDrop}
			onDragLeave={onDragLeave}
			onDrop={handleDrop}
		>
			{isAssetDragging && (
				<div className="pointer-events-none absolute inset-0 z-10 rounded-lg border-2 border-dashed border-primary/70 bg-primary/5" />
			)}
			<PromptInput
				className={cn(
					"w-full mt-4",
					isAssetDragging && "ring-2 ring-primary/50 rounded-lg",
				)}
				disabled={false}
				maxHeight={320}
				value={chatInput}
				textareaRef={inputRef}
				onSubmit={() =>
					isEditing ? confirmEdit() : sendWithAttachments(chatInput)
				}
				onValueChange={onChatInputChange}
			>
				<div className="flex items-end gap-2">
					<PromptInputTextarea
						aria-label="Chat input"
						className="flex-grow"
						placeholder="Type a message..."
					/>
					<PromptInputActions className="shrink-0">
						{!isEditing ? (
							<>
								<PromptInputAction
									tooltip={
										isVoiceChatActive ? "Stop voice chat" : "Start voice chat"
									}
								>
									<div className="flex items-center">
										<Button
											size="icon"
											variant={isVoiceChatActive ? "destructive" : "default"}
											onClick={
												isVoiceChatActive ? onStopVoiceChat : onStartVoiceChat
											}
										>
											{isVoiceChatActive ? (
												<MicOffIcon className="h-4 w-4" />
											) : (
												<MicIcon className="h-4 w-4" />
											)}
										</Button>
										{isVoiceChatLoading && (
											<div className="ml-2">
												<Loader size="sm" variant="dots" />
											</div>
										)}
									</div>
								</PromptInputAction>
								<PromptInputAction tooltip="Attach files">
									<FileUpload
										multiple
										accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md"
										disabled={isVoiceChatActive}
										onFilesAdded={onFilesAdded}
									>
										<FileUploadTrigger asChild>
											<Button
												aria-label="Attach files"
												disabled={isVoiceChatActive}
												size="icon"
												type="button"
											>
												<Paperclip className="h-4 w-4" />
											</Button>
										</FileUploadTrigger>
										<FileUploadContent className="border-border/60 bg-background/80 text-foreground/90">
											<div className="rounded-lg border px-6 py-4 text-center">
												<p className="text-sm">Drop files to attach</p>
											</div>
										</FileUploadContent>
									</FileUpload>
								</PromptInputAction>
								<PromptInputAction tooltip="Send message">
									<Button
										aria-label="Send message"
										disabled={isVoiceChatActive || isSending}
										size="icon"
										type="button"
										onClick={() => sendWithAttachments(chatInput)}
									>
										{isSending ? (
											<Loader size="sm" variant="circular" />
										) : (
											<SendIcon />
										)}
									</Button>
								</PromptInputAction>
							</>
						) : (
							<>
								<PromptInputAction tooltip="Confirm edit and send">
									<Button
										aria-label="Confirm edit and send"
										size="icon"
										type="button"
										onClick={confirmEdit}
									>
										<Check className="h-4 w-4" />
									</Button>
								</PromptInputAction>
								<PromptInputAction tooltip="Cancel editing">
									<Button
										aria-label="Cancel editing"
										size="icon"
										type="button"
										variant="secondary"
										onClick={cancelEdit}
									>
										<XCircle className="h-4 w-4" />
									</Button>
								</PromptInputAction>
							</>
						)}
					</PromptInputActions>
				</div>
				{/* FileUpload handles file selection and drag/drop */}
				{(attachments.length > 0 || composerAttachments.length > 0) && (
					<div className="flex flex-wrap items-center gap-2 px-2 pt-2">
						{composerAttachments.map((a) => (
							<div
								key={`asset-${a.id}`}
								className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
								title={a.url ? `${a.name} – ${a.url}` : a.name}
							>
								<span className="max-w-[200px] truncate">{a.name}</span>
								<button
									aria-label={`Remove ${a.name}`}
									className="hover:text-destructive"
									type="button"
									onClick={() => removeComposerAttachment(a.id)}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
						{attachments.map((file, idx) => (
							<div
								key={`${file.name}-${idx}`}
								className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
							>
								<span className="max-w-[200px] truncate">{file.name}</span>
								<button
									aria-label={`Remove ${file.name}`}
									className="hover:text-destructive"
									type="button"
									onClick={() => removeAttachment(idx)}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
					</div>
				)}
				{promptSuggestions && promptSuggestions.length > 0 ? (
					<div className="mt-4">
						<PromptSuggestions
							chatInput={chatInput}
							isVoiceChatActive={isVoiceChatActive}
							promptSuggestions={promptSuggestions}
							onChatInputChange={onChatInputChange}
						/>
					</div>
				) : null}
			</PromptInput>
		</section>
	);
};
