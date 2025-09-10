import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

// Parse OpenRouter chat completion response content into a single string
function extractContent(data: any): string {
	try {
		const choice = data?.choices?.[0];
		const msg = choice?.message;
		if (!msg) return "";
		// OpenAI-like: content can be string or array of parts
		if (typeof msg.content === "string") return msg.content;
		if (Array.isArray(msg.content)) {
			return msg.content
				.map((p: any) => (typeof p?.text === "string" ? p.text : ""))
				.join("");
		}
		return "";
	} catch {
		return "";
	}
}

export const OpenRouterAdapter: ChatProvider = {
	id: "openrouter",
	label: "OpenRouter",
	supportsVoice: false,
	async sendMessage({ history, input }): Promise<Message> {
		// Map history to OpenAI-like messages
		const messages = [
			...history.map((m) => ({
				role: m.sender === MessageSender.CLIENT ? "user" : "assistant",
				content: m.content as unknown,
			})),
			{ role: "user", content: input },
		];

		try {
			const res = await fetch("/api/openrouter/chat/completions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model: "openrouter/auto", messages }),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `OpenRouter error: ${res.status}`);
			}
			const data = await res.json();
			const content = extractContent(data);
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content,
			} as Message;
		} catch (e: unknown) {
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content: `OpenRouter error: ${(e as Error).message}`,
			} as Message;
		}
	},
};
