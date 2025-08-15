import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import type { Message } from "@/lib/types";

import { create } from "zustand";

export type ChatMode = "voice" | "text";

interface SessionState {
  isConfigModalOpen: boolean;
  openConfigModal: () => void;
  closeConfigModal: () => void;

  config: StartAvatarRequest | null;
  setConfig: (config: StartAvatarRequest) => void;

  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;

  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isConfigModalOpen: true, // Open modal by default
  openConfigModal: () => set({ isConfigModalOpen: true }),
  closeConfigModal: () => set({ isConfigModalOpen: false }),

  config: null,
  setConfig: (config) => set({ config }),

  chatMode: "text",
  setChatMode: (mode) => set({ chatMode: mode }),

  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [] }),
}));
