import type { StartAvatarRequest } from "@heygen/streaming-avatar";

interface BuildSessionConfigOptions {
	baseConfig: StartAvatarRequest;
	agentConfig?: any;
	userSettings?: any;
	overrides?: {
		avatarId?: string | null;
		knowledgeBaseId?: string | null;
		language?: string | null;
		quality?: StartAvatarRequest["quality"] | string | null;
		voiceChatTransport?: StartAvatarRequest["voiceChatTransport"] | null;
		sttProvider?: StartAvatarRequest["sttSettings"] extends {
			provider?: infer P;
		}
			? P | null
			: any;
		voiceOverrides?: Partial<NonNullable<StartAvatarRequest["voice"]>> | null;
	};
}

export function mapAgentAndSettingsToConfig(
	base: StartAvatarRequest,
	latestAgent: any,
	userSettings?: any,
): StartAvatarRequest {
	let finalConfig: StartAvatarRequest = {
		...base,
		language: latestAgent?.language ?? base.language,
		avatarName: latestAgent?.avatarId ?? base.avatarName,
		knowledgeId: latestAgent?.knowledgeBaseId ?? base.knowledgeId,
		quality: (latestAgent as any)?.quality ?? base.quality,
		voiceChatTransport:
			latestAgent?.voiceChatTransport ?? base.voiceChatTransport,
		sttSettings: {
			...base.sttSettings,
			provider: latestAgent?.stt?.provider ?? base.sttSettings?.provider,
		},
		voice: {
			...base.voice,
			voiceId: latestAgent?.voiceId ?? base.voice?.voiceId,
			rate: latestAgent?.voice?.rate ?? base.voice?.rate,
			emotion: (latestAgent?.voice?.emotion as any) ?? base.voice?.emotion,
			model:
				(latestAgent?.voice as any)?.model ??
				(latestAgent?.voice?.elevenlabs_settings?.model_id as any) ??
				base.voice?.model,
		},
	} as StartAvatarRequest;

	if (userSettings) {
		const q = (userSettings as any).quality;
		const mappedQuality =
			typeof q === "string" ? q[0].toUpperCase() + q.slice(1).toLowerCase() : q;

		finalConfig = {
			...finalConfig,
			quality: (mappedQuality as any) ?? finalConfig.quality,
			language: userSettings.language ?? finalConfig.language,
		} as StartAvatarRequest;
	}

	return finalConfig;
}

function coerceNullable<T>(value: T | null | undefined): T | undefined {
	if (value === null || value === undefined) return undefined;
	if (typeof value === "string" && value.trim() === "") return undefined;
	return value;
}

/**
 * Builds the final session configuration by merging base defaults, persisted agent settings,
 * optional user preferences, and any inline overrides (e.g. quick-start card selections).
 */
export function buildSessionConfig(
	options: BuildSessionConfigOptions,
): StartAvatarRequest {
	const { baseConfig, agentConfig, userSettings, overrides } = options;

	let finalConfig =
		agentConfig || userSettings
			? mapAgentAndSettingsToConfig(baseConfig, agentConfig, userSettings)
			: baseConfig;

	if (!overrides) {
		return finalConfig;
	}

	const {
		avatarId,
		knowledgeBaseId,
		language,
		quality,
		voiceChatTransport,
		sttProvider,
		voiceOverrides,
	} = overrides;

	finalConfig = {
		...finalConfig,
		avatarName: coerceNullable(avatarId) ?? finalConfig.avatarName,
		knowledgeId: coerceNullable(knowledgeBaseId) ?? finalConfig.knowledgeId,
		language: coerceNullable(language) ?? finalConfig.language,
		quality:
			quality !== undefined && quality !== null
				? typeof quality === "string"
					? (quality[0]?.toUpperCase() ?? "") + quality.slice(1).toLowerCase()
					: quality
				: finalConfig.quality,
		voiceChatTransport: voiceChatTransport ?? finalConfig.voiceChatTransport,
		sttSettings: sttProvider
			? {
					...finalConfig.sttSettings,
					provider: sttProvider,
				}
			: finalConfig.sttSettings,
		voice: voiceOverrides
			? {
					...finalConfig.voice,
					...voiceOverrides,
				}
			: finalConfig.voice,
	} as StartAvatarRequest;

	return finalConfig;
}

export function applyUserSettingsToConfig(
	prev: StartAvatarRequest,
	userSettings?: any,
): StartAvatarRequest {
	if (!userSettings) return prev;

	const q = (userSettings as any).quality;
	const mappedQuality =
		typeof q === "string" ? q[0].toUpperCase() + q.slice(1).toLowerCase() : q;

	return {
		...prev,
		quality: (mappedQuality as any) ?? prev.quality,
		language: userSettings.language ?? prev.language,
	} as StartAvatarRequest;
}

export function initFormsFromStorage(options: {
	globalForm: any;
	userForm: any;
	agentForm: any;
	globalSettings?: any;
	userSettings?: any;
	currentAgent?: any;
	agentSettings?: any;
}) {
	if (typeof window === "undefined") return;

	const {
		globalForm,
		userForm,
		agentForm,
		globalSettings,
		userSettings,
		currentAgent,
		agentSettings,
	} = options;

	try {
		if (globalSettings) {
			globalForm.reset(globalSettings);
		} else {
			const savedGlobal = localStorage.getItem("globalSettings");

			if (savedGlobal) globalForm.reset(JSON.parse(savedGlobal));
		}

		if (userSettings) {
			userForm.reset(userSettings);
		} else {
			const savedUser = localStorage.getItem("userSettings");

			if (savedUser) userForm.reset(JSON.parse(savedUser));
		}

		if (currentAgent) {
			agentForm.reset(currentAgent as any);
		} else if (agentSettings) {
			agentForm.reset(agentSettings as any);
		} else {
			const savedAgent = localStorage.getItem("agentSettings");

			if (savedAgent) agentForm.reset(JSON.parse(savedAgent));
		}
	} catch (e) {
		console.warn("Failed to load saved settings", e);
	}
}
