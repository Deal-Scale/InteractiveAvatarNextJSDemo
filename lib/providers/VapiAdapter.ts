import type { ChatProvider } from "@/lib/chat/providers";
import { MessageSender } from "@/lib/types";

/**
 * Placeholder voice provider for Vapi integration.
 * TODO: Replace stub logic with real Vapi bridge once API wiring is ready.
 */
export const VapiAdapter: ChatProvider = {
	id: "vapi",
	label: "Vapi",
	supportsVoice: true,
	async sendMessage({ input }) {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `Vapi (voice pipeline stub): ${input}`,
			provider: "vapi",
		};
	},
};
