// Utility for MCP agents (or any non-React code) to trigger app toasts.
// It communicates with the React toast system via CustomEvents, with a
// direct-window API fallback when available.

export type MCPToastVariant = "default" | "success" | "error" | "warning" | "loading" | "custom";

export interface MCPToastOptions {
  title?: string;
  description?: string;
  variant?: MCPToastVariant;
  // keep toast visible until explicitly dismissed or updated to auto-dismiss
  persist?: boolean;
  // 0..1 shows a determinate progress bar
  progress?: number | null;
  // only used for custom variant
  color?: string;
  emoji?: string;
  // auto-dismiss duration in ms (ignored if persist === true)
  duration?: number;
}

export type MCPToastPatch = Partial<MCPToastOptions>;

const PUBLISH_EVENT = "app:toast:publish";
const UPDATE_EVENT = "app:toast:update";
const DISMISS_EVENT = "app:toast:dismiss";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function publishToast(opts: MCPToastOptions): string | undefined {
  if (!hasWindow()) return undefined;

  // Prefer direct global API if available for immediate id return
  if (window.mcpToast && typeof window.mcpToast.publish === "function") {
    try {
      return window.mcpToast.publish(opts as any);
    } catch {
      // fall through to event-based
    }
  }

  // Event-based call. The React side creates the id; we can't synchronously get it here.
  // For async update flows, prefer the global API. For fire-and-forget, this is fine.
  window.dispatchEvent(new CustomEvent(PUBLISH_EVENT, { detail: opts }));
  return undefined;
}

export function updateToast(id: string, patch: MCPToastPatch): void {
  if (!hasWindow()) return;

  if (window.mcpToast && typeof window.mcpToast.update === "function") {
    try {
      window.mcpToast.update(id, patch as any);
      return;
    } catch {
      // fall through to event-based
    }
  }

  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { id, patch } }));
}

export function dismissToast(id: string): void {
  if (!hasWindow()) return;

  if (window.mcpToast && typeof window.mcpToast.dismiss === "function") {
    try {
      window.mcpToast.dismiss(id);
      return;
    } catch {
      // fall through to event-based
    }
  }

  window.dispatchEvent(new CustomEvent(DISMISS_EVENT, { detail: id }));
}

// Convenience helpers
export const toast = {
  publish: publishToast,
  update: updateToast,
  dismiss: dismissToast,
};
