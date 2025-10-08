import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

// Helper: map internal Message[] to OpenAI-like chat messages
function toOpenAIMessages(history: Message[], input: string) {
	const messages = history.map((m) => ({
		role: m.sender === MessageSender.CLIENT ? "user" : "assistant",
		content: m.content as unknown,
	}));
	messages.push({ role: "user", content: input });
	return messages;
}

// ! Calls local proxy route /api/pollinations/text/chat-completion
export const PollinationsAdapter: ChatProvider = {
	id: "pollinations",
	label: "Pollinations",
	supportsVoice: false,
	async sendMessage({ history, input }): Promise<Message> {
		try {
			const res = await fetch("/api/pollinations/text/chat-completion", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: "openai",
					messages: toOpenAIMessages(history, input),
				}),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `Pollinations error: ${res.status}`);
			}
			const data = await res.json();
			const content = data?.choices?.[0]?.message?.content ?? "";
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content,
				provider: "pollinations",
			} as Message;
		} catch (e: unknown) {
			return {
				id: `resp-${Date.now()}`,
				sender: MessageSender.AVATAR,
				content: `Pollinations error: ${(e as Error).message}`,
				provider: "pollinations",
			} as Message;
		}
	},
};
