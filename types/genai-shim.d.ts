// Minimal type shim for '@google/genai' to allow compilation and testing without the package.
// Remove this file once you install the real dependency: pnpm add @google/genai

declare module "@google/genai" {
	export type LiveServerMessage = {
		serverContent?: {
			turnComplete?: boolean;
			modelTurn?: {
				parts?: Array<
					| { text?: string }
					| { inlineData?: { mimeType?: string; data?: string } }
					| { fileData?: { fileUri?: string } }
				>;
			};
		};
	};

	export enum Modality {
		TEXT = "TEXT",
		AUDIO = "AUDIO",
	}

	export enum MediaResolution {
		MEDIA_RESOLUTION_LOW = "MEDIA_RESOLUTION_LOW",
		MEDIA_RESOLUTION_MEDIUM = "MEDIA_RESOLUTION_MEDIUM",
		MEDIA_RESOLUTION_HIGH = "MEDIA_RESOLUTION_HIGH",
	}

	export interface LiveCallbacks {
		onopen?: () => void | Promise<void>;
		onmessage?: (message: LiveServerMessage) => void | Promise<void>;
		onerror?: (e: ErrorEvent) => void | Promise<void>;
		onclose?: (e: CloseEvent) => void | Promise<void>;
	}

	export interface LiveConfig {
		responseModalities?: Modality[];
		mediaResolution?: MediaResolution;
		speechConfig?: unknown;
		contextWindowCompression?: unknown;
	}

	export interface Session {
		sendClientContent(payload: { turns: string[] }): void;
		close(): void;
	}

	export class GoogleGenAI {
		constructor(options: { apiKey: string });
		live: {
			connect(options: {
				model: string;
				callbacks?: LiveCallbacks;
				config?: LiveConfig;
			}): Promise<Session>;
		};
	}
}
