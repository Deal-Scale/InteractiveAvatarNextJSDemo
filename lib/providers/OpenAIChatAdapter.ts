import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

function mapHistory(history: Message[], input: string) {
	const mapped = history.map((m) => ({
		role: m.sender === MessageSender.CLIENT ? "user" : "assistant",
		content: m.content as unknown,
	}));
	mapped.push({ role: "user", content: input });
	return mapped;
}

/**
 * Adapter that proxies chat completions through the OpenAI API route.
 */
export const OpenAIChatAdapter: ChatProvider = {
	id: "openai",
	label: "OpenAI",
	supportsVoice: false,
	async sendMessage({ history, input }): Promise<Message> {
		try {
			const res = await fetch("/api/open-ai/v1/chat/completions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: "gpt-4o-mini",
					messages: mapHistory(history, input),
				}),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `OpenAI error: ${res.status}`);
			}
			const data = await res.json();
			const rawContent = data?.choices?.[0]?.message?.content;
			const content = Array.isArray(rawContent)
				? rawContent
						.map((part: { text?: string } | string) =>
							typeof part === "string" ? part : (part?.text ?? ""),
						)
						.join("")
				: typeof rawContent === "string"
					? rawContent
					: "";
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content,
				provider: "openai",
			} as Message;
		} catch (error) {
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content: `OpenAI error: ${(error as Error).message}`,
				provider: "openai",
			} as Message;
		}
	},
};
