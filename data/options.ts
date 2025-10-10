import {
	STTProvider,
	VoiceChatTransport,
	VoiceEmotion,
} from "@heygen/streaming-avatar";
import { useQuery } from "@tanstack/react-query";

export type Option = { value: string; label: string };

const pickFirstString = (...candidates: Array<unknown>): string | undefined => {
	for (const candidate of candidates) {
		if (typeof candidate === "string") {
			const trimmed = candidate.trim();
			if (trimmed.length > 0) return trimmed;
		}
	}
	return undefined;
};

const toStringId = (value: unknown): string | undefined => {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}
	if (typeof value === "number") return String(value);
	return undefined;
};

// Generic helpers
export const enumToOptions = (e: Record<string, string | number>): Option[] => {
	return Object.values(e)
		.filter((v): v is string => typeof v === "string")
		.map((v) => ({ value: v, label: v }));
};

export const arrayToOptions = (arr: string[]): Option[] =>
	arr.map((v) => ({ value: v, label: v }));

// Common static option sets (extend as needed)
export const languagesOptions: Option[] = arrayToOptions([
	"en-US",
	"en-GB",
	"es-ES",
	"fr-FR",
	"de-DE",
	"it-IT",
	"pt-BR",
	"ja-JP",
	"ko-KR",
	"zh-CN",
]);

// HeyGen SDK enums
export const sttProviderOptions: Option[] = enumToOptions(
	STTProvider as unknown as Record<string, string | number>,
);
export const voiceChatTransportOptions: Option[] = enumToOptions(
	VoiceChatTransport as unknown as Record<string, string | number>,
);
export const voiceEmotionOptions: Option[] = enumToOptions(
	VoiceEmotion as unknown as Record<string, string | number>,
);

// Placeholder loaders for future API-driven lists
export const loadAvatarOptions = async (): Promise<Option[]> => {
	try {
		const res = await fetch("/api/avatars", { cache: "no-store" });
		const json: any = await res.json();
		// Try a few common shapes
		const list =
			(Array.isArray(json?.data?.avatars) && json.data.avatars) ||
			(Array.isArray(json?.avatars) && json.avatars) ||
			(Array.isArray(json?.data) && json.data) ||
			[];
		const opts: Option[] = list
			.map((item: any) => {
				const rawId = item?.avatarId ?? item?.avatar_id ?? item?.id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						item?.name,
						item?.avatarName,
						item?.avatar_name,
						item?.displayName,
						item?.display_name,
						item?.label,
					) ?? id;

				return { value: id, label };
			})
			.filter(Boolean);

		return opts;
	} catch {
		return [];
	}
};

// Preferred React Query hooks for options (non-breaking additions)
export function useAvatarOptionsQuery() {
	return useQuery({
		queryKey: ["avatars", "options"],
		queryFn: loadAvatarOptions,
		staleTime: 5 * 60_000,
		initialData: [],
	});
}

export function useVoiceOptionsQuery() {
	return useQuery({
		queryKey: ["voices", "options"],
		queryFn: loadVoiceOptions,
		staleTime: 5 * 60_000,
		initialData: [],
	});
}

export function useMcpServerOptionsQuery() {
	return useQuery({
		queryKey: ["mcp", "servers", "options"],
		queryFn: loadMcpServerOptions,
		staleTime: 5 * 60_000,
		initialData: [],
	});
}

export function useKnowledgeBaseOptionsQuery() {
	return useQuery({
		queryKey: ["knowledge-bases", "options"],
		queryFn: loadKnowledgeBaseOptions,
		staleTime: 5 * 60_000,
		initialData: [],
	});
}

export const loadVoiceOptions = async (): Promise<Option[]> => {
	try {
		const res = await fetch("/api/voices", { cache: "no-store" });
		const json: any = await res.json();
		const list =
			(Array.isArray(json?.data?.voices) && json.data.voices) ||
			(Array.isArray(json?.voices) && json.voices) ||
			(Array.isArray(json?.data) && json.data) ||
			[];
		const opts: Option[] = list
			.map((item: any) => {
				const rawId = item?.voiceId ?? item?.voice_id ?? item?.id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						item?.name,
						item?.voiceName,
						item?.voice_name,
						item?.displayName,
						item?.display_name,
						item?.label,
					) ?? id;

				return { value: id, label };
			})
			.filter(Boolean);

		return opts;
	} catch {
		return [];
	}
};

export const loadMcpServerOptions = async (): Promise<Option[]> => {
	try {
		const res = await fetch("/api/mcp/servers", { cache: "no-store" });
		const json: any = await res.json();
		const list =
			(Array.isArray(json?.servers) && json.servers) ||
			(Array.isArray(json?.data?.servers) && json.data.servers) ||
			[];
		const opts: Option[] = list
			.map((s: any) => {
				const rawId = s?.id ?? s?.name;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						s?.description,
						s?.displayName,
						s?.display_name,
						s?.label,
						s?.name,
					) ?? id;

				return { value: id, label };
			})
			.filter(Boolean);

		return opts;
	} catch {
		return [];
	}
};

// Attempt to load knowledge bases from a presumed endpoint. Falls back to empty list.
export const loadKnowledgeBaseOptions = async (): Promise<Option[]> => {
	try {
		const res = await fetch("/api/knowledge-bases", { cache: "no-store" });

		if (!res.ok) return [];
		const json: any = await res.json();
		const list =
			(Array.isArray(json?.data) && json.data) ||
			(Array.isArray(json?.knowledgeBases) && json.knowledgeBases) ||
			[];
		const opts: Option[] = list
			.map((kb: any) => {
				const rawId = kb?.id ?? kb?.knowledgeBaseId ?? kb?.knowledge_base_id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						kb?.name,
						kb?.title,
						kb?.displayName,
						kb?.display_name,
						kb?.label,
					) ?? id;

				return { value: id, label };
			})
			.filter(Boolean);

		return opts;
	} catch {
		return [];
	}
};
