import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";
import type { GeminiSSEEvent } from "@/app/api/gemini-stream/_responses";
import type { LiveServerMessage } from "@google/genai";

// Parse SSE stream from /api/gemini-stream and collect text parts into a single string
async function collectTextFromSSE(res: Response): Promise<string> {
	if (!res.ok || !res.body) {
		throw new Error(`Gemini stream failed: ${res.status}`);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder("utf-8");
	let buffer = "";
	let output = "";

	const flushChunk = (chunk: string) => {
		if (!chunk.startsWith("data:")) return;
		const json = chunk.replace(/^data:\s*/, "");
		try {
			const evt = JSON.parse(json) as GeminiSSEEvent;
			if (evt.type !== "message") return;
			const payload = (evt as { type: "message"; payload: LiveServerMessage })
				.payload;
			const parts = payload.serverContent?.modelTurn?.parts;
			if (!Array.isArray(parts)) return;
			for (const p of parts) {
				if (typeof (p as { text?: string }).text === "string") {
					output += (p as { text: string }).text;
				}
			}
		} catch {
			// ignore
		}
	};

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		let idx = buffer.indexOf("\n\n");
		while (idx !== -1) {
			const chunk = buffer.slice(0, idx).trim();
			buffer = buffer.slice(idx + 2);
			flushChunk(chunk);
			idx = buffer.indexOf("\n\n");
		}
	}

	return output.trim();
}

export const GeminiAdapter: ChatProvider = {
	id: "gemini",
	label: "Gemini",
	supportsVoice: true,
	async sendMessage({ history: _history, input }): Promise<Message> {
		try {
			const res = await fetch("/api/gemini-stream", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ input }),
			});
			const content = await collectTextFromSSE(res);
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content,
			} as Message;
		} catch (e: unknown) {
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content: `Gemini error: ${(e as Error).message}`,
			} as Message;
		}
	},
};
