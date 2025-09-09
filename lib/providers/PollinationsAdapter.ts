import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

// ! Minimal placeholder adapter. Replace with /api/pollinations/chat proxy call.
export const PollinationsAdapter: ChatProvider = {
	id: "pollinations",
	label: "Pollinations",
	supportsVoice: false,
	async sendMessage({ history: _history, input }): Promise<Message> {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `Pollinations (stub): ${input}`,
		} as Message;
	},
};
