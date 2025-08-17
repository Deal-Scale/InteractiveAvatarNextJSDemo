// MCP Modal utility: open/close app modals from agents or non-React code.
// Dispatches CustomEvents with an optional window API.

export interface MCPModalOpen {
  id?: string; // optional correlation id
  title?: string;
  content?: string; // simple text content; richer content should be handled app-side
  size?: "sm" | "md" | "lg" | "xl";
  // arbitrary props the app modal system understands
  props?: Record<string, unknown>;
}

const MODAL_OPEN_EVENT = "app:modal:open";
const MODAL_CLOSE_EVENT = "app:modal:close";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function openModal(opts: MCPModalOpen): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(MODAL_OPEN_EVENT, { detail: opts }));
}

export function closeModal(id?: string): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(MODAL_CLOSE_EVENT, { detail: { id } }));
}

// Optional global for direct control
declare global {
  interface Window {
    mcpModal?: {
      open: (opts: MCPModalOpen) => void;
      close: (id?: string) => void;
    };
  }
}

if (hasWindow()) {
  try {
    window.mcpModal = {
      open: openModal,
      close: closeModal,
    };
  } catch {}
}
