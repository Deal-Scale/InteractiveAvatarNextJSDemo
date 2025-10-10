"use client";

import type { Agent, AgentMonetizationSummary } from "./AgentCard";

import React, { useMemo, useState } from "react";
import { z } from "zod";

import AgentPreview from "./AgentPreview";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import type { FieldsConfig } from "@/components/forms/utils";
import {
	languagesOptions,
	sttProviderOptions,
	voiceChatTransportOptions,
	voiceEmotionOptions,
	useAvatarOptionsQuery,
	useVoiceOptionsQuery,
	useMcpServerOptionsQuery,
	useKnowledgeBaseOptionsQuery,
} from "@/data/options";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const VIDEO_RESOLUTION_OPTIONS = [
	{ value: "720p", label: "720p" },
	{ value: "1080p", label: "1080p" },
];

const VIDEO_BACKGROUND_OPTIONS = [
	{ value: "transparent", label: "Transparent" },
	{ value: "blur", label: "Blur" },
	{ value: "none", label: "None" },
];

const RATE_MULTIPLIER_OPTIONS = [
	{ value: "1", label: "1x" },
	{ value: "2", label: "2x" },
	{ value: "3", label: "3x" },
	{ value: "4", label: "4x" },
	{ value: "5", label: "5x" },
];

const BOOLEAN_CHOICE_OPTIONS = [
	{ value: "true", label: "Enabled" },
	{ value: "false", label: "Disabled" },
];

type MonetizationPreset = {
	key: string;
	title: string;
	keywords: string[];
	baseRate: number;
	usagePerMonth: number;
	usageLabel: string;
};

const MONETIZATION_PRESETS: MonetizationPreset[] = [
	{
		key: "support",
		title: "Customer Support",
		keywords: ["support", "helpdesk", "success", "customer", "service"],
		baseRate: 0.35,
		usagePerMonth: 240,
		usageLabel: "support conversations",
	},
	{
		key: "sales",
		title: "Sales",
		keywords: ["sales", "closer", "account", "seller", "revenue"],
		baseRate: 1.5,
		usagePerMonth: 60,
		usageLabel: "qualified demos",
	},
	{
		key: "marketing",
		title: "Marketing",
		keywords: ["marketing", "growth", "campaign", "content", "brand"],
		baseRate: 0.25,
		usagePerMonth: 320,
		usageLabel: "campaign touchpoints",
	},
	{
		key: "education",
		title: "Education",
		keywords: ["education", "tutor", "teacher", "coach", "training"],
		baseRate: 0.8,
		usagePerMonth: 90,
		usageLabel: "student sessions",
	},
	{
		key: "operations",
		title: "Operations",
		keywords: ["ops", "operations", "internal", "automation", "hr"],
		baseRate: 0.3,
		usagePerMonth: 180,
		usageLabel: "internal requests",
	},
	{
		key: "default",
		title: "General",
		keywords: [],
		baseRate: 0.4,
		usagePerMonth: 120,
		usageLabel: "interactions",
	},
];

const DEFAULT_MONETIZATION_PRESET =
	MONETIZATION_PRESETS[MONETIZATION_PRESETS.length - 1];
const DEFAULT_CURRENCY = "USD";

type MonetizationSummaryResult = AgentMonetizationSummary & {
	typeLabel: string;
	usageDescription: string;
	baseMonthly: number;
	baseMonthlyFormatted: string;
	projectedMonthlyFormatted: string;
	baseRateFormatted: string;
	multiplierLabel: string;
};

const formatCurrency = (value: number, currency = DEFAULT_CURRENCY) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
	}).format(value);

const detectMonetizationPreset = (
	role?: string,
	tags?: string[],
): MonetizationPreset => {
	const normalizedRole = (role ?? "").toLowerCase();
	const normalizedTags = (tags ?? []).map((tag) => tag.toLowerCase());

	for (const preset of MONETIZATION_PRESETS) {
		if (preset.key === "default") continue;
		if (preset.keywords.some((keyword) => normalizedRole.includes(keyword))) {
			return preset;
		}
		if (
			preset.keywords.some((keyword) =>
				normalizedTags.some((tag) => tag.includes(keyword)),
			)
		) {
			return preset;
		}
	}

	return DEFAULT_MONETIZATION_PRESET;
};

const calculateMonetizationSummary = (options: {
	role?: string;
	tags?: string[];
	multiplier?: number;
	enabled: boolean;
	currency?: string;
}): MonetizationSummaryResult => {
	const {
		role,
		tags,
		multiplier = 1,
		enabled,
		currency = DEFAULT_CURRENCY,
	} = options;
	const preset = detectMonetizationPreset(role, tags);
	const safeMultiplier =
		Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
	const appliedMultiplier = enabled ? safeMultiplier : 1;
	const projectedMonthly = enabled
		? preset.baseRate * preset.usagePerMonth * appliedMultiplier
		: 0;
	const baseMonthly = preset.baseRate * preset.usagePerMonth;

	return {
		baseRate: preset.baseRate,
		usagePerMonth: preset.usagePerMonth,
		usageLabel: preset.usageLabel,
		multiplier: appliedMultiplier,
		projectedMonthly,
		currency,
		profileLabel: preset.title,
		typeLabel: preset.title,
		usageDescription: `${preset.usagePerMonth.toLocaleString()} ${preset.usageLabel} / mo`,
		baseMonthly,
		baseMonthlyFormatted: formatCurrency(baseMonthly, currency),
		projectedMonthlyFormatted: formatCurrency(projectedMonthly, currency),
		baseRateFormatted: formatCurrency(preset.baseRate, currency),
		multiplierLabel: `${enabled ? appliedMultiplier : 1}x`,
	};
};

const coerceOptionValue = (value: unknown): string | undefined => {
	if (value == null) return undefined;
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "object") {
		const record = value as Record<string, unknown>;
		const candidate =
			record.value ?? record.id ?? record.key ?? record.slug ?? record.name;

		if (typeof candidate === "string" || typeof candidate === "number") {
			return String(candidate);
		}
	}
	return undefined;
};

const coerceStringArray = (value: unknown): string[] => {
	if (!Array.isArray(value)) return [];

	return value
		.map((entry) => {
			if (typeof entry === "string") return entry.trim();
			if (typeof entry === "number") return String(entry);
			if (entry && typeof entry === "object") {
				const record = entry as Record<string, unknown>;
				const candidate =
					record.value ?? record.id ?? record.key ?? record.slug ?? record.name;
				if (typeof candidate === "string" || typeof candidate === "number") {
					return String(candidate);
				}
			}
			return null;
		})
		.filter((entry): entry is string => Boolean(entry && entry.trim?.()))
		.map((entry) => entry.trim());
};

export default function AgentModal(props: {
	mode: "view" | "edit" | "create";
	agent?: Agent | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (agent: Agent) => void; // used for edit and create
	onStartPreview?: (agent: Agent) => void; // optional action in view mode
	onRequestEdit?: () => void; // request parent to switch to edit mode
}) {
	const {
		mode,
		agent,
		open,
		onOpenChange,
		onSave,
		onStartPreview,
		onRequestEdit,
	} = props;

	const [draft, setDraft] = useState<Agent | null>(null);

	// initial blank for create mode
	const initialCreate: Agent = useMemo(
		() => ({
			id: "new",
			name: "",
			avatarUrl: "",
			role: "",
			description: "",
			tags: [],
		}),
		[],
	);

	const effectiveMode = mode;
	const working = useMemo<Agent | null>(() => {
		if (effectiveMode === "create") return draft ?? initialCreate;
		return (draft as Agent | null) ?? agent ?? null;
	}, [effectiveMode, draft, agent, initialCreate]);

	// Reset when dialog is opened
	React.useEffect(() => {
		if (open) setDraft(null);
	}, [open]);

	// Reset when the target agent changes
	React.useEffect(() => {
		if (agent?.id != null) setDraft(null);
	}, [agent?.id]);

	// Do not early-return before hooks; instead render conditionally below
	const hasWorking = Boolean(working);

	const isView = effectiveMode === "view";
	const isEdit = effectiveMode === "edit";
	const isCreate = effectiveMode === "create";

	const AgentFormSchema = useMemo(() => {
		const base = (AgentConfigSchema as unknown as z.ZodObject<any>).extend({
			role: z.string().optional(),
			avatarUrl: z.string().url().optional().or(z.literal("")).optional(),
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
		});

		if (!isCreate) {
			return base;
		}

		return base.extend({
			monetize: z.boolean().optional().default(false),
			rateMultiplier: z.enum(["1", "2", "3", "4", "5"]).optional(),
		});
	}, [isCreate]);

	const defaultValues = useMemo(() => {
		const source = (working as Record<string, unknown>) ?? {};
		const stt = (source?.stt as Record<string, unknown> | undefined) ?? {};
		const video = (source?.video as Record<string, unknown> | undefined) ?? {};
		const audio = (source?.audio as Record<string, unknown> | undefined) ?? {};
		const voice = (source?.voice as Record<string, unknown> | undefined) ?? {};
		const elevenlabs =
			(voice?.elevenlabs_settings as Record<string, unknown> | undefined) ?? {};

		const base: Record<string, unknown> = {
			id: (source?.id as string) ?? "new",
			name: (source?.name as string) ?? "",
			role: (source?.role as string) ?? "",
			avatarId: coerceOptionValue(source?.avatarId) ?? "",
			avatarUrl: (source?.avatarUrl as string) ?? "",
			description: (source?.description as string) ?? "",
			tags: coerceStringArray(source?.tags),
			voiceId: coerceOptionValue(source?.voiceId) ?? "",
			language: coerceOptionValue(source?.language) ?? "",
			model: (source?.model as string) ?? "",
			temperature:
				typeof source?.temperature === "number"
					? (source?.temperature as number)
					: 0.7,
			quality: coerceOptionValue(source?.quality),
			voiceChatTransport: coerceOptionValue(source?.voiceChatTransport),
			stt: {
				provider: coerceOptionValue(stt?.provider),
				confidenceThreshold:
					typeof stt?.confidenceThreshold === "number"
						? (stt?.confidenceThreshold as number)
						: 0.6,
			},
			disableIdleTimeout:
				typeof source?.disableIdleTimeout === "boolean"
					? (source?.disableIdleTimeout as boolean)
					: false,
			activityIdleTimeout:
				typeof source?.activityIdleTimeout === "number"
					? (source?.activityIdleTimeout as number)
					: 120,
			video: {
				resolution: coerceOptionValue(video?.resolution),
				background: coerceOptionValue(video?.background),
				fps: typeof video?.fps === "number" ? (video?.fps as number) : 30,
			},
			audio: {
				sampleRate:
					typeof audio?.sampleRate === "number"
						? (audio?.sampleRate as number)
						: 16000,
				noiseSuppression:
					typeof audio?.noiseSuppression === "boolean"
						? (audio?.noiseSuppression as boolean)
						: false,
				echoCancellation:
					typeof audio?.echoCancellation === "boolean"
						? (audio?.echoCancellation as boolean)
						: false,
			},
			voice: {
				rate: typeof voice?.rate === "number" ? (voice?.rate as number) : 1,
				emotion: coerceOptionValue(voice?.emotion),
				elevenlabs_settings: {
					stability:
						typeof elevenlabs?.stability === "number"
							? (elevenlabs?.stability as number)
							: 0.5,
					similarity_boost:
						typeof elevenlabs?.similarity_boost === "number"
							? (elevenlabs?.similarity_boost as number)
							: 0.5,
					style:
						typeof elevenlabs?.style === "number"
							? (elevenlabs?.style as number)
							: 0,
					model_id: coerceOptionValue(elevenlabs?.model_id) ?? "",
					use_speaker_boost:
						typeof elevenlabs?.use_speaker_boost === "boolean"
							? (elevenlabs?.use_speaker_boost as boolean)
							: false,
				},
			},
			knowledgeBaseId: coerceOptionValue(source?.knowledgeBaseId) ?? "",
			mcpServers: coerceStringArray(source?.mcpServers),
			systemPrompt: (source?.systemPrompt as string) ?? "",
		};

		if (isCreate) {
			base.monetize = false;
			base.rateMultiplier = "1";
		}

		return base;
	}, [working, isCreate]);

	const form = useZodForm(AgentFormSchema as unknown as z.ZodTypeAny, {
		defaultValues: defaultValues as any,
	});

	React.useEffect(() => {
		form.reset(defaultValues as any);
	}, [defaultValues, form]);

	const { data: avatarOptions = [] } = useAvatarOptionsQuery();
	const { data: voiceOptions = [] } = useVoiceOptionsQuery();
	const { data: mcpServerOptions = [] } = useMcpServerOptionsQuery();
	const { data: knowledgeBaseOptions = [] } = useKnowledgeBaseOptionsQuery();

	const monetizeWatch = isCreate ? form.watch("monetize" as any) : false;
	const monetizationEnabled = isCreate ? Boolean(monetizeWatch) : false;
	const roleWatch = form.watch("role" as any) as string | undefined;
	const tagsWatchRaw = form.watch("tags" as any);
	const rateMultiplierWatch = form.watch("rateMultiplier" as any) as
		| string
		| undefined;

	const normalizedTags = React.useMemo(() => {
		if (Array.isArray(tagsWatchRaw)) {
			return tagsWatchRaw
				.map((tag) =>
					(typeof tag === "string" ? tag : String(tag ?? "")).trim(),
				)
				.filter(Boolean);
		}
		if (typeof tagsWatchRaw === "string") {
			return tagsWatchRaw
				.split(/,|\n/)
				.map((tag) => tag.trim())
				.filter(Boolean);
		}
		return [];
	}, [tagsWatchRaw]);

	const monetizationSummary = React.useMemo(() => {
		const multiplierNumber = Number(rateMultiplierWatch ?? "1");
		const safeMultiplier = Number.isFinite(multiplierNumber)
			? multiplierNumber
			: 1;

		return calculateMonetizationSummary({
			role: roleWatch,
			tags: normalizedTags,
			multiplier: safeMultiplier,
			enabled: monetizationEnabled,
		});
	}, [roleWatch, normalizedTags, rateMultiplierWatch, monetizationEnabled]);

	React.useEffect(() => {
		if (!isCreate) return;
		if (!monetizationEnabled) {
			try {
				form.setValue("rateMultiplier" as any, "1", {
					shouldDirty: false,
					shouldValidate: false,
					shouldTouch: false,
				});
			} catch {}
		}
	}, [form, monetizationEnabled, isCreate]);

	React.useEffect(() => {
		if (!isCreate) return;
		if (monetizationEnabled && !rateMultiplierWatch) {
			try {
				form.setValue("rateMultiplier" as any, "1", {
					shouldDirty: false,
					shouldValidate: false,
				});
			} catch {}
		}
	}, [form, monetizationEnabled, rateMultiplierWatch, isCreate]);

	const fields = useMemo(() => {
		const base: FieldsConfig<Record<string, unknown>> & Record<string, any> = {
			id: {
				label: "Agent ID",
				placeholder: isCreate ? "Generated automatically" : undefined,
			},
			name: { label: "Agent Name", placeholder: "Acme Support" },
			role: { label: "Role", placeholder: "Support" },
			avatarUrl: {
				label: "Avatar Preview URL",
				placeholder: "https://cdn.example.com/avatar.png",
			},
			avatarId: {
				label: "HeyGen Avatar",
				widget: "select",
				options: avatarOptions,
			},
			voiceId: {
				label: "Default Voice",
				widget: "select",
				options: voiceOptions,
			},
			language: {
				label: "Language",
				widget: "select",
				options: languagesOptions,
			},
			model: {
				label: "Model",
				placeholder: "gpt-4o-mini",
			},
			description: {
				label: "Description",
				widget: "textarea",
				rows: 4,
				placeholder: "Short summary that appears in the sidebar",
			},
			tags: {
				label: "Tags",
				placeholder: "Enter tags, one per line",
			},
			temperature: {
				label: "Temperature",
				widget: "slider",
				min: 0,
				max: 2,
				step: 0.1,
			},
			quality: { label: "Avatar Quality" },
			voiceChatTransport: {
				label: "Voice Chat Transport",
				widget: "select",
				options: voiceChatTransportOptions,
			},
			"stt.provider": {
				label: "STT Provider",
				widget: "select",
				options: sttProviderOptions,
			},
			"stt.confidenceThreshold": {
				label: "STT Confidence Threshold",
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
			},
			disableIdleTimeout: {
				label: "Disable Idle Timeout",
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
			},
			activityIdleTimeout: {
				label: "Idle Timeout (sec)",
				widget: "slider",
				min: 30,
				max: 3600,
				step: 30,
			},
			"video.resolution": {
				label: "Video Resolution",
				widget: "select",
				options: VIDEO_RESOLUTION_OPTIONS,
			},
			"video.background": {
				label: "Video Background",
				widget: "select",
				options: VIDEO_BACKGROUND_OPTIONS,
			},
			"video.fps": {
				label: "Video FPS",
				widget: "slider",
				min: 15,
				max: 60,
				step: 1,
			},
			"audio.sampleRate": {
				label: "Audio Sample Rate (Hz)",
				widget: "slider",
				min: 16000,
				max: 48000,
				step: 1000,
			},
			"audio.noiseSuppression": {
				label: "Noise Suppression",
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
			},
			"audio.echoCancellation": {
				label: "Echo Cancellation",
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
			},
			"voice.rate": {
				label: "Voice Rate",
				widget: "slider",
				min: 0.5,
				max: 2,
				step: 0.05,
			},
			"voice.emotion": {
				label: "Voice Emotion",
				widget: "select",
				options: voiceEmotionOptions,
			},
			"voice.elevenlabs_settings.stability": {
				label: "ElevenLabs Stability",
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
			},
			"voice.elevenlabs_settings.similarity_boost": {
				label: "ElevenLabs Similarity Boost",
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
			},
			"voice.elevenlabs_settings.style": {
				label: "ElevenLabs Style",
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
			},
			"voice.elevenlabs_settings.model_id": {
				label: "ElevenLabs Model ID",
				placeholder: "eleven_monolingual_v1",
			},
			"voice.elevenlabs_settings.use_speaker_boost": {
				label: "ElevenLabs Speaker Boost",
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
			},
			knowledgeBaseId: {
				label: "Knowledge Base",
				widget: "select",
				options: knowledgeBaseOptions,
			},
			mcpServers: {
				label: "MCP Servers",
				widget: "select",
				options: mcpServerOptions,
				multiple: true,
			},
			systemPrompt: {
				label: "System Prompt / KB Text",
				widget: "textarea",
				rows: 6,
				placeholder:
					"Describe your agent's behavior or paste knowledge base text...",
			},
		};

		if (isCreate) {
			base.monetize = { label: "Enable Monetization", widget: "switch" };
			base.rateMultiplier = {
				label: "Rate Multiplier",
				widget: "select",
				options: RATE_MULTIPLIER_OPTIONS,
				placeholder: monetizationEnabled
					? undefined
					: "Enable monetization first",
				disabled: !monetizationEnabled,
			};
		}

		return base;
	}, [
		avatarOptions,
		voiceOptions,
		knowledgeBaseOptions,
		mcpServerOptions,
		monetizationEnabled,
		isCreate,
	]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[96vw] md:w-[640px] max-w-[96vw] p-4 md:p-6 bg-card text-foreground flex flex-col max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>
						{isCreate && <span className="font-semibold">Create Agent</span>}
						{isEdit && (
							<span className="font-semibold">{`Edit Agent: ${working?.name || "Untitled"}`}</span>
						)}
						{isView && (
							<span className="font-semibold">{working?.name || "Agent"}</span>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					{isView ? (
						<div className="space-y-4">
							{hasWorking && <AgentPreview agent={working as Agent} />}
							<div className="flex justify-end gap-2">
								{(agent?.isOwnedByUser ?? false) && (
									<Button
										type="button"
										variant="outline"
										onClick={() => onRequestEdit?.()}
									>
										Edit
									</Button>
								)}
								<Button
									type="button"
									variant="ghost"
									onClick={() => onOpenChange(false)}
								>
									Close
								</Button>
								<Button
									type="button"
									variant="default"
									onClick={() => onStartPreview?.(working as Agent)}
								>
									Start / Preview
								</Button>
							</div>
						</div>
					) : (
						<>
							{isCreate && (
								<div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
									<span className="font-medium">Monetization</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs cursor-help"
												aria-label="Monetization info"
											>
												?
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												To monetize your agent, multiply the base rate (
												{monetizationSummary.baseRateFormatted}
												per interaction) by the expected usage for their role.
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							{isCreate && (
								<div className="mb-4 space-y-2 rounded-md border border-border/60 bg-muted/10 p-3 text-sm">
									<div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
										<span>Monetization preview</span>
										<span className="font-semibold text-foreground">
											{monetizationSummary.typeLabel}
										</span>
									</div>
									<div className="mt-2 grid gap-2 text-xs sm:grid-cols-2 sm:text-sm">
										<div className="flex items-center justify-between gap-2">
											<span className="text-muted-foreground">Base rate</span>
											<span className="font-medium text-foreground">
												{monetizationSummary.baseRateFormatted} per interaction
											</span>
										</div>
										<div className="flex items-center justify-between gap-2">
											<span className="text-muted-foreground">Avg usage</span>
											<span className="font-medium text-foreground">
												{monetizationSummary.usageDescription}
											</span>
										</div>
										<div className="flex items-center justify-between gap-2 sm:col-span-2">
											<span className="text-muted-foreground">
												Base monthly
											</span>
											<span className="font-medium text-foreground">
												{monetizationSummary.baseMonthlyFormatted}
											</span>
										</div>
									</div>
									<div className="rounded-md bg-background/80 p-2 text-xs sm:text-sm">
										{monetizationEnabled ? (
											<>
												<div className="flex items-center justify-between font-medium text-foreground">
													<span>Projected monthly</span>
													<span>
														{monetizationSummary.projectedMonthlyFormatted}
													</span>
												</div>
												<p className="mt-1 text-muted-foreground">
													{`${monetizationSummary.baseRateFormatted} × ${monetizationSummary.multiplierLabel} × ${monetizationSummary.usageDescription}`}
												</p>
											</>
										) : (
											<p className="text-muted-foreground">
												Enable monetization to project earnings using the base
												rate of {monetizationSummary.baseRateFormatted}.
											</p>
										)}
									</div>
								</div>
							)}
							<AutoForm
								className="space-y-4"
								schema={AgentFormSchema as unknown as z.ZodObject<any>}
								form={form as any}
								fields={fields as FieldsConfig<any>}
								submitLabel={isCreate ? "Create" : "Save"}
								onSubmit={(values: z.infer<typeof AgentFormSchema>) => {
									const rawId = (values as any)?.id;
									const id =
										rawId && String(rawId).trim().length > 0
											? String(rawId).trim()
											: (working?.id ?? `new-${Date.now()}`);
									const name = String(values.name ?? "").trim();
									const role = values.role ? String(values.role).trim() : "";
									const avatarUrl =
										values.avatarUrl != null
											? String(values.avatarUrl).trim()
											: "";
									const description =
										values.description != null
											? String(values.description).trim()
											: "";
									const tags: string[] = Array.isArray(values.tags)
										? (values.tags as string[])
												.map((tag) => String(tag).trim())
												.filter(Boolean)
										: typeof (values as any).tags === "string"
											? ((values as any).tags as string)
													.split(/,|\n/)
													.map((s: string) => s.trim())
													.filter(Boolean)
											: [];

									let monetizationData: AgentMonetizationSummary | undefined;
									let monetized = false;

									if (isCreate) {
										const monetizeFlag = Boolean((values as any).monetize);
										const rawMultiplier = (values as any).rateMultiplier;
										const multiplierNumber = Number(rawMultiplier ?? "1");
										const summaryForPayload = calculateMonetizationSummary({
											role,
											tags,
											multiplier: Number.isFinite(multiplierNumber)
												? multiplierNumber
												: 1,
											enabled: monetizeFlag,
										});
										const {
											typeLabel: _typeLabel,
											usageDescription: _usageDescription,
											baseMonthly: _baseMonthly,
											baseMonthlyFormatted: _baseMonthlyFormatted,
											projectedMonthlyFormatted: _projectedMonthlyFormatted,
											baseRateFormatted: _baseRateFormatted,
											multiplierLabel: _multiplierLabel,
											...monetizationSummaryPayload
										} = summaryForPayload;

										if (monetizeFlag) {
											monetized = true;
											monetizationData = monetizationSummaryPayload;
										}
									}

									const next: Agent = {
										id,
										name,
										role,
										avatarUrl,
										description,
										tags,
										isOwnedByUser: isCreate ? true : working?.isOwnedByUser,
									};
									if (isCreate) {
										next.monetize = monetized;
										next.rateMultiplier = monetizationData?.multiplier ?? 1;
										next.monetizationSummary = monetizationData;
									}
									onSave?.(next);
									onOpenChange(false);
								}}
							/>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
