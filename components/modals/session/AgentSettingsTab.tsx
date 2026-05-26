import type { UseFormReturn } from "react-hook-form";
import { AutoForm } from "@/components/forms/AutoForm";
import {
	type Option,
	sttProviderOptions,
	voiceChatTransportOptions,
} from "@/data/options";

const SESSION_TYPE_OPTIONS = [
	{ value: "all", label: "All modes" },
	{ value: "text", label: "Text chat" },
	{ value: "video", label: "Video chat" },
	{ value: "voice", label: "Voice chat" },
];

const VIDEO_RESOLUTION_OPTIONS = [
	{ value: "720p", label: "720p" },
	{ value: "1080p", label: "1080p" },
];

const VIDEO_BACKGROUND_OPTIONS = [
	{ value: "transparent", label: "Transparent" },
	{ value: "blur", label: "Blur" },
	{ value: "none", label: "None" },
];

interface AgentSettingsTabProps {
	form: UseFormReturn<any>;
	schema: any;
	avatarOptions: Option[];
	voiceOptions: Option[];
	knowledgeBaseOptions: Option[];
	mcpServerOptions: Option[];
	languagesOptions: Option[];
	onSubmit: (values: any) => void;
	onPublish?: () => void;
}

export function AgentSettingsTab({
	form,
	schema,
	avatarOptions,
	voiceOptions,
	knowledgeBaseOptions,
	mcpServerOptions,
	languagesOptions,
	onSubmit,
	onPublish,
}: AgentSettingsTabProps) {
	return (
		<div className="space-y-4 rounded-xl border border-border bg-card p-4 md:p-6 shadow-sm">
			<p className="text-sm text-muted-foreground">
				Configure your agent’s defaults. These persist locally in your browser.
			</p>
			<AutoForm
				className="space-y-3"
				fields={{
					quality: { label: "Quality", placeholder: "Select quality" },
					temperature: {
						label: "Temperature",
						widget: "slider",
						min: 0,
						max: 2,
						step: 0.1,
					},
					sessionType: {
						label: "Chat Type",
						widget: "select",
						options: SESSION_TYPE_OPTIONS,
						placeholder: "Select voice or video chat",
					},
					avatarId: {
						label: "Avatar",
						widget: "select",
						options: avatarOptions,
						placeholder: "Select avatar",
					},
					voiceId: {
						label: "Voice",
						widget: "select",
						options: voiceOptions,
						placeholder: "Select voice",
					},
					knowledgeBaseId: {
						label: "Knowledge Base",
						widget: "select",
						options: knowledgeBaseOptions,
						placeholder: "Select knowledge base",
					},
					voiceChatTransport: {
						label: "Voice Chat Transport",
						widget: "select",
						options: voiceChatTransportOptions,
						placeholder: "Select transport",
					},
					disableIdleTimeout: {
						label: "Disable Idle Timeout",
						widget: "select",
						options: [
							{ value: "true", label: "Enabled" },
							{ value: "false", label: "Disabled" },
						],
						placeholder: "Select option",
					},
					activityIdleTimeout: {
						label: "Activity Idle Timeout (sec)",
						widget: "slider",
						min: 30,
						max: 3600,
						step: 10,
					},
					"stt.provider": {
						label: "STT Provider",
						widget: "select",
						options: sttProviderOptions,
						placeholder: "Select STT provider",
					},
					"stt.confidenceThreshold": {
						label: "STT Confidence Threshold",
						widget: "slider",
						min: 0,
						max: 1,
						step: 0.05,
					},
					"video.resolution": {
						label: "Video Resolution",
						widget: "select",
						options: VIDEO_RESOLUTION_OPTIONS,
						placeholder: "Select resolution",
					},
					"video.background": {
						label: "Video Background",
						widget: "select",
						options: VIDEO_BACKGROUND_OPTIONS,
						placeholder: "Select background",
					},
					"video.fps": {
						label: "Video FPS",
						widget: "slider",
						min: 15,
						max: 60,
						step: 1,
					},
					language: {
						label: "Language",
						widget: "select",
						options: languagesOptions,
						placeholder: "Select language",
					},
					systemPrompt: {
						label: "System Prompt / Knowledge Base Text",
						widget: "textarea",
						placeholder: "Describe your agent's behavior or paste KB text...",
					},
					// Array<string> -> AutoForm will render as multi-select when options are provided
					mcpServers: {
						label: "MCP Servers",
						widget: "select",
						options: mcpServerOptions,
						placeholder: "Select servers",
					},
				}}
				form={form as any}
				schema={schema}
				submitLabel="Save Agent"
				onSubmit={onSubmit}
			/>
			<div className="flex items-center justify-end">
				<button
					className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
					type="button"
					onClick={() => onPublish?.()}
				>
					Publish Agent
				</button>
			</div>
		</div>
	);
}
