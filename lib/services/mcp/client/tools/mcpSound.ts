// MCP Sound utility: allow agents/non-React code to play UI sounds.
// Uses CustomEvents with an optional window global for direct calls.

export interface MCPSoundPlay {
  name?: string; // app-registered sound key
  url?: string; // external audio URL
  volume?: number; // 0..1
  loop?: boolean;
}

const SOUND_PLAY_EVENT = "app:sound:play";
const SOUND_STOP_ALL_EVENT = "app:sound:stopAll";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function playSound(opts: MCPSoundPlay): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(SOUND_PLAY_EVENT, { detail: opts }));
}

export function stopAllSounds(): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(SOUND_STOP_ALL_EVENT));
}

// Optional global for direct control
declare global {
  interface Window {
    mcpSound?: {
      play: (opts: MCPSoundPlay) => void;
      stopAll: () => void;
    };
  }
}

if (hasWindow()) {
  try {
    window.mcpSound = {
      play: playSound,
      stopAll: stopAllSounds,
    };
  } catch {}
}
