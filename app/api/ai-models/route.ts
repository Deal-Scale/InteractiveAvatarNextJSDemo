export const runtime = "nodejs";

type ModelOption = {
	value: string;
	label: string;
};

type TextProvider = "openai" | "anthropic" | "gemini";

const FALLBACK_MODELS: Record<TextProvider, ModelOption[]> = {
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

const PROVIDERS = new Set(["openai", "anthropic", "gemini"]);

const titleModel = (id: string) =>
	id
		.replace(/^models\//, "")
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) =>
			part.length <= 3
				? part.toUpperCase()
				: part[0].toUpperCase() + part.slice(1),
		)
		.join(" ");

const uniqueSorted = (models: ModelOption[]) =>
	Array.from(
		new Map(models.map((model) => [model.value, model])).values(),
	).sort((a, b) => a.label.localeCompare(b.label));

const isOpenAiTextModel = (id: string) => {
	const lower = id.toLowerCase();
	if (!/^(gpt|o\d|chatgpt)/.test(lower)) return false;
	return ![
		"audio",
		"realtime",
		"tts",
		"whisper",
		"transcribe",
		"embedding",
		"image",
		"moderation",
		"dall-e",
	].some((blocked) => lower.includes(blocked));
};

async function loadOpenAiModels(): Promise<ModelOption[]> {
	const apiKey = process.env.OPENAI_API_KEY?.trim();
	if (!apiKey) return FALLBACK_MODELS.openai;

	const res = await fetch("https://api.openai.com/v1/models", {
		headers: { Authorization: `Bearer ${apiKey}` },
		cache: "no-store",
	});
	if (!res.ok) return FALLBACK_MODELS.openai;

	const json = await res.json();
	const list = Array.isArray(json?.data) ? json.data : [];
	const models = list
		.map((item: unknown) =>
			typeof (item as { id?: unknown })?.id === "string"
				? (item as { id: string }).id
				: undefined,
		)
		.filter((id: string | undefined): id is string => Boolean(id))
		.filter(isOpenAiTextModel)
		.map((id: string) => ({ value: id, label: titleModel(id) }));

	return models.length ? uniqueSorted(models) : FALLBACK_MODELS.openai;
}

async function loadAnthropicModels(): Promise<ModelOption[]> {
	const apiKey = (
		process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
	)?.trim();
	if (!apiKey) return FALLBACK_MODELS.anthropic;

	const res = await fetch("https://api.anthropic.com/v1/models", {
		headers: {
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
		},
		cache: "no-store",
	});
	if (!res.ok) return FALLBACK_MODELS.anthropic;

	const json = await res.json();
	const list = Array.isArray(json?.data) ? json.data : [];
	const models = list
		.map((item: unknown) => {
			const record = item as Record<string, unknown>;
			const id = typeof record.id === "string" ? record.id : undefined;
			if (!id) return undefined;
			const name =
				typeof record.display_name === "string"
					? record.display_name
					: typeof record.name === "string"
						? record.name
						: titleModel(id);
			return { value: id, label: name };
		})
		.filter((model: ModelOption | undefined): model is ModelOption =>
			Boolean(model),
		);

	return models.length ? uniqueSorted(models) : FALLBACK_MODELS.anthropic;
}

async function loadGeminiModels(): Promise<ModelOption[]> {
	const apiKey = (
		process.env.GOOGLE_API_KEY ||
		process.env.GEMINI_API_KEY ||
		process.env.GOOGLE_GENAI_API_KEY
	)?.trim();
	if (!apiKey) return FALLBACK_MODELS.gemini;

	const apiVersion = (process.env.GOOGLE_GENAI_API_VERSION || "v1beta").replace(
		/^\/+/,
		"",
	);
	const res = await fetch(
		`https://generativelanguage.googleapis.com/${apiVersion}/models?key=${encodeURIComponent(apiKey)}`,
		{ cache: "no-store" },
	);
	if (!res.ok) return FALLBACK_MODELS.gemini;

	const json = await res.json();
	const list = Array.isArray(json?.models) ? json.models : [];
	const models = list
		.map((item: unknown) => {
			const record = item as Record<string, unknown>;
			const rawName = typeof record.name === "string" ? record.name : undefined;
			if (!rawName) return undefined;
			const methods = Array.isArray(record.supportedGenerationMethods)
				? record.supportedGenerationMethods
				: [];
			if (
				methods.length > 0 &&
				!methods.some(
					(method) =>
						method === "generateContent" || method === "streamGenerateContent",
				)
			) {
				return undefined;
			}
			const id = rawName.replace(/^models\//, "");
			const label =
				typeof record.displayName === "string"
					? record.displayName
					: titleModel(id);
			return { value: id, label };
		})
		.filter((model: ModelOption | undefined): model is ModelOption =>
			Boolean(model),
		);

	return models.length ? uniqueSorted(models) : FALLBACK_MODELS.gemini;
}

export async function GET(req: Request): Promise<Response> {
	const providerParam = new URL(req.url).searchParams.get("provider");
	const provider = PROVIDERS.has(providerParam ?? "")
		? (providerParam as TextProvider)
		: "openai";

	try {
		const models =
			provider === "anthropic"
				? await loadAnthropicModels()
				: provider === "gemini"
					? await loadGeminiModels()
					: await loadOpenAiModels();

		return Response.json(
			{ provider, models },
			{ headers: { "cache-control": "no-store" } },
		);
	} catch {
		return Response.json(
			{ provider, models: FALLBACK_MODELS[provider] },
			{ headers: { "cache-control": "no-store" } },
		);
	}
}
