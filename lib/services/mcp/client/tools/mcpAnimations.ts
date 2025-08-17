// MCP Animations utility: trigger named UI animations.
// CustomEvents with optional global API.

export interface MCPAnimationTrigger {
  name: string; // app-defined animation key
  target?: string; // optional element or area key the app understands
  durationMs?: number;
  intensity?: number; // 0..1
}

const ANIM_TRIGGER_EVENT = "app:anim:trigger";
const ANIM_STOP_EVENT = "app:anim:stop";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function triggerAnimation(opts: MCPAnimationTrigger): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(ANIM_TRIGGER_EVENT, { detail: opts }));
}

export function stopAnimation(name?: string, target?: string): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(ANIM_STOP_EVENT, { detail: { name, target } }));
}

// Optional global
declare global {
  interface Window {
    mcpAnimations?: {
      trigger: (opts: MCPAnimationTrigger) => void;
      stop: (name?: string, target?: string) => void;
    };
  }
}

if (hasWindow()) {
  try {
    window.mcpAnimations = {
      trigger: triggerAnimation,
      stop: stopAnimation,
    };
  } catch {}
}
