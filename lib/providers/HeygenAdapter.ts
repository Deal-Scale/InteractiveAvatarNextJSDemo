import type { ChatProvider } from "@/lib/chat/providers";
import type { Message } from "@/lib/types";
import { MessageSender } from "@/lib/types";

// ! Minimal placeholder adapter. Wire to app/api/streaming/task when ready.
export const HeygenAdapter: ChatProvider = {
	id: "heygen",
	label: "Heygen",
	supportsVoice: true,
	async sendMessage({ history: _history, input }): Promise<Message> {
		// * For manual testing, return a simple echo. Replace with real call.
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `Heygen (stub): ${input}`,
			provider: "heygen",
		} as Message;
	},
};
