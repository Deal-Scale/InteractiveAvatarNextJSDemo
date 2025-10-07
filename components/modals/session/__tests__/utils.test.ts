import { describe, expect, it } from "vitest";

import { buildSessionConfig } from "../utils";

describe("buildSessionConfig", () => {
	const baseConfig = {
		quality: "Low",
		avatarName: "base-avatar",
		knowledgeId: "base-kb",
		language: "en",
		voiceChatTransport: "WEBSOCKET",
		sttSettings: { provider: "deepgram" },
		voice: {
			voiceId: "base-voice",
			rate: 1,
			emotion: "CALM",
			model: "base-model",
		},
	} as any;

	it("merges agent and user settings into the start config", () => {
		const agentConfig = {
			avatarId: "agent-avatar",
			knowledgeBaseId: "agent-kb",
			language: "de",
			voiceId: "agent-voice",
			voice: {
				rate: 1.25,
				emotion: "HAPPY",
				elevenlabs_settings: { model_id: "agent-model" },
			},
			voiceChatTransport: "SFU",
			stt: { provider: "azure" },
		} as any;

		const userSettings = {
			language: "fr",
			quality: "medium",
		} as any;

		const result = buildSessionConfig({
			baseConfig,
			agentConfig,
			userSettings,
		});

		expect(result.avatarName).toBe("agent-avatar");
		expect(result.knowledgeId).toBe("agent-kb");
		expect(result.language).toBe("fr");
		expect(result.quality).toBe("Medium");
		expect(result.voice?.voiceId).toBe("agent-voice");
		expect(result.voice?.rate).toBe(1.25);
		expect(result.voice?.emotion).toBe("HAPPY");
		expect(result.voice?.model).toBe("agent-model");
		expect(result.voiceChatTransport).toBe("SFU");
		expect(result.sttSettings?.provider).toBe("azure");
	});

	it("applies inline overrides on top of agent and user settings", () => {
		const agentConfig = {
			avatarId: "agent-avatar",
			knowledgeBaseId: "agent-kb",
			language: "de",
		} as any;

		const overrides = {
			avatarId: "override-avatar",
			knowledgeBaseId: "override-kb",
			language: "it",
		};

		const result = buildSessionConfig({
			baseConfig,
			agentConfig,
			overrides,
		});

		expect(result.avatarName).toBe("override-avatar");
		expect(result.knowledgeId).toBe("override-kb");
		expect(result.language).toBe("it");
	});
});
