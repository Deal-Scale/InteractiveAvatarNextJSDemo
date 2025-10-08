import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

/**
 * Placeholder DeepSeek adapter that echoes requests until full integration lands.
 */
export const DeepSeekAdapter: ChatProvider = {
	id: "deepseek",
	label: "DeepSeek",
	supportsVoice: false,
	async sendMessage({ input }): Promise<Message> {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `DeepSeek (stub): ${input}`,
		} as Message;
	},
};
