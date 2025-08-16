import { ReactNode } from "react";

export type Conversation = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
};

export type ConversationGroup = {
  period: string;
  conversations: Conversation[];
};

export interface AppOption {
  id: string;
  label: string;
  icon?: ReactNode;
  imageUrl?: string;
}

export interface SidebarProps {
  onSelect?: (c: Conversation) => void;
  apps?: AppOption[];
}
