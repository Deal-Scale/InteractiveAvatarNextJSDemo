import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

/**
 * Minimal Claude adapter that echoes input until server integration is wired.
 */
export const ClaudeAdapter: ChatProvider = {
	id: "claude",
	label: "Claude",
	supportsVoice: false,
	async sendMessage({ input }): Promise<Message> {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `Claude (stub): ${input}`,
			provider: "claude",
		} as Message;
	},
};
