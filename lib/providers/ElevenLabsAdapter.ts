import type { ChatProvider } from "@/lib/chat/providers";
import { MessageSender } from "@/lib/types";

/**
 * Placeholder voice provider for ElevenLabs integration.
 * TODO: Replace stub logic with real ElevenLabs bridge once API wiring is ready.
 */
export const ElevenLabsAdapter: ChatProvider = {
	id: "elevenlabs",
	label: "ElevenLabs",
	supportsVoice: true,
	async sendMessage({ input }) {
		return {
			id: `resp-${Date.now()}`,
			sender: MessageSender.AVATAR,
			content: `ElevenLabs (voice pipeline stub): ${input}`,
			provider: "elevenlabs",
		};
	},
};
