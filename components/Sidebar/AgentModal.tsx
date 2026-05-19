"use client";

import { AvatarQuality } from "@heygen/streaming-avatar";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { AutoForm } from "@/components/forms/AutoForm";
import { useZodForm } from "@/components/forms/useZodForm";
import type { FieldsConfig } from "@/components/forms/utils";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	languagesOptions,
	sttProviderOptions,
	type TextModelProvider,
	useAvatarOptionsQuery,
	useKnowledgeBaseOptionsQuery,
	useMcpServerOptionsQuery,
	useTextModelOptionsQuery,
	useVoiceOptionsQuery,
	type VoiceOptionProvider,
	voiceChatTransportOptions,
	voiceEmotionOptions,
} from "@/data/options";
import { getAgentUsageProfile } from "@/lib/agents/monetization";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import type { Agent } from "./AgentCard";
import { AgentMonetizationSummary } from "./AgentMonetizationSummary";
import AgentPreview from "./AgentPreview";

const VIDEO_RESOLUTION_OPTIONS = [
	{ value: "720p", label: "720p" },
	{ value: "1080p", label: "1080p" },
];

const VIDEO_BACKGROUND_OPTIONS = [
	{ value: "transparent", label: "Transparent" },
	{ value: "blur", label: "Blur" },
	{ value: "none", label: "None" },
];

const AVATAR_QUALITY_OPTIONS = [
	{ value: AvatarQuality.Low, label: "Low" },
	{ value: AvatarQuality.Medium, label: "Medium" },
	{ value: AvatarQuality.High, label: "High" },
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

const TRUE_FALSE_OPTIONS = [
	{ value: "true", label: "True" },
	{ value: "false", label: "False" },
];

const INTERACTION_MODE_OPTIONS = [
	{ value: "text", label: "Text chat" },
	{ value: "voice", label: "Voice chat" },
	{ value: "video", label: "Video chat" },
];

const TEXT_PROVIDER_OPTIONS = [
	{ value: "openai", label: "OpenAI" },
	{ value: "anthropic", label: "Anthropic" },
	{ value: "gemini", label: "Gemini" },
];

const SHARED_VOICE_PROVIDER_OPTIONS = [
	{ value: "elevenlabs", label: "ElevenLabs" },
	{ value: "openai", label: "OpenAI" },
	{ value: "gemini", label: "Gemini" },
];

const getVoiceProviderOptions = ({ isVideo = false } = {}) =>
	isVideo
		? [
				{ value: "liveavatar", label: "LiveAvatar" },
				...SHARED_VOICE_PROVIDER_OPTIONS,
			]
		: SHARED_VOICE_PROVIDER_OPTIONS;

const ROLE_OPTIONS = [
	{ value: "Support", label: "Support" },
	{ value: "Sales", label: "Sales" },
	{ value: "Marketing", label: "Marketing" },
	{ value: "Operations", label: "Operations" },
	{ value: "Research", label: "Research" },
	{ value: "Education", label: "Education" },
	{ value: "Concierge", label: "Concierge" },
	{ value: "Assistant", label: "Assistant" },
];

type InteractionMode = "text" | "voice" | "video";

const DEFAULT_INTERACTION_MODES: InteractionMode[] = ["text", "voice"];

const deriveSessionType = (
	modes: InteractionMode[] | string[] | undefined,
): "text" | "voice" | "video" | "all" => {
	const set = new Set(modes ?? []);
	if (set.has("text") && set.has("voice") && set.has("video")) return "all";
	if (set.has("video")) return "video";
	if (set.has("voice")) return "voice";
	return "text";
};

const modesFromSessionType = (sessionType: unknown): InteractionMode[] => {
	if (sessionType === "text") return ["text"];
	if (sessionType === "voice") return ["text", "voice"];
	if (sessionType === "video") return ["text", "video"];
	return ["text", "voice", "video"];
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
			sessionType: "voice",
			interactionModes: ["text", "voice"],
			textProvider: "openai",
			model: "gpt-4o-mini",
			voiceProvider: "gemini",
			videoVoiceProvider: "liveavatar",
			modalities: ["chat", "voice"],
		}),
		[],
	);

	const effectiveMode = mode;
	const working = useMemo<Agent | null>(() => {
		if (effectiveMode === "create") return draft ?? initialCreate;
		return (draft as Agent | null) ?? agent ?? null;
	}, [effectiveMode, draft, agent, initialCreate]);

	// Reset when dialog is opened
	useEffect(() => {
		if (open) setDraft(null);
	}, [open]);

	// Reset when the target agent changes
	useEffect(() => {
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

		const withRequiredModeFields = base.superRefine((values, ctx) => {
			const modes = Array.isArray(values.interactionModes)
				? values.interactionModes
				: [];

			if (modes.length === 0) {
				ctx.addIssue({
					code: "custom",
					path: ["interactionModes"],
					message: "Select at least one chat type",
				});
			}

			if (modes.includes("video")) {
				if (!values.avatarId) {
					ctx.addIssue({
						code: "custom",
						path: ["avatarId"],
						message: "Avatar is required for video chat",
					});
				}

				if (!values.knowledgeBaseId) {
					ctx.addIssue({
						code: "custom",
						path: ["knowledgeBaseId"],
						message: "Knowledge Base / Context is required for video chat",
					});
				}
			}
		});

		if (!isCreate) {
			return withRequiredModeFields;
		}

		return withRequiredModeFields.extend({
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
		const videoVoice =
			(source?.videoVoice as Record<string, unknown> | undefined) ?? {};
		const elevenlabs =
			(voice?.elevenlabs_settings as Record<string, unknown> | undefined) ?? {};
		const videoElevenlabs =
			(videoVoice?.elevenlabs_settings as
				| Record<string, unknown>
				| undefined) ?? {};
		const interactionModes = Array.isArray(source?.interactionModes)
			? (source.interactionModes as Array<"text" | "voice" | "video">)
			: modesFromSessionType(source?.sessionType);

		const base: Record<string, unknown> = {
			id: (source?.id as string) ?? "new",
			name: (source?.name as string) ?? "",
			role: (source?.role as string) ?? "",
			avatarId: (source?.avatarId as string) ?? "",
			sessionType: deriveSessionType(interactionModes),
			interactionModes,
			avatarUrl: (source?.avatarUrl as string) ?? "",
			description: (source?.description as string) ?? "",
			tags: Array.isArray(source?.tags) ? (source?.tags as string[]) : [],
			voiceId: (source?.voiceId as string) ?? "",
			videoVoiceId:
				(source?.videoVoiceId as string) ?? (source?.voiceId as string) ?? "",
			textProvider: (source?.textProvider as string) ?? "openai",
			voiceProvider: (source?.voiceProvider as string) ?? "gemini",
			videoVoiceProvider:
				(source?.videoVoiceProvider as string) ??
				(source?.voiceProvider as string) ??
				"liveavatar",
			language: (source?.language as string) ?? "",
			model: (source?.model as string) ?? "gpt-4o-mini",
			temperature:
				typeof source?.temperature === "number"
					? (source?.temperature as number)
					: 1,
			maxOutputTokens:
				typeof source?.maxOutputTokens === "number"
					? (source?.maxOutputTokens as number)
					: 2048,
			topP: typeof source?.topP === "number" ? (source?.topP as number) : 1,
			frequencyPenalty:
				typeof source?.frequencyPenalty === "number"
					? (source?.frequencyPenalty as number)
					: 0,
			presencePenalty:
				typeof source?.presencePenalty === "number"
					? (source?.presencePenalty as number)
					: 0,
			quality: source?.quality ?? undefined,
			voiceChatTransport: source?.voiceChatTransport ?? undefined,
			stt: {
				provider: stt?.provider ?? undefined,
				confidenceThreshold:
					typeof stt?.confidenceThreshold === "number"
						? (stt?.confidenceThreshold as number)
						: 0.5,
			},
			disableIdleTimeout:
				typeof source?.disableIdleTimeout === "boolean"
					? (source?.disableIdleTimeout as boolean)
					: false,
			activityIdleTimeout:
				typeof source?.activityIdleTimeout === "number"
					? (source?.activityIdleTimeout as number)
					: 1820,
			video: {
				resolution: video?.resolution ?? undefined,
				background: video?.background ?? undefined,
				fps: typeof video?.fps === "number" ? (video?.fps as number) : 38,
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
				emotion: voice?.emotion ?? undefined,
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
					model_id: (elevenlabs?.model_id as string) ?? "",
					use_speaker_boost:
						typeof elevenlabs?.use_speaker_boost === "boolean"
							? (elevenlabs?.use_speaker_boost as boolean)
							: false,
				},
			},
			videoVoice: {
				rate:
					typeof videoVoice?.rate === "number"
						? (videoVoice?.rate as number)
						: typeof voice?.rate === "number"
							? (voice?.rate as number)
							: 1,
				emotion: videoVoice?.emotion ?? voice?.emotion ?? undefined,
				elevenlabs_settings: {
					stability:
						typeof videoElevenlabs?.stability === "number"
							? (videoElevenlabs?.stability as number)
							: typeof elevenlabs?.stability === "number"
								? (elevenlabs?.stability as number)
								: 0.5,
					similarity_boost:
						typeof videoElevenlabs?.similarity_boost === "number"
							? (videoElevenlabs?.similarity_boost as number)
							: typeof elevenlabs?.similarity_boost === "number"
								? (elevenlabs?.similarity_boost as number)
								: 0.5,
					style:
						typeof videoElevenlabs?.style === "number"
							? (videoElevenlabs?.style as number)
							: typeof elevenlabs?.style === "number"
								? (elevenlabs?.style as number)
								: 0,
					model_id:
						(videoElevenlabs?.model_id as string) ??
						(elevenlabs?.model_id as string) ??
						"",
					use_speaker_boost:
						typeof videoElevenlabs?.use_speaker_boost === "boolean"
							? (videoElevenlabs?.use_speaker_boost as boolean)
							: typeof elevenlabs?.use_speaker_boost === "boolean"
								? (elevenlabs?.use_speaker_boost as boolean)
								: false,
				},
			},
			knowledgeBaseId: (source?.knowledgeBaseId as string) ?? "",
			contextFiles: source?.contextFiles ?? undefined,
			canBrowseWeb:
				typeof source?.canBrowseWeb === "boolean"
					? (source?.canBrowseWeb as boolean)
					: false,
			canRunCode:
				typeof source?.canRunCode === "boolean"
					? (source?.canRunCode as boolean)
					: false,
			canGenerateImages:
				typeof source?.canGenerateImages === "boolean"
					? (source?.canGenerateImages as boolean)
					: false,
			mcpServers: Array.isArray(source?.mcpServers)
				? (source?.mcpServers as string[])
				: [],
			systemPrompt: (source?.systemPrompt as string) ?? "",
		};

		if (isCreate) {
			base.monetize = false;
			base.rateMultiplier = "1";
		}

		return base;
	}, [working, isCreate]);

	const form = useZodForm(AgentFormSchema, {
		defaultValues: defaultValues as any,
	});

	useEffect(() => {
		form.reset(defaultValues as any);
	}, [defaultValues, form]);

	const { data: avatarOptions = [], isFetching: isLoadingAvatars } =
		useAvatarOptionsQuery();
	const { data: mcpServerOptions = [] } = useMcpServerOptionsQuery();
	const {
		data: knowledgeBaseOptions = [],
		isFetching: isLoadingKnowledgeBases,
	} = useKnowledgeBaseOptionsQuery();
	const interactionModesValue = Array.isArray(
		form.watch("interactionModes" as any),
	)
		? (form.watch("interactionModes" as any) as InteractionMode[])
		: DEFAULT_INTERACTION_MODES;
	const textProviderValue = (form.watch("textProvider" as any) ||
		"openai") as TextModelProvider;
	const modelValue = form.watch("model" as any) as string | undefined;
	const voiceProviderValue = (form.watch("voiceProvider" as any) ||
		"gemini") as VoiceOptionProvider;
	const videoVoiceProviderValue = (form.watch("videoVoiceProvider" as any) ||
		"liveavatar") as VoiceOptionProvider;
	const { data: textModelOptions = [], isFetching: isLoadingTextModels } =
		useTextModelOptionsQuery(textProviderValue);
	const { data: voiceOptions = [], isFetching: isLoadingVoices } =
		useVoiceOptionsQuery(voiceProviderValue);
	const { data: videoVoiceOptions = [], isFetching: isLoadingVideoVoices } =
		useVoiceOptionsQuery(videoVoiceProviderValue);

	useEffect(() => {
		if (!textModelOptions.length) return;
		if (!textModelOptions.some((option) => option.value === modelValue)) {
			form.setValue("model" as any, textModelOptions[0]?.value as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [form, modelValue, textModelOptions]);

	useEffect(() => {
		const hasVoice = interactionModesValue.includes("voice");
		const hasVideo = interactionModesValue.includes("video");
		if (hasVoice && !hasVideo && voiceProviderValue === "liveavatar") {
			form.setValue("voiceProvider" as any, "gemini" as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
			form.setValue("voiceId" as any, "" as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [form, interactionModesValue, voiceProviderValue]);

	useEffect(() => {
		const selectedVoiceId = form.getValues("voiceId" as any) as
			| string
			| undefined;
		if (
			selectedVoiceId &&
			voiceOptions.length > 0 &&
			!voiceOptions.some((option) => option.value === selectedVoiceId)
		) {
			form.setValue("voiceId" as any, "" as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [form, voiceOptions]);

	useEffect(() => {
		const selectedVideoVoiceId = form.getValues("videoVoiceId" as any) as
			| string
			| undefined;
		if (
			selectedVideoVoiceId &&
			videoVoiceOptions.length > 0 &&
			!videoVoiceOptions.some((option) => option.value === selectedVideoVoiceId)
		) {
			form.setValue("videoVoiceId" as any, "" as any, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [form, videoVoiceOptions]);

	const monetizationEnabled = isCreate
		? Boolean(form.watch("monetize" as any))
		: false;
	const roleValue = isCreate
		? (form.watch("role" as any) as string | undefined)
		: undefined;
	const multiplierValueRaw = isCreate
		? form.watch("rateMultiplier" as any)
		: undefined;
	const multiplierValue = Number(multiplierValueRaw ?? 1) || 1;
	const usageProfile = useMemo(
		() => getAgentUsageProfile(roleValue),
		[roleValue],
	);
	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: usageProfile.currency,
				maximumFractionDigits: 2,
			}),
		[usageProfile.currency],
	);

	const fields = useMemo(() => {
		const supportsVoice = interactionModesValue.includes("voice");
		const supportsVideo = interactionModesValue.includes("video");
		const supportsText = interactionModesValue.includes("text");
		const voiceUsesLiveAvatar = voiceProviderValue === "liveavatar";
		const voiceUsesElevenLabs = voiceProviderValue === "elevenlabs";
		const videoVoiceUsesLiveAvatar = videoVoiceProviderValue === "liveavatar";
		const videoVoiceUsesElevenLabs = videoVoiceProviderValue === "elevenlabs";
		const showLiveAvatarVoiceChatSettings =
			(supportsVoice && voiceUsesLiveAvatar) ||
			(supportsVideo && videoVoiceUsesLiveAvatar);
		const advancedVoice = {
			label: "Advanced Voice",
			resetLabel: "Reset to defaults",
		};
		const advancedVideoVoice = {
			label: "Advanced Video Voice",
			resetLabel: "Reset to defaults",
		};
		const advancedVideoSession = {
			label: "Advanced Video Session",
			resetLabel: "Reset to defaults",
		};
		const advancedSpeech = {
			label: "Advanced Speech",
			resetLabel: "Reset to defaults",
		};
		const advancedAudio = {
			label: "Advanced Audio",
			resetLabel: "Reset to defaults",
		};
		const promptSectionTone = supportsVideo
			? "video"
			: supportsVoice
				? "voice"
				: "text";
		const promptSection = {
			label: "Context",
			tone: promptSectionTone as "text" | "voice" | "video",
			description: "Fetched context and system prompt for this agent.",
		};
		const profileSection = {
			label: "Profile",
			tone: "general" as const,
			description: "Identity and supported interaction modes.",
		};
		const videoSection = {
			label: "Video",
			tone: "video" as const,
			description: "Minimal LiveAvatar setup for video sessions.",
		};
		const voiceSection = {
			label: "Voice",
			tone: "voice" as const,
			description: "Voice chat transport and speech settings.",
		};
		const sessionControlSection = supportsVideo ? videoSection : voiceSection;
		const toolsSection = {
			label: "Tools",
			tone: "tools" as const,
			description: "MCP servers and uploaded server config.",
		};
		const monetizationSection = {
			label: "Monetization",
			tone: "general" as const,
			description: "Pricing and payout settings for this agent.",
		};
		const base: FieldsConfig<Record<string, unknown>> & Record<string, any> = {
			id: {
				label: "Agent ID",
				placeholder: isCreate ? "Generated automatically" : undefined,
				hidden: isCreate,
			},
			name: {
				label: "Agent Name",
				section: profileSection,
				required: true,
				placeholder: "Acme Support",
			},
			interactionModes: {
				label: "Chat Type",
				section: profileSection,
				required: true,
				widget: "mode-buttons",
				options: INTERACTION_MODE_OPTIONS,
				helpText:
					"Select one or more interaction modes. MCP servers stay available for every mode.",
			},
			sessionType: {
				hidden: true,
			},
			role: {
				label: "Role",
				section: profileSection,
				widget: "select",
				options: ROLE_OPTIONS,
				placeholder: "Select role",
			},
			description: {
				label: "Description",
				section: profileSection,
				widget: "textarea",
				rows: 4,
				placeholder: "Short summary that appears in the sidebar",
			},
			avatarUrl: {
				label: "Agent Avatar",
				section: profileSection,
				widget: "avatar-url",
				placeholder: "https://cdn.example.com/avatar.png",
			},
			tags: {
				label: "Tags",
				section: profileSection,
				widget: "tags",
				placeholder: "lead-gen, support, demo",
			},
			textProvider: {
				label: "Provider",
				section: promptSection,
				widget: "select",
				options: TEXT_PROVIDER_OPTIONS,
				hidden: !supportsText,
				helpText: "Models are fetched from the selected provider API key.",
			},
			model: {
				label: "Model",
				section: promptSection,
				widget: "select",
				options: textModelOptions,
				placeholder: isLoadingTextModels ? "Loading models..." : "Select model",
				hidden: !supportsText,
			},
			temperature: {
				label: "Temperature",
				section: promptSection,
				advanced: {
					label: "Advanced Generation",
					resetLabel: "Reset to defaults",
				},
				defaultValue: 1,
				widget: "slider",
				min: 0,
				max: 2,
				step: 0.1,
				hidden: !supportsText,
			},
			maxOutputTokens: {
				label: "Max Output Tokens",
				section: promptSection,
				advanced: {
					label: "Advanced Generation",
					resetLabel: "Reset to defaults",
				},
				defaultValue: 2048,
				widget: "slider",
				min: 256,
				max: 8192,
				step: 256,
				hidden: !supportsText,
			},
			topP: {
				label: "Top P",
				section: promptSection,
				advanced: {
					label: "Advanced Generation",
					resetLabel: "Reset to defaults",
				},
				defaultValue: 1,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsText,
			},
			frequencyPenalty: {
				label: "Frequency Penalty",
				section: promptSection,
				advanced: {
					label: "Advanced Generation",
					resetLabel: "Reset to defaults",
				},
				defaultValue: 0,
				widget: "slider",
				min: -2,
				max: 2,
				step: 0.1,
				hidden: !supportsText,
			},
			presencePenalty: {
				label: "Presence Penalty",
				section: promptSection,
				advanced: {
					label: "Advanced Generation",
					resetLabel: "Reset to defaults",
				},
				defaultValue: 0,
				widget: "slider",
				min: -2,
				max: 2,
				step: 0.1,
				hidden: !supportsText,
			},
			knowledgeBaseId: {
				label: supportsVideo ? "Knowledge Base / Context" : "Knowledge Base",
				section: promptSection,
				required: supportsVideo,
				widget: "select",
				options: knowledgeBaseOptions,
				placeholder: isLoadingKnowledgeBases
					? "Loading knowledge bases..."
					: supportsVideo
						? "Select a context"
						: "Select knowledge base",
				helpText: supportsVideo
					? "Required for LiveAvatar video sessions."
					: "Use a fetched context for text, voice, or video agents.",
			},
			contextFiles: {
				label: "Context Files",
				section: promptSection,
				accept:
					".md,.markdown,.txt,.csv,.json,.jsonl,.xml,.yaml,.yml,.tsv,application/json,text/plain,text/markdown,text/csv",
				helpText:
					"Upload markdown, text, CSV, JSON, JSONL, XML, YAML, or TSV files to attach context.",
			},
			canBrowseWeb: {
				label: "Browse Web",
				section: promptSection,
				widget: "switch",
				helpText: "Allow this agent to use web browsing tools when available.",
			},
			canRunCode: {
				label: "Run Code",
				section: promptSection,
				widget: "switch",
				helpText:
					"Allow this agent to use code execution tools when available.",
			},
			canGenerateImages: {
				label: "Generate Images",
				section: promptSection,
				widget: "switch",
				helpText:
					"Allow this agent to use image generation tools when available.",
			},
			mcpServers: {
				label: "MCP Servers",
				section: toolsSection,
				widget: "mcp-badges",
				options: mcpServerOptions,
				helpText:
					"Select MCP servers for this agent or upload a JSON config with an mcpServers object.",
			},
			systemPrompt: {
				label: "System Prompt / KB Text",
				section: promptSection,
				widget: "textarea",
				rows: 6,
				placeholder:
					"Describe your agent's behavior or paste knowledge base text...",
			},
			avatarId: {
				label: "Avatar",
				section: videoSection,
				required: supportsVideo,
				widget: "select",
				options: avatarOptions,
				placeholder: isLoadingAvatars ? "Loading avatars..." : "Select avatar",
				hidden: !supportsVideo,
				helpText: "Required for LiveAvatar video sessions.",
			},
			quality: {
				label: "Avatar Quality",
				section: videoSection,
				widget: "select",
				options: AVATAR_QUALITY_OPTIONS,
				placeholder: "Select quality",
				hidden: !supportsVideo,
			},
			videoVoiceProvider: {
				label: "Voice Provider",
				section: videoSection,
				widget: "select",
				options: getVoiceProviderOptions({ isVideo: true }),
				hidden: !supportsVideo,
			},
			videoVoiceId: {
				label: "Voice",
				section: videoSection,
				widget: "voice-select",
				options: videoVoiceOptions,
				placeholder: isLoadingVideoVoices
					? "Loading voices..."
					: "Use avatar default voice",
				hidden: !supportsVideo,
				helpText: "Optional for LiveAvatar video sessions.",
			},
			videoVoice: {
				label: "Voice Settings",
				section: videoSection,
				hidden: !supportsVideo,
			},
			"videoVoice.rate": {
				label: "Voice Rate",
				section: videoSection,
				advanced: advancedVideoVoice,
				defaultValue: 1,
				widget: "slider",
				min: 0.5,
				max: 2,
				step: 0.05,
				hidden: !supportsVideo || !videoVoiceUsesLiveAvatar,
			},
			"videoVoice.emotion": {
				label: "Voice Emotion",
				section: videoSection,
				advanced: advancedVideoVoice,
				widget: "select",
				options: voiceEmotionOptions,
				hidden: !supportsVideo || !videoVoiceUsesLiveAvatar,
			},
			"videoVoice.elevenlabs_settings": {
				label: "ElevenLabs Voice Settings",
				section: videoSection,
				advanced: advancedVideoVoice,
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			"videoVoice.elevenlabs_settings.stability": {
				label: "ElevenLabs Stability",
				section: videoSection,
				advanced: advancedVideoVoice,
				defaultValue: 0.5,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			"videoVoice.elevenlabs_settings.similarity_boost": {
				label: "ElevenLabs Similarity Boost",
				section: videoSection,
				advanced: advancedVideoVoice,
				defaultValue: 0.5,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			"videoVoice.elevenlabs_settings.style": {
				label: "ElevenLabs Style",
				section: videoSection,
				advanced: advancedVideoVoice,
				defaultValue: 0,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			"videoVoice.elevenlabs_settings.model_id": {
				label: "ElevenLabs Model ID",
				section: videoSection,
				advanced: advancedVideoVoice,
				placeholder: "eleven_monolingual_v1",
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			"videoVoice.elevenlabs_settings.use_speaker_boost": {
				label: "ElevenLabs Speaker Boost",
				section: videoSection,
				advanced: advancedVideoVoice,
				defaultValue: false,
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
				hidden: !supportsVideo || !videoVoiceUsesElevenLabs,
			},
			voiceId: {
				label: "Voice",
				section: voiceSection,
				widget: "voice-select",
				options: voiceOptions,
				placeholder: isLoadingVoices ? "Loading voices..." : "Select voice",
				hidden: !supportsVoice,
			},
			voiceProvider: {
				label: "Voice Provider",
				section: voiceSection,
				widget: "select",
				options: getVoiceProviderOptions(),
				hidden: !supportsVoice,
			},
			language: {
				label: "Language",
				section: sessionControlSection,
				widget: "select",
				options: languagesOptions,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			voiceChatTransport: {
				label: "Voice Chat Transport",
				section: sessionControlSection,
				advanced: supportsVideo ? advancedVideoSession : advancedSpeech,
				widget: "select",
				options: voiceChatTransportOptions,
				placeholder: "Select transport",
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			stt: {
				label: "Speech to Text",
				section: sessionControlSection,
				advanced: advancedSpeech,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			"stt.provider": {
				label: "STT Provider",
				section: sessionControlSection,
				advanced: advancedSpeech,
				widget: "select",
				options: sttProviderOptions,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			"stt.confidenceThreshold": {
				label: "STT Confidence Threshold",
				section: sessionControlSection,
				advanced: advancedSpeech,
				defaultValue: 0.5,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			disableIdleTimeout: {
				label: "Disable Idle Timeout",
				section: videoSection,
				advanced: advancedVideoSession,
				defaultValue: false,
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
				hidden: !supportsVideo,
			},
			activityIdleTimeout: {
				label: "Activity Idle Timeout (sec)",
				section: videoSection,
				advanced: advancedVideoSession,
				defaultValue: 1820,
				widget: "slider",
				min: 30,
				max: 3600,
				step: 30,
				hidden: !supportsVideo,
			},
			video: {
				label: "Video",
				section: videoSection,
				advanced: advancedVideoSession,
				hidden: !supportsVideo,
			},
			"video.resolution": {
				label: "Video Resolution",
				section: videoSection,
				advanced: advancedVideoSession,
				widget: "select",
				options: VIDEO_RESOLUTION_OPTIONS,
				hidden: !supportsVideo,
			},
			"video.background": {
				label: "Video Background",
				section: videoSection,
				advanced: advancedVideoSession,
				widget: "select",
				options: VIDEO_BACKGROUND_OPTIONS,
				hidden: !supportsVideo,
			},
			"video.fps": {
				label: "Video FPS",
				section: videoSection,
				advanced: advancedVideoSession,
				defaultValue: 38,
				widget: "slider",
				min: 15,
				max: 60,
				step: 1,
				hidden: !supportsVideo,
			},
			audio: {
				label: "Audio",
				section: sessionControlSection,
				advanced: advancedAudio,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			"audio.sampleRate": {
				label: "Audio Sample Rate (Hz)",
				section: sessionControlSection,
				advanced: advancedAudio,
				defaultValue: 16000,
				widget: "slider",
				min: 16000,
				max: 48000,
				step: 1000,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			"audio.noiseSuppression": {
				label: "Noise Suppression",
				section: sessionControlSection,
				advanced: advancedAudio,
				defaultValue: false,
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			"audio.echoCancellation": {
				label: "Echo Cancellation",
				section: sessionControlSection,
				advanced: advancedAudio,
				defaultValue: false,
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
				hidden: !showLiveAvatarVoiceChatSettings,
			},
			voice: {
				label: "Voice",
				section: voiceSection,
				hidden: !supportsVoice,
			},
			"voice.rate": {
				label: "Voice Rate",
				section: voiceSection,
				advanced: advancedVoice,
				defaultValue: 1,
				widget: "slider",
				min: 0.5,
				max: 2,
				step: 0.05,
				hidden: !supportsVoice || !voiceUsesLiveAvatar,
			},
			"voice.emotion": {
				label: "Voice Emotion",
				section: voiceSection,
				advanced: advancedVoice,
				widget: "select",
				options: voiceEmotionOptions,
				hidden: !supportsVoice || !voiceUsesLiveAvatar,
			},
			"voice.elevenlabs_settings": {
				label: "ElevenLabs Voice Settings",
				section: voiceSection,
				advanced: advancedVoice,
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
			"voice.elevenlabs_settings.stability": {
				label: "ElevenLabs Stability",
				section: voiceSection,
				advanced: advancedVoice,
				defaultValue: 0.5,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
			"voice.elevenlabs_settings.similarity_boost": {
				label: "ElevenLabs Similarity Boost",
				section: voiceSection,
				advanced: advancedVoice,
				defaultValue: 0.5,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
			"voice.elevenlabs_settings.style": {
				label: "ElevenLabs Style",
				section: voiceSection,
				advanced: advancedVoice,
				defaultValue: 0,
				widget: "slider",
				min: 0,
				max: 1,
				step: 0.05,
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
			"voice.elevenlabs_settings.model_id": {
				label: "ElevenLabs Model ID",
				section: voiceSection,
				advanced: advancedVoice,
				placeholder: "eleven_monolingual_v1",
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
			"voice.elevenlabs_settings.use_speaker_boost": {
				label: "ElevenLabs Speaker Boost",
				section: voiceSection,
				advanced: advancedVoice,
				defaultValue: false,
				widget: "select",
				options: BOOLEAN_CHOICE_OPTIONS,
				hidden: !supportsVoice || !voiceUsesElevenLabs,
			},
		};

		if (isCreate) {
			const baseRateText = currencyFormatter.format(usageProfile.baseAmount);
			base.monetize = {
				label: "Enable Monetization",
				section: monetizationSection,
				widget: "select",
				options: TRUE_FALSE_OPTIONS,
				helpText: monetizationEnabled
					? "Monetized agents become eligible for payouts."
					: "Select true to price this agent and enable payouts.",
			};
			base.rateMultiplier = {
				label: "Rate Multiplier",
				section: monetizationSection,
				widget: "select",
				options: RATE_MULTIPLIER_OPTIONS,
				placeholder: monetizationEnabled
					? undefined
					: "Enable monetization first",
				disabled: !monetizationEnabled,
				helpText: monetizationEnabled
					? `Applies to the ${usageProfile.label.toLowerCase()} base of ${baseRateText}.`
					: `Current base for ${usageProfile.label.toLowerCase()}: ${baseRateText}.`,
			};
		}

		return base;
	}, [
		avatarOptions,
		voiceOptions,
		videoVoiceOptions,
		knowledgeBaseOptions,
		mcpServerOptions,
		monetizationEnabled,
		isLoadingAvatars,
		isLoadingVoices,
		isLoadingVideoVoices,
		isLoadingKnowledgeBases,
		isLoadingTextModels,
		interactionModesValue,
		textModelOptions,
		textProviderValue,
		voiceProviderValue,
		videoVoiceProviderValue,
		isCreate,
		currencyFormatter,
		usageProfile.baseAmount,
		usageProfile.label,
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
												{`Base ${usageProfile.label.toLowerCase()} rate: ${currencyFormatter.format(
													usageProfile.baseAmount,
												)}. Multipliers scale your payout per active session.`}
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							<AutoForm
								className="space-y-4"
								schema={AgentFormSchema as unknown as z.ZodObject<any>}
								form={form as any}
								fields={fields as FieldsConfig<any>}
								submitLabel={isCreate ? "Create" : "Save"}
								onSubmit={(values: z.infer<typeof AgentFormSchema>) => {
									const configValues = values as Record<string, any>;
									const rawId = (values as any)?.id;
									const id =
										rawId && String(rawId).trim().length > 0
											? String(rawId).trim()
											: (working?.id ?? `new-${Date.now()}`);
									const name = String(values.name ?? "").trim();
									const role = values.role ? String(values.role).trim() : "";
									const interactionModes = Array.isArray(
										configValues.interactionModes,
									)
										? (configValues.interactionModes as InteractionMode[])
										: (["text"] satisfies InteractionMode[]);
									const sessionType = deriveSessionType(interactionModes);
									const avatarUrl =
										values.avatarUrl != null
											? String(values.avatarUrl).trim()
											: "";
									const description =
										values.description != null
											? String(values.description).trim()
											: "";
									const saveVideoSettings = interactionModes.includes("video");
									const saveVoiceSelection =
										interactionModes.includes("voice") || saveVideoSettings;
									const saveVoiceSettings = interactionModes.includes("voice");
									const saveVoiceTuning =
										interactionModes.includes("voice") || saveVideoSettings;
									const effectiveVideoVoiceId =
										configValues.videoVoiceId || configValues.voiceId;
									const voiceProvider = configValues.voiceProvider;
									const videoVoiceProvider = configValues.videoVoiceProvider;
									const saveLiveAvatarSessionSettings =
										(saveVoiceSettings && voiceProvider === "liveavatar") ||
										(saveVideoSettings && videoVoiceProvider === "liveavatar");
									const normalizedVoice =
										voiceProvider === "liveavatar"
											? {
													rate: configValues.voice?.rate,
													emotion: configValues.voice?.emotion,
												}
											: voiceProvider === "elevenlabs"
												? {
														elevenlabs_settings:
															configValues.voice?.elevenlabs_settings,
													}
												: undefined;
									const normalizedVideoVoice =
										videoVoiceProvider === "liveavatar"
											? {
													rate: configValues.videoVoice?.rate,
													emotion: configValues.videoVoice?.emotion,
												}
											: videoVoiceProvider === "elevenlabs"
												? {
														elevenlabs_settings:
															configValues.videoVoice?.elevenlabs_settings,
													}
												: undefined;
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

									const next: Agent = {
										id,
										name,
										role,
										sessionType,
										interactionModes,
										avatarUrl,
										description,
										tags,
										avatarId: saveVideoSettings
											? configValues.avatarId
											: undefined,
										voiceId: saveVideoSettings
											? effectiveVideoVoiceId
											: saveVoiceSelection
												? configValues.voiceId
												: undefined,
										videoVoiceId: saveVideoSettings
											? configValues.videoVoiceId
											: undefined,
										language: saveLiveAvatarSessionSettings
											? configValues.language
											: undefined,
										textProvider: configValues.textProvider,
										voiceProvider: saveVoiceSettings
											? voiceProvider
											: undefined,
										videoVoiceProvider: saveVideoSettings
											? videoVoiceProvider
											: undefined,
										model: configValues.model,
										temperature: configValues.temperature,
										maxOutputTokens: configValues.maxOutputTokens,
										topP: configValues.topP,
										frequencyPenalty: configValues.frequencyPenalty,
										presencePenalty: configValues.presencePenalty,
										quality: saveVideoSettings
											? configValues.quality
											: undefined,
										voiceChatTransport: saveLiveAvatarSessionSettings
											? configValues.voiceChatTransport
											: undefined,
										stt: saveLiveAvatarSessionSettings
											? configValues.stt
											: undefined,
										disableIdleTimeout: saveVideoSettings
											? configValues.disableIdleTimeout
											: undefined,
										activityIdleTimeout: saveVideoSettings
											? configValues.activityIdleTimeout
											: undefined,
										video: saveVideoSettings ? configValues.video : undefined,
										audio: saveLiveAvatarSessionSettings
											? configValues.audio
											: undefined,
										voice:
											saveVoiceTuning && normalizedVoice
												? normalizedVoice
												: undefined,
										videoVoice: saveVideoSettings
											? normalizedVideoVoice
											: undefined,
										knowledgeBaseId: configValues.knowledgeBaseId,
										contextFiles: configValues.contextFiles,
										canBrowseWeb: configValues.canBrowseWeb,
										canRunCode: configValues.canRunCode,
										canGenerateImages: configValues.canGenerateImages,
										mcpServers: configValues.mcpServers,
										systemPrompt: configValues.systemPrompt,
										modalities: interactionModes.includes("video")
											? ["chat", "voice", "video"]
											: interactionModes.includes("voice")
												? ["chat", "voice"]
												: ["chat"],
										isOwnedByUser: isCreate ? true : working?.isOwnedByUser,
									};
									onSave?.(next);
									onOpenChange(false);
								}}
							/>
							{isCreate && monetizationEnabled && (
								<AgentMonetizationSummary
									enabled={monetizationEnabled}
									multiplier={multiplierValue}
									profile={usageProfile}
								/>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
