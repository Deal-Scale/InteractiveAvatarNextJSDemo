// MCP Audio utility: request/release microphone capture from non-React code.
// The React app should handle permissions and provide feedback.

export interface MCPAudioRequest {
	constraints?: MediaTrackConstraints;
}

const AUDIO_REQUEST_EVENT = "app:audio:request";
const AUDIO_RELEASE_EVENT = "app:audio:release";

function hasWindow(): boolean {
	return typeof window !== "undefined";
}

export function requestMic(opts: MCPAudioRequest = {}): void {
	if (!hasWindow()) return;
	window.dispatchEvent(new CustomEvent(AUDIO_REQUEST_EVENT, { detail: opts }));
}

export function releaseMic(): void {
	if (!hasWindow()) return;
	window.dispatchEvent(new CustomEvent(AUDIO_RELEASE_EVENT));
}

// Optional global
declare global {
	interface Window {
		mcpAudio?: {
			request: (opts?: MCPAudioRequest) => void;
			release: () => void;
		};
	}
}

if (hasWindow()) {
	try {
		window.mcpAudio = {
			request: requestMic,
			release: releaseMic,
		};
	} catch {}
}
