"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AutoForm } from "@/components/external/zod-react-form-auto/src/AutoForm";
import type {
	FieldConfig,
	FieldsConfig,
} from "@/components/external/zod-react-form-auto/src/utils/utils";
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
	useAvatarOptionsQuery,
	useKnowledgeBaseOptionsQuery,
	useMcpServerOptionsQuery,
	useVoiceOptionsQuery,
	voiceChatTransportOptions,
	voiceEmotionOptions,
} from "@/data/options";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import type { Agent } from "./AgentCard";
import AgentPreview from "./AgentPreview";

const enabledDisabledOptions = [
	{ value: "true", label: "Enabled" },
	{ value: "false", label: "Disabled" },
];

const rateMultiplierOptions = [
	{ label: "1x", value: "1" },
	{ label: "2x", value: "2" },
	{ label: "3x", value: "3" },
	{ label: "4x", value: "4" },
	{ label: "5x", value: "5" },
];

const videoResolutionOptions = [
	{ value: "720p", label: "720p" },
	{ value: "1080p", label: "1080p" },
];

const videoBackgroundOptions = [
	{ value: "transparent", label: "Transparent" },
	{ value: "blur", label: "Blur" },
	{ value: "none", label: "None" },
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

	const { data: avatarOptions = [] } = useAvatarOptionsQuery();
	const { data: voiceOptions = [] } = useVoiceOptionsQuery();
	const { data: knowledgeBaseOptions = [] } = useKnowledgeBaseOptionsQuery();
	const { data: mcpServerOptions = [] } = useMcpServerOptionsQuery();

	// Combined schema: full AgentConfig + sidebar-only fields + create-only monetization fields
	const AgentFormSchema = useMemo(() => {
		const base = AgentConfigSchema as unknown as z.ZodObject<
			Record<string, z.ZodTypeAny>
		>;
		return base.extend({
			role: z.string().optional(),
			avatarUrl: z.string().url().optional().or(z.literal("")).optional(),
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
			// create-mode extras
			monetize: z.boolean().optional().default(false),
			// keep as string to align with select options below
			rateMultiplier: z.enum(["1", "2", "3", "4", "5"]).optional(),
		});
	}, []);

	// Single form instance used for both edit and create
	const form = useForm<z.infer<typeof AgentFormSchema>>({
		resolver: zodResolver(AgentFormSchema),
		mode: "onChange",
		defaultValues: {
			id: working?.id ?? "new",
			name: working?.name ?? "",
			avatarId: undefined,
			role: working?.role ?? "",
			avatarUrl: working?.avatarUrl ?? "",
			description: working?.description ?? "",
			tags: working?.tags ?? [],
			monetize: false,
			rateMultiplier: "1",
		},
	});

	React.useEffect(() => {
		// Sync form defaults when switching target or mode
		form.reset({
			id: working?.id ?? "new",
			name: working?.name ?? "",
			avatarId: undefined,
			role: working?.role ?? "",
			avatarUrl: working?.avatarUrl ?? "",
			description: working?.description ?? "",
			tags: working?.tags ?? [],
			monetize: false,
			rateMultiplier: "1",
		});
	}, [working, form]);

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
												To monetize your agent, multiply by the current base
												agent rate.
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							{(() => {
								const monetize = form.watch("monetize");
								const fields: Record<string, FieldConfig> = {
									name: { label: "Name", placeholder: "Concierge Ava" },
									role: { label: "Role / Title", placeholder: "AI Concierge" },
									avatarId: {
										label: "Avatar",
										widget: "select",
										options: avatarOptions,
										placeholder: "Select avatar",
									},
									avatarUrl: {
										label: "Avatar Override URL",
										placeholder: "https://...",
									},
									voiceId: {
										label: "Voice",
										widget: "select",
										options: voiceOptions,
										placeholder: "Select voice",
									},
									language: {
										label: "Language",
										widget: "select",
										options: languagesOptions,
										placeholder: "Select language",
									},
									model: { label: "Model", placeholder: "gpt-4o-mini" },
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
										options: enabledDisabledOptions,
									},
									activityIdleTimeout: {
										label: "Activity Idle Timeout (sec)",
										widget: "slider",
										min: 30,
										max: 3600,
										step: 15,
									},
									"video.resolution": {
										label: "Video Resolution",
										widget: "select",
										options: videoResolutionOptions,
									},
									"video.background": {
										label: "Video Background",
										widget: "select",
										options: videoBackgroundOptions,
									},
									"video.fps": {
										label: "Video FPS",
										widget: "slider",
										min: 15,
										max: 60,
										step: 1,
									},
									"audio.sampleRate": {
										label: "Audio Sample Rate",
										widget: "slider",
										min: 16000,
										max: 48000,
										step: 1000,
									},
									"audio.noiseSuppression": {
										label: "Noise Suppression",
										widget: "select",
										options: enabledDisabledOptions,
									},
									"audio.echoCancellation": {
										label: "Echo Cancellation",
										widget: "select",
										options: enabledDisabledOptions,
									},
									"voice.rate": {
										label: "Voice Rate",
										widget: "slider",
										min: 0.5,
										max: 2,
										step: 0.1,
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
										placeholder: "eleven_monolingual_v2",
									},
									"voice.elevenlabs_settings.use_speaker_boost": {
										label: "ElevenLabs Speaker Boost",
										widget: "select",
										options: enabledDisabledOptions,
									},
									knowledgeBaseId: {
										label: "Knowledge Base",
										widget: "select",
										options: knowledgeBaseOptions,
										placeholder: "Select knowledge base",
									},
									mcpServers: {
										label: "MCP Servers",
										widget: "select",
										multiple: true,
										options: mcpServerOptions,
									},
									systemPrompt: {
										label: "System Prompt",
										widget: "textarea",
										placeholder: "Guide your agent's behavior...",
									},
									description: {
										label: "Description",
										widget: "textarea",
										placeholder: "Visible summary for teammates...",
									},
									tags: {
										label: "Tags",
										placeholder: "Add tags and press Enter",
									},
								};

								if (isCreate) {
									fields.monetize = {
										label: "Enable Monetization",
										widget: "select",
										options: enabledDisabledOptions,
									};
									if (monetize) {
										fields.rateMultiplier = {
											label: "Rate Multiplier",
											widget: "select",
											options: rateMultiplierOptions,
										};
									}
								}
								return (
									<AutoForm
										className="space-y-3"
										schema={AgentFormSchema}
										form={form}
										fields={
											fields as unknown as FieldsConfig<
												z.infer<typeof AgentFormSchema>
											>
										}
										submitLabel={isCreate ? "Create" : "Save"}
										onSubmit={(values: z.infer<typeof AgentFormSchema>) => {
											const name = String(values.name ?? "");
											const role =
												values.role != null ? String(values.role) : "";
											const avatarUrl =
												values.avatarUrl != null
													? String(values.avatarUrl)
													: "";
											const description =
												values.description != null
													? String(values.description)
													: "";
											const tags: string[] = Array.isArray(values.tags)
												? values.tags
												: [];

											const next: Agent = {
												id: values.id || working?.id || `new-${Date.now()}`,
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
								);
							})()}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
