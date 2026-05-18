import type { StartAvatarRequest } from "@heygen/streaming-avatar";
import { NextResponse } from "next/server";

export const LIVEAVATAR_BASE =
	process.env.LIVEAVATAR_BASE_API_URL ||
	process.env.NEXT_PUBLIC_LIVEAVATAR_BASE_API_URL ||
	"https://api.liveavatar.com";

export const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;

type LiveAvatarErrorBody = {
	error?: { message?: string };
	message?: string;
	detail?: string;
};

export type LiveAvatarSessionRequest = {
	avatar_id: string;
	avatar_persona?: {
		voice_id?: string;
		context_id?: string;
		language?: string;
		voice_settings?: Record<string, unknown>;
		stt_config?: Record<string, unknown>;
	};
	mode: "FULL";
	is_sandbox?: boolean;
	video_settings?: {
		quality?: "low" | "medium" | "high";
		encoding?: "H264";
	};
	max_session_duration?: number;
	interactivity_type?: "CONVERSATIONAL" | "PUSH_TO_TALK";
	llm_configuration_id?: string;
	dynamic_variables?: Record<string, string>;
};

export type LiveAvatarEmbedRequest = {
	avatar_id: string;
	context_id: string;
	voice_id?: string;
	type?: "DEFAULT" | "WIDGET";
	max_session_duration?: number;
	default_language?: string;
	is_sandbox?: boolean;
	orientation?: "horizontal" | "vertical";
};

export function missingLiveAvatarKeyResponse() {
	return NextResponse.json(
		{
			error:
				"Missing LIVEAVATAR_API_KEY. The legacy HEYGEN_API_KEY is not valid for LiveAvatar. Create a LiveAvatar developer API key at app.liveavatar.com/developers and set LIVEAVATAR_API_KEY in your environment.",
		},
		{ status: 500 },
	);
}

export function liveAvatarHeaders() {
	if (!LIVEAVATAR_API_KEY) {
		throw new Error("Missing LIVEAVATAR_API_KEY");
	}

	return {
		"Content-Type": "application/json",
		"X-API-KEY": LIVEAVATAR_API_KEY,
	};
}

export async function parseLiveAvatarResponse(res: Response) {
	const text = await res.text();

	if (!text) return null;

	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export function getLiveAvatarErrorMessage(data: unknown, fallback: string) {
	if (!data || typeof data !== "object") return fallback;

	const body = data as LiveAvatarErrorBody;

	return body.error?.message || body.message || body.detail || fallback;
}

export function getLiveAvatarAuthErrorMessage(data: unknown) {
	const message = getLiveAvatarErrorMessage(
		data,
		"LiveAvatar rejected the configured API key.",
	);

	return `${message} Confirm LIVEAVATAR_API_KEY is a LiveAvatar developer API key from app.liveavatar.com/developers, not the legacy HeyGen API key, then restart pnpm run dev.`;
}

export function normalizeLiveAvatarList(data: unknown) {
	if (!data || typeof data !== "object") return [];

	const root = data as Record<string, unknown>;
	const payload = root.data;

	if (Array.isArray(payload)) return payload;
	if (!payload || typeof payload !== "object") return [];

	const payloadObject = payload as Record<string, unknown>;

	for (const key of [
		"results",
		"items",
		"avatars",
		"voices",
		"contexts",
		"data",
	]) {
		const value = payloadObject[key];
		if (Array.isArray(value)) return value;
	}

	return [];
}

function qualityToLiveAvatar(value: unknown): "low" | "medium" | "high" {
	const normalized = String(value || "").toLowerCase();

	if (normalized.includes("high")) return "high";
	if (normalized.includes("medium")) return "medium";
	return "low";
}

function getVoiceId(config: StartAvatarRequest) {
	const voice = config.voice as
		| (Record<string, unknown> & {
				voiceId?: string;
				voice_id?: string;
		  })
		| undefined;

	return voice?.voiceId || voice?.voice_id;
}

export function toLiveAvatarSessionRequest(
	config: StartAvatarRequest,
): LiveAvatarSessionRequest {
	const voice = config.voice as Record<string, unknown> | undefined;
	const sttSettings = config.sttSettings as Record<string, unknown> | undefined;
	const contextId =
		config.knowledgeId || (config as { contextId?: string }).contextId;
	const voiceId = getVoiceId(config);

	return {
		avatar_id: config.avatarName,
		mode: "FULL",
		is_sandbox: process.env.LIVEAVATAR_SANDBOX === "true",
		avatar_persona: {
			...(voiceId ? { voice_id: voiceId } : {}),
			...(contextId ? { context_id: contextId } : {}),
			language: config.language || "en",
			voice_settings: {
				provider: "elevenLabs",
				...(voice?.rate ? { speed: voice.rate } : {}),
				...(voice?.model ? { model: voice.model } : {}),
				...((voice?.elevenlabs_settings as
					| Record<string, unknown>
					| undefined) ?? {}),
			},
			stt_config: {
				provider:
					(sttSettings?.provider
						? String(sttSettings.provider).toLowerCase()
						: undefined) || "deepgram",
			},
		},
		video_settings: {
			quality: qualityToLiveAvatar(config.quality),
			encoding: "H264",
		},
		interactivity_type: "CONVERSATIONAL",
	};
}

export function toLiveAvatarEmbedRequest(
	config: StartAvatarRequest,
): LiveAvatarEmbedRequest {
	const contextId =
		config.knowledgeId || (config as { contextId?: string }).contextId;

	if (!contextId) {
		throw new Error(
			"LiveAvatar embed sessions require a context_id. Select a context or paste a LiveAvatar context UUID.",
		);
	}

	const voiceId = getVoiceId(config);

	return {
		avatar_id: config.avatarName,
		context_id: contextId,
		...(voiceId ? { voice_id: voiceId } : {}),
		type: "DEFAULT",
		default_language: config.language || "en",
		is_sandbox: process.env.LIVEAVATAR_SANDBOX === "true",
		orientation: "horizontal",
	};
}
