"use client";

import type { Agent } from "./AgentCard";

import React, { useMemo, useState } from "react";
import { z } from "zod";

import AgentPreview from "./AgentPreview";
import { AgentMonetizationSummary } from "./AgentMonetizationSummary";

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
import { getAgentUsageProfile } from "@/lib/agents/monetization";
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
			avatarId: (source?.avatarId as string) ?? "",
			avatarUrl: (source?.avatarUrl as string) ?? "",
			description: (source?.description as string) ?? "",
			tags: Array.isArray(source?.tags) ? (source?.tags as string[]) : [],
			voiceId: (source?.voiceId as string) ?? "",
			language: (source?.language as string) ?? "",
			model: (source?.model as string) ?? "",
			temperature:
				typeof source?.temperature === "number"
					? (source?.temperature as number)
					: 0.7,
			quality: source?.quality ?? undefined,
			voiceChatTransport: source?.voiceChatTransport ?? undefined,
			stt: {
				provider: stt?.provider ?? undefined,
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
				resolution: video?.resolution ?? undefined,
				background: video?.background ?? undefined,
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
			knowledgeBaseId: (source?.knowledgeBaseId as string) ?? "",
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
	const usageProfile = React.useMemo(
		() => getAgentUsageProfile(roleValue),
		[roleValue],
	);
	const currencyFormatter = React.useMemo(
		() =>
			new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: usageProfile.currency,
				maximumFractionDigits: 2,
			}),
		[usageProfile.currency],
	);

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
			const baseRateText = currencyFormatter.format(usageProfile.baseAmount);
			base.monetize = {
				label: "Enable Monetization",
				widget: "switch",
				helpText: monetizationEnabled
					? "Monetized agents become eligible for payouts."
					: "Switch on to price this agent and enable payouts.",
			};
			base.rateMultiplier = {
				label: "Rate Multiplier",
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
		knowledgeBaseOptions,
		mcpServerOptions,
		monetizationEnabled,
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

									const next: Agent = {
										id,
										name,
										role,
										avatarUrl,
										description,
										tags,
										isOwnedByUser: isCreate ? true : working?.isOwnedByUser,
									};
									onSave?.(next);
									onOpenChange(false);
								}}
							/>
							{isCreate && (
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
