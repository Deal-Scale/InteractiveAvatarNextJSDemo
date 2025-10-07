// MCP Webcam utility: request/release camera capture from non-React code.

export interface MCPWebcamRequest {
	constraints?: MediaTrackConstraints;
}

const WEBCAM_REQUEST_EVENT = "app:webcam:request";
const WEBCAM_RELEASE_EVENT = "app:webcam:release";

function hasWindow(): boolean {
	return typeof window !== "undefined";
}

const w = typeof window !== "undefined" ? window : undefined;

export function requestWebcam(opts: MCPWebcamRequest = {}): void {
	if (!hasWindow()) return;
	w?.dispatchEvent(new CustomEvent(WEBCAM_REQUEST_EVENT, { detail: opts }));
}

export function releaseWebcam(): void {
	if (!hasWindow()) return;
	w?.dispatchEvent(new CustomEvent(WEBCAM_RELEASE_EVENT));
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
		if (w)
			w.mcpWebcam = {
				request: requestWebcam,
				release: releaseWebcam,
			};
	} catch {}
}
