// MCP Webcam utility: request/release camera capture from non-React code.

export interface MCPWebcamRequest {
  constraints?: MediaTrackConstraints;
}

const WEBCAM_REQUEST_EVENT = "app:webcam:request";
const WEBCAM_RELEASE_EVENT = "app:webcam:release";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function requestWebcam(opts: MCPWebcamRequest = {}): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(WEBCAM_REQUEST_EVENT, { detail: opts }));
}

export function releaseWebcam(): void {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(WEBCAM_RELEASE_EVENT));
}

// Optional global
declare global {
  interface Window {
    mcpWebcam?: {
      request: (opts?: MCPWebcamRequest) => void;
      release: () => void;
    };
  }
}

if (hasWindow()) {
  try {
    window.mcpWebcam = {
      request: requestWebcam,
      release: releaseWebcam,
    };
  } catch {}
}
