import {
  MicIcon,
  MicOffIcon,
  SendIcon,
  Paperclip,
  X,
  Check,
  XCircle,
} from "lucide-react";
import React from "react";

import { PromptSuggestions } from "./PromptSuggestions";

import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Loader } from "@/components/ui/loader";
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
  promptSuggestions: string[];
  onChatInputChange: (value: string) => void;
  onStartVoiceChat: () => void;
  onStopVoiceChat: () => void;
  sendWithAttachments: (text: string) => void;
  confirmEdit: () => void;
  cancelEdit: () => void;
  removeAttachment: (idx: number) => void;
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
  promptSuggestions,
  onChatInputChange,
  onStartVoiceChat,
  onStopVoiceChat,
  sendWithAttachments,
  confirmEdit,
  cancelEdit,
  removeAttachment,
  onFilesAdded,
  inputRef,
}) => {
  return (
    <PromptInput
      className="w-full mt-4"
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
                  accept="*"
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
      {attachments.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
          {attachments.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="bg-secondary text-secondary-foreground border border-border px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
            >
              <span className="max-w-[180px] truncate">{file.name}</span>
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
      <div className="mt-4">
        <PromptSuggestions
          chatInput={chatInput}
          isVoiceChatActive={isVoiceChatActive}
          promptSuggestions={promptSuggestions}
          onChatInputChange={onChatInputChange}
        />
      </div>
    </PromptInput>
  );
};
