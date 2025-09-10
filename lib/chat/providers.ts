import type { Message } from "@/lib/types";

export type ProviderId = "heygen" | "pollinations" | "gemini";

export interface ProviderSendOptions {
	jsonMode?: boolean;
	systemPrompt?: string;
	seed?: number;
}

export interface ChatProvider {
	id: ProviderId;
	label: string;
	supportsVoice: boolean;
	sendMessage: (params: {
		history: Message[];
		input: string;
		options?: ProviderSendOptions;
	}) => Promise<Message>;
	teardown?: () => Promise<void> | void;
}
