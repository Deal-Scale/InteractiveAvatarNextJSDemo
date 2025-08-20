import { useMemo } from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { StartAvatarRequestSchema } from "@/lib/schemas/streaming";

// Use z.input here to match the resolver's input type (fields with defaults are optional on input)
export type StartAvatarFormValues = z.input<typeof StartAvatarRequestSchema>;

export function useStartAvatarForm(initial?: Partial<StartAvatarFormValues>): {
	form: UseFormReturn<StartAvatarFormValues>;
	onSubmit: (
		handler: SubmitHandler<StartAvatarFormValues>,
	) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	buildHeygenPayload: (
		values: StartAvatarFormValues,
	) => Record<string, unknown>;
} {
	const form = useForm<StartAvatarFormValues>({
		resolver: zodResolver(StartAvatarRequestSchema),
		defaultValues: {
			// UI/legacy fields (kept for compatibility)
			avatarName: "",
			language: "en-US",
			quality: "medium" as any,
			voiceChatTransport: undefined as any,

			// Heygen defaults
			video_encoding: "VP8",
			version: "v2",
			disable_idle_timeout: false,
			activity_idle_timeout: 120,

			...initial,
		},
		mode: "onChange",
		criteriaMode: "firstError",
	});

	const buildHeygenPayload = useMemo(() => {
		return (values: StartAvatarFormValues) => {
			const payload: Record<string, unknown> = {
				// direct heygen fields
				quality:
					typeof values.quality === "string"
						? values.quality
						: // If AvatarQuality enum sneaks in, fallback to "medium"
							"medium",
				avatar_id: values.avatar_id ?? undefined,
				video_encoding: values.video_encoding ?? "VP8",
				knowledge_base: values.knowledge_base ?? undefined,
				version: values.version ?? "v2",
				knowledge_base_id:
					values.knowledge_base_id ?? values.knowledgeId ?? undefined,
				disable_idle_timeout: values.disable_idle_timeout ?? false,
				activity_idle_timeout: values.activity_idle_timeout ?? 120,
			};

			// voice (prefer snake_case if provided)
			if (values.voice) {
				const v = values.voice as any;

				payload.voice = {
					voice_id: v.voice_id ?? v.voiceId,
					rate: v.rate,
					emotion: v.emotion,
					elevenlabs_settings:
						v.elevenlabs_settings ?? (v.elevenLabsSettings as any),
				};
			}
			if (values.voice_name) payload.voice_name = values.voice_name;

			// stt settings (prefer snake_case)
			if (values.stt_settings) {
				payload.stt_settings = values.stt_settings;
			} else if (values.sttSettings) {
				payload.stt_settings = { provider: values.sttSettings.provider as any };
			}

			return payload;
		};
	}, []);

	const onSubmit = (handler: SubmitHandler<StartAvatarFormValues>) =>
		form.handleSubmit(handler);

	return { form, onSubmit, buildHeygenPayload };
}
