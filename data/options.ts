import {
	STTProvider,
	VoiceChatTransport,
	VoiceEmotion,
} from "@heygen/streaming-avatar";
import { useQuery } from "@tanstack/react-query";

export type Option = {
	value: string;
	label: string;
	description?: string;
	capabilities?: string[];
	docsUrl?: string;
	previewUrl?: string;
	transport?: string;
	command?: string;
	url?: string;
};

const MCP_DOCS_URL =
	"https://modelcontextprotocol.io/docs/develop/build-server";
const OPENAI_TTS_DOCS_URL =
	"https://platform.openai.com/docs/guides/text-to-speech";
const GEMINI_TTS_DOCS_URL =
	"https://ai.google.dev/gemini-api/docs/speech-generation";
const ELEVENLABS_VOICE_DOCS_URL =
	"https://elevenlabs.io/docs/api-reference/voices/get";
const LIVEAVATAR_VOICE_DOCS_URL = "https://docs.liveavatar.com/reference";

export const predefinedMcpServerOptions: Option[] = [
	{
		value: "filesystem",
		label: "Filesystem",
		description:
			"Read, search, create, and update files in approved local workspace paths.",
		capabilities: ["read files", "write files", "list directories", "search"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
		transport: "stdio",
		command: "npx @modelcontextprotocol/server-filesystem",
	},
	{
		value: "github",
		label: "GitHub",
		description:
			"Work with repositories, issues, pull requests, branches, and code search.",
		capabilities: ["repos", "issues", "pull requests", "code search"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/github",
		transport: "http/stdio",
		command: "npx @modelcontextprotocol/server-github",
	},
	{
		value: "postgres",
		label: "Postgres",
		description:
			"Inspect schemas and run database queries through a configured Postgres connection.",
		capabilities: ["schemas", "SQL queries", "tables", "read data"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
		transport: "stdio",
		command: "npx @modelcontextprotocol/server-postgres",
	},
	{
		value: "fetch",
		label: "Fetch",
		description:
			"Retrieve web pages and convert them into model-readable content.",
		capabilities: ["web fetch", "HTML to markdown", "URL content"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
		transport: "stdio",
		command: "uvx mcp-server-fetch",
	},
	{
		value: "memory",
		label: "Memory",
		description:
			"Store and retrieve persistent facts or graph-like memory for an agent.",
		capabilities: ["entities", "relations", "persistent memory", "recall"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
		transport: "stdio",
		command: "npx @modelcontextprotocol/server-memory",
	},
	{
		value: "browser",
		label: "Browser",
		description:
			"Automate browser actions for navigation, forms, screenshots, and page inspection.",
		capabilities: ["navigate", "click", "forms", "screenshots"],
		docsUrl: "https://github.com/microsoft/playwright-mcp",
		transport: "stdio",
		command: "npx @playwright/mcp",
	},
	{
		value: "slack",
		label: "Slack",
		description:
			"Read channels, send messages, and coordinate work in Slack workspaces.",
		capabilities: ["channels", "messages", "workspace search"],
		docsUrl:
			"https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
		transport: "stdio",
		command: "npx @modelcontextprotocol/server-slack",
	},
];

const mergeOptions = (...groups: Option[][]): Option[] =>
	Array.from(
		new Map(
			groups.flat().map((option) => [option.value, option] as const),
		).values(),
	);

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

const toOptionLabel = (value: unknown, fallback: string): string => {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed || fallback;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (value && typeof value === "object") {
		const objectValue = value as Record<string, unknown>;
		return (
			pickFirstString(
				objectValue.name,
				objectValue.label,
				objectValue.title,
				objectValue.display_name,
				objectValue.displayName,
				objectValue.id,
			) ?? fallback
		);
	}
	return fallback;
};

// Generic helpers
export const enumToOptions = (e: Record<string, string | number>): Option[] => {
	const options = Object.values(e)
		.map((v) => toStringId(v))
		.filter((v): v is string => Boolean(v))
		.map((v) => ({ value: v, label: v }));

	return Array.from(
		new Map(options.map((option) => [option.value, option])).values(),
	);
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

export type TextModelProvider = "openai" | "anthropic" | "gemini";

export const fallbackTextModelOptions: Record<TextModelProvider, Option[]> = {
	openai: [
		{ value: "gpt-4.1", label: "GPT-4.1" },
		{ value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
		{ value: "gpt-4o", label: "GPT-4o" },
		{ value: "gpt-4o-mini", label: "GPT-4o Mini" },
	],
	anthropic: [
		{ value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
		{ value: "claude-opus-4-1", label: "Claude Opus 4.1" },
		{ value: "claude-3-5-haiku", label: "Claude 3.5 Haiku" },
	],
	gemini: [
		{ value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
		{ value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
		{ value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
	],
};

export type VoiceOptionProvider =
	| "liveavatar"
	| "elevenlabs"
	| "openai"
	| "gemini";

export const fallbackVoiceOptionsByProvider: Record<
	VoiceOptionProvider,
	Option[]
> = {
	liveavatar: [],
	elevenlabs: [
		{
			value: "21m00Tcm4TlvDq8ikWAM",
			label: "Rachel",
			docsUrl: ELEVENLABS_VOICE_DOCS_URL,
		},
		{
			value: "AZnzlk1XvdvUeBnXmlld",
			label: "Domi",
			docsUrl: ELEVENLABS_VOICE_DOCS_URL,
		},
		{
			value: "EXAVITQu4vr4xnSDxMaL",
			label: "Bella",
			docsUrl: ELEVENLABS_VOICE_DOCS_URL,
		},
		{
			value: "ErXwobaYiN019PkySvjV",
			label: "Antoni",
			docsUrl: ELEVENLABS_VOICE_DOCS_URL,
		},
		{
			value: "MF3mGyEYCl7XYWbV9V6O",
			label: "Elli",
			docsUrl: ELEVENLABS_VOICE_DOCS_URL,
		},
	],
	openai: [
		{ value: "alloy", label: "Alloy" },
		{ value: "ash", label: "Ash" },
		{ value: "ballad", label: "Ballad" },
		{ value: "coral", label: "Coral" },
		{ value: "echo", label: "Echo" },
		{ value: "fable", label: "Fable" },
		{ value: "nova", label: "Nova" },
		{ value: "onyx", label: "Onyx" },
		{ value: "sage", label: "Sage" },
		{ value: "shimmer", label: "Shimmer" },
		{ value: "verse", label: "Verse" },
	],
	gemini: [
		{ value: "Zephyr", label: "Zephyr" },
		{ value: "Puck", label: "Puck" },
		{ value: "Charon", label: "Charon" },
		{ value: "Kore", label: "Kore" },
		{ value: "Fenrir", label: "Fenrir" },
		{ value: "Aoede", label: "Aoede" },
		{ value: "Leda", label: "Leda" },
		{ value: "Orus", label: "Orus" },
	],
};

export const loadTextModelOptions = async (
	provider: TextModelProvider,
): Promise<Option[]> => {
	try {
		const res = await fetch(
			`/api/ai-models?provider=${encodeURIComponent(provider)}`,
			{ cache: "no-store" },
		);
		if (!res.ok) return fallbackTextModelOptions[provider];

		const json: any = await res.json();
		const list = Array.isArray(json?.models) ? json.models : [];
		const options = list
			.map((item: any) => {
				const id = toStringId(item?.value ?? item?.id ?? item?.name);
				if (!id) return undefined;
				const label = pickFirstString(item?.label, item?.displayName) ?? id;
				return { value: id, label };
			})
			.filter(Boolean);

		return options.length ? options : fallbackTextModelOptions[provider];
	} catch {
		return fallbackTextModelOptions[provider];
	}
};

// Placeholder loaders for future API-driven lists
export const loadAvatarOptions = async (): Promise<Option[]> => {
	try {
		const res = await fetch("/api/avatars", { cache: "no-store" });
		const json: any = await res.json();
		// Try a few common shapes
		const list =
			(Array.isArray(json?.data?.avatars) && json.data.avatars) ||
			(Array.isArray(json?.data?.results) && json.data.results) ||
			(Array.isArray(json?.avatars) && json.avatars) ||
			(Array.isArray(json?.data) && json.data) ||
			(Array.isArray(json?.results) && json.results) ||
			[];
		const opts: Option[] = list
			.map((item: any) => {
				const rawId = item?.avatarId ?? item?.avatar_id ?? item?.id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						toOptionLabel(item?.name, ""),
						item?.avatarName,
						item?.avatar_name,
						item?.displayName,
						item?.display_name,
						item?.label,
					) ?? id;

				return {
					value: id,
					label,
					previewUrl:
						pickFirstString(
							item?.previewUrl,
							item?.preview_url,
							item?.previewAudioUrl,
							item?.preview_audio_url,
							item?.sampleUrl,
							item?.sample_url,
							item?.audioUrl,
							item?.audio_url,
							item?.url,
						) ?? `/api/voices/${encodeURIComponent(id)}/preview`,
				};
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
		queryKey: ["liveavatar", "avatars", "options"],
		queryFn: loadAvatarOptions,
		staleTime: 5 * 60_000,
		placeholderData: [],
	});
}

export function useVoiceOptionsQuery(
	provider: VoiceOptionProvider = "liveavatar",
) {
	return useQuery({
		queryKey: ["voices", provider, "options"],
		queryFn: () => loadVoiceOptions(provider),
		staleTime: 5 * 60_000,
		placeholderData: fallbackVoiceOptionsByProvider[provider],
	});
}

export function useMcpServerOptionsQuery() {
	return useQuery({
		queryKey: ["mcp", "servers", "options"],
		queryFn: loadMcpServerOptions,
		staleTime: 5 * 60_000,
		initialData: predefinedMcpServerOptions,
	});
}

export function useKnowledgeBaseOptionsQuery() {
	return useQuery({
		queryKey: ["liveavatar", "knowledge-bases", "options"],
		queryFn: loadKnowledgeBaseOptions,
		staleTime: 5 * 60_000,
		placeholderData: [],
	});
}

export function useTextModelOptionsQuery(provider: TextModelProvider) {
	return useQuery({
		queryKey: ["ai-models", provider],
		queryFn: () => loadTextModelOptions(provider),
		staleTime: 5 * 60_000,
		placeholderData: fallbackTextModelOptions[provider],
	});
}

export const loadVoiceOptions = async (
	provider: VoiceOptionProvider = "liveavatar",
): Promise<Option[]> => {
	if (provider === "openai" || provider === "gemini") {
		const docsUrl =
			provider === "openai" ? OPENAI_TTS_DOCS_URL : GEMINI_TTS_DOCS_URL;
		return fallbackVoiceOptionsByProvider[provider].map((option) => ({
			...option,
			docsUrl,
			previewUrl:
				provider === "gemini"
					? `/api/voices/${encodeURIComponent(option.value)}/preview?provider=gemini`
					: undefined,
		}));
	}

	try {
		const res = await fetch(
			`/api/voices?provider=${encodeURIComponent(provider)}`,
			{ cache: "no-store" },
		);
		if (!res.ok) return fallbackVoiceOptionsByProvider[provider];
		const json: any = await res.json();
		const list =
			(Array.isArray(json?.data?.voices) && json.data.voices) ||
			(Array.isArray(json?.data?.results) && json.data.results) ||
			(Array.isArray(json?.voices) && json.voices) ||
			(Array.isArray(json?.data) && json.data) ||
			(Array.isArray(json?.results) && json.results) ||
			[];
		const opts: Option[] = list
			.map((item: any) => {
				const rawId = item?.voiceId ?? item?.voice_id ?? item?.id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						toOptionLabel(item?.name, ""),
						item?.voiceName,
						item?.voice_name,
						item?.display_name,
						item?.displayName,
						item?.label,
					) ?? id;
				const directPreviewUrl = pickFirstString(
					item?.previewUrl,
					item?.preview_url,
					item?.previewAudioUrl,
					item?.preview_audio_url,
					item?.sampleUrl,
					item?.sample_url,
					item?.audioUrl,
					item?.audio_url,
				);
				const previewUrl =
					provider === "liveavatar"
						? (directPreviewUrl ??
							`/api/voices/${encodeURIComponent(id)}/preview?provider=liveavatar`)
						: provider === "elevenlabs" && directPreviewUrl
							? `/api/voices/${encodeURIComponent(id)}/preview?provider=elevenlabs&preview_url=${encodeURIComponent(directPreviewUrl)}`
							: undefined;
				const docsUrl =
					provider === "liveavatar"
						? LIVEAVATAR_VOICE_DOCS_URL
						: ELEVENLABS_VOICE_DOCS_URL;

				return {
					value: id,
					label,
					docsUrl,
					previewUrl,
				};
			})
			.filter(Boolean);

		return opts.length ? opts : fallbackVoiceOptionsByProvider[provider];
	} catch {
		return fallbackVoiceOptionsByProvider[provider];
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
						s?.name,
						s?.displayName,
						s?.display_name,
						s?.label,
						s?.description,
					) ?? id;

				const toolNames = Array.isArray(s?.tools)
					? s.tools
							.map((tool: unknown) =>
								typeof tool === "string"
									? tool
									: pickFirstString(
											(tool as Record<string, unknown> | undefined)?.name,
											(tool as Record<string, unknown> | undefined)?.label,
										),
							)
							.filter(
								(tool: unknown): tool is string => typeof tool === "string",
							)
					: [];
				const rawCapabilities =
					(Array.isArray(s?.capabilities) && s.capabilities) ||
					(Array.isArray(s?.abilities) && s.abilities) ||
					toolNames ||
					[];
				const capabilities = rawCapabilities
					.map((capability: unknown) => toOptionLabel(capability, ""))
					.filter(Boolean);

				return {
					value: id,
					label,
					description: pickFirstString(s?.description, s?.summary),
					capabilities,
					docsUrl:
						pickFirstString(s?.docsUrl, s?.docs_url, s?.documentationUrl) ??
						MCP_DOCS_URL,
					transport: pickFirstString(s?.transport, s?.type),
					command: pickFirstString(s?.command),
					url: pickFirstString(s?.url, s?.endpoint),
				};
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
			(Array.isArray(json?.data?.results) && json.data.results) ||
			(Array.isArray(json?.knowledgeBases) && json.knowledgeBases) ||
			(Array.isArray(json?.contexts) && json.contexts) ||
			(Array.isArray(json?.results) && json.results) ||
			[];
		const opts: Option[] = list
			.map((kb: any) => {
				const rawId =
					kb?.context_id ??
					kb?.contextId ??
					kb?.id ??
					kb?.knowledgeBaseId ??
					kb?.knowledge_base_id;
				const id = toStringId(rawId);
				if (!id) return undefined;

				const label =
					pickFirstString(
						toOptionLabel(kb?.name, ""),
						kb?.title,
						kb?.context_name,
						kb?.contextName,
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
