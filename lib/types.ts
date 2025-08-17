export enum MessageSender {
  CLIENT = "client",
  AVATAR = "avatar",
}

export interface MessageSource {
  href: string;
  title: string;
  description: string;
  // Optional UI overrides
  label?: string | number;
  showFavicon?: boolean;
}

export interface MessageAsset {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  mimeType?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  // Optional JSX payload for rich rendering. When present, render with JSXPreview.
  jsx?: string;
  // Optional tool call parts to visualize tool usage within the message
  toolParts?: MessageToolPart[];
  // Optional list of sources used to produce this message
  sources?: MessageSource[];
  // Optional structured assets associated with this message
  assets?: MessageAsset[];
}

// UI-agnostic version of ToolPart from components/ui/tool.tsx
export interface MessageToolPart {
  type: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  toolCallId?: string;
  errorText?: string;
}
