export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
	role: ChatRole;
	// Can be string for normal text, or richer structures for vision/audio
	content: unknown;
}

export interface TtsQuery {
	prompt: string; // required text to synthesize
	voice?: string; // optional voice name (e.g., alloy, nova)
}

export function parseTtsQuery(url: string): TtsQuery | null {
	try {
		const { searchParams } = new URL(url);
		const prompt = searchParams.get("prompt") || "";
		const voice = searchParams.get("voice") || undefined;
		if (!prompt) return null;
		return { prompt, voice };
	} catch {
		return null;
	}
}
