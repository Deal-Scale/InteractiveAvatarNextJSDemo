"use client";

import {
	BotIcon,
	FolderPlusIcon,
	MessageSquareIcon,
	MicIcon,
} from "lucide-react";
import type React from "react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	type TextProviderMode,
	useChatProviderStore,
	type VoiceProviderMode,
} from "@/lib/stores/chatProvider";
import type { ChatExperience, ChatSettingsTab } from "@/lib/stores/session";
import { useSessionStore } from "@/lib/stores/session";
import { cn } from "@/lib/utils";
import ThemeEmotionSelect from "../ui/theme-emotion-select";

interface BasicChatSettingsModalProps {
	open: boolean;
	mode: ChatExperience;
	onModeChange: (mode: ChatExperience) => void;
	onOpenChange: (open: boolean) => void;
}

const TEXT_PROVIDERS: Array<{ value: TextProviderMode; label: string }> = [
	{ value: "pollinations", label: "Pollinations" },
	{ value: "claude", label: "Claude" },
	{ value: "openai", label: "OpenAI" },
	{ value: "deepseek", label: "DeepSeek" },
	{ value: "gemini", label: "Gemini" },
	{ value: "openrouter", label: "OpenRouter" },
];

const VOICE_PROVIDERS: Array<{ value: VoiceProviderMode; label: string }> = [
	{ value: "elevenlabs", label: "ElevenLabs" },
];

const TABS: Array<{
	value: ChatSettingsTab;
	label: string;
	icon: typeof MessageSquareIcon;
}> = [
	{ value: "text", label: "Text Chat", icon: MessageSquareIcon },
	{ value: "voice", label: "Voice Chat", icon: MicIcon },
	{ value: "avatar", label: "Avatar Chat", icon: BotIcon },
];

const NATIVE_SELECT_CLASS =
	"min-w-0 rounded-md border border-input bg-slate-950 px-3 py-2 text-sm text-slate-50 [color-scheme:dark]";

function FieldLabel({
	children,
	htmlFor,
}: {
	children: React.ReactNode;
	htmlFor?: string;
}) {
	return (
		<label className="font-medium text-foreground text-sm" htmlFor={htmlFor}>
			{children}
		</label>
	);
}

export function BasicChatSettingsModal({
	open,
	mode,
	onModeChange,
	onOpenChange,
}: BasicChatSettingsModalProps) {
	const textProviderId = useId();
	const systemPromptId = useId();
	const seedId = useId();
	const voiceProviderId = useId();
	const chatFolderNameId = useId();
	const [chatFolderName, setChatFolderName] = useState("");
	const textMode = useChatProviderStore((state) => state.textMode);
	const voiceMode = useChatProviderStore((state) => state.voiceMode);
	const textSettings = useChatProviderStore((state) => state.textSettings);
	const voiceSettings = useChatProviderStore((state) => state.voiceSettings);
	const setTextMode = useChatProviderStore((state) => state.setTextMode);
	const setVoiceMode = useChatProviderStore((state) => state.setVoiceMode);
	const setTextSettings = useChatProviderStore(
		(state) => state.setTextSettings,
	);
	const setVoiceSettings = useChatProviderStore(
		(state) => state.setVoiceSettings,
	);
	const openConfigModal = useSessionStore((state) => state.openConfigModal);
	const activeTab = useSessionStore((state) => state.chatSettingsTab);
	const setActiveTab = useSessionStore((state) => state.setChatSettingsTab);
	const currentSessionId = useSessionStore((state) => state.currentSessionId);
	const chatFolders = useSessionStore((state) => state.chatFolders);
	const setChatFolders = useSessionStore((state) => state.setChatFolders);
	const chatFolderAssignments = useSessionStore(
		(state) => state.chatFolderAssignments,
	);
	const setChatFolderAssignments = useSessionStore(
		(state) => state.setChatFolderAssignments,
	);
	const currentChatId = currentSessionId
		? `live-session-${currentSessionId}`
		: "current-chat-session";
	const selectedFolderId = chatFolderAssignments[currentChatId] ?? "";

	const selectChatMode = (next: ChatSettingsTab) => {
		setActiveTab(next);
		if (next === "avatar") {
			onModeChange("avatar");
		} else if (mode === "avatar") {
			onModeChange(next === "text" ? "basic" : "advanced");
		}
	};

	const addChatFolder = () => {
		const trimmed = chatFolderName.trim();
		if (!trimmed) return;
		setChatFolders((current) =>
			current.some(
				(folder) => folder.name.toLowerCase() === trimmed.toLowerCase(),
			)
				? current
				: [
						...current,
						{
							id: `chat-folder-${Date.now()}-${Math.random().toString(36).slice(2)}`,
							name: trimmed,
						},
					],
		);
		setChatFolderName("");
	};

	const assignCurrentChatFolder = (folderId: string) => {
		setChatFolderAssignments((current) => ({
			...current,
			[currentChatId]: folderId || undefined,
		}));
	};

	const stopEnterFromSubmittingChat = (
		event: React.KeyboardEvent<HTMLDivElement>,
	) => {
		if (event.key !== "Enter") return;
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		if (
			target.closest(
				'input, select, textarea, button, [role="combobox"], [role="option"], [role="tab"]',
			)
		) {
			event.stopPropagation();
		}
	};

	return (
		<Dialog modal={false} open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="flex max-h-[92vh] w-[min(92vw,760px)] max-w-[92vw] flex-col overflow-hidden bg-card text-card-foreground"
				data-tour="chat-settings"
				onKeyDownCapture={stopEnterFromSubmittingChat}
				onInteractOutside={(event) => {
					event.preventDefault();
				}}
			>
				<DialogHeader className="min-w-0 pr-8">
					<DialogTitle>Chat Settings</DialogTitle>
					<DialogDescription>
						Choose text, voice, or avatar chat settings.
					</DialogDescription>
				</DialogHeader>

				<div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden pr-1">
					<div className="mb-4 grid gap-3 rounded-lg border border-border bg-background p-3">
						<div className="flex items-start justify-between gap-3">
							<div>
								<div className="font-semibold text-sm">Workflow setup</div>
								<p className="mt-1 text-muted-foreground text-xs">
									Organize chats into folders. Guided flows live in the left
									sidebar.
								</p>
							</div>
						</div>

						<div
							className="rounded-md border border-border bg-card p-3"
							data-tour="chat-folders"
						>
							<div className="flex items-center justify-between gap-3">
								<div>
									<div className="font-medium text-sm">Chat folders</div>
									<p className="mt-1 text-muted-foreground text-xs">
										Create folders, then assign the current chat/session.
									</p>
								</div>
								<FolderPlusIcon className="h-4 w-4 text-muted-foreground" />
							</div>
							<div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
								<input
									id={chatFolderNameId}
									className="min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
									placeholder="Folder name"
									value={chatFolderName}
									onChange={(event) => setChatFolderName(event.target.value)}
									onKeyDown={(event) => {
										if (event.key === "Enter") {
											event.preventDefault();
											addChatFolder();
										}
									}}
								/>
								<Button type="button" size="sm" onClick={addChatFolder}>
									Add folder
								</Button>
							</div>
							<div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
								<select
									className={NATIVE_SELECT_CLASS}
									value={selectedFolderId}
									onChange={(event) =>
										assignCurrentChatFolder(event.target.value)
									}
								>
									<option value="">No folder</option>
									{chatFolders.map((folder) => (
										<option key={folder.id} value={folder.id}>
											{folder.name}
										</option>
									))}
								</select>
								<div className="flex flex-wrap gap-2">
									{chatFolders.map((folder) => (
										<span
											key={folder.id}
											className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground text-xs"
										>
											{folder.name}
										</span>
									))}
								</div>
							</div>
						</div>
					</div>

					<div
						className="grid min-w-0 grid-cols-3 overflow-hidden rounded-md border border-border"
						role="tablist"
						aria-label="Chat settings sections"
					>
						{TABS.map((tab) => {
							const Icon = tab.icon;
							const active = activeTab === tab.value;

							return (
								<button
									key={tab.value}
									type="button"
									role="tab"
									aria-selected={active}
									className={cn(
										"flex min-w-0 items-center justify-center gap-2 px-2 py-2 font-medium text-xs transition-colors sm:text-sm",
										active
											? "bg-primary text-primary-foreground"
											: "bg-background text-muted-foreground hover:bg-muted",
									)}
									onClick={() => selectChatMode(tab.value)}
								>
									<Icon className="h-4 w-4 shrink-0" />
									<span className="truncate">{tab.label}</span>
								</button>
							);
						})}
					</div>

					<div className="mt-4 min-w-0">
						{activeTab === "text" && (
							<div className="grid min-w-0 gap-4">
								<div className="grid min-w-0 gap-2 rounded-md border border-border bg-background p-3">
									<div>
										<div className="font-medium text-sm">Emotion colors</div>
										<p className="mt-1 text-muted-foreground text-xs">
											Update chat accent colors for the current experience.
										</p>
									</div>
									<ThemeEmotionSelect className="w-full" />
								</div>

								{process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" && (
									<div className="flex min-w-0 flex-col gap-2">
										<FieldLabel htmlFor={textProviderId}>
											Text provider
										</FieldLabel>
										<select
											id={textProviderId}
											className={cn("w-full", NATIVE_SELECT_CLASS)}
											value={textMode}
											onChange={(event) =>
												setTextMode(event.target.value as TextProviderMode)
											}
										>
											{TEXT_PROVIDERS.map((provider) => (
												<option key={provider.value} value={provider.value}>
													{provider.label}
												</option>
											))}
										</select>
									</div>
								)}

								<div className="flex min-w-0 flex-col gap-2">
									<FieldLabel htmlFor={systemPromptId}>
										System prompt
									</FieldLabel>
									<textarea
										id={systemPromptId}
										className="min-h-24 w-full min-w-0 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
										placeholder="Optional behavior instructions for text chat"
										value={textSettings.systemPrompt}
										onChange={(event) =>
											setTextSettings({ systemPrompt: event.target.value })
										}
									/>
								</div>

								<div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_auto]">
									<div className="flex min-w-0 flex-col gap-2">
										<FieldLabel htmlFor={seedId}>Seed</FieldLabel>
										<input
											id={seedId}
											className="w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
											inputMode="numeric"
											placeholder="Optional"
											value={textSettings.seed}
											onChange={(event) =>
												setTextSettings({
													seed: event.target.value.replace(/[^\d-]/g, ""),
												})
											}
										/>
									</div>
									<label className="flex min-w-0 items-center gap-2 self-end rounded-md border border-border px-3 py-2 text-sm">
										<input
											type="checkbox"
											checked={textSettings.jsonMode}
											onChange={(event) =>
												setTextSettings({ jsonMode: event.target.checked })
											}
										/>
										<span className="min-w-0">JSON mode</span>
									</label>
								</div>

								<div className="flex flex-wrap gap-2">
									<Button type="button" onClick={() => onModeChange("basic")}>
										Use Basic Chat
									</Button>
									<Button
										type="button"
										variant="secondary"
										onClick={() => onModeChange("advanced")}
									>
										Use Advanced Chat
									</Button>
								</div>
							</div>
						)}

						{activeTab === "voice" && (
							<div className="grid min-w-0 gap-4">
								{process.env.NEXT_PUBLIC_CHAT_DEBUG === "true" && (
									<div className="flex min-w-0 flex-col gap-2">
										<FieldLabel htmlFor={voiceProviderId}>
											Voice provider
										</FieldLabel>
										<select
											id={voiceProviderId}
											className={cn("w-full", NATIVE_SELECT_CLASS)}
											value={voiceMode}
											onChange={(event) =>
												setVoiceMode(event.target.value as VoiceProviderMode)
											}
										>
											{VOICE_PROVIDERS.map((provider) => (
												<option key={provider.value} value={provider.value}>
													{provider.label}
												</option>
											))}
										</select>
									</div>
								)}

								<label className="flex min-w-0 items-start gap-3 rounded-md border border-border p-3 text-sm">
									<input
										className="mt-1"
										type="checkbox"
										checked={voiceSettings.voiceEnabled}
										onChange={(event) =>
											setVoiceSettings({ voiceEnabled: event.target.checked })
										}
									/>
									<span className="min-w-0">
										<span className="block font-medium">
											Enable voice chat pipeline
										</span>
										<span className="block text-muted-foreground text-xs">
											Send text through the selected voice provider when
											available.
										</span>
									</span>
								</label>

								<label className="flex min-w-0 items-start gap-3 rounded-md border border-border p-3 text-sm">
									<input
										className="mt-1"
										type="checkbox"
										checked={voiceSettings.autoSpeak}
										onChange={(event) =>
											setVoiceSettings({ autoSpeak: event.target.checked })
										}
									/>
									<span className="min-w-0">
										<span className="block font-medium">
											Auto-speak assistant responses
										</span>
										<span className="block text-muted-foreground text-xs">
											When an avatar/session is active, read provider replies
											aloud.
										</span>
									</span>
								</label>
							</div>
						)}

						{activeTab === "avatar" && (
							<div className="grid min-w-0 gap-4">
								<div className="rounded-md border border-border bg-background p-3">
									<div className="font-medium text-sm">Avatar Chat</div>
									<p className="mt-1 text-muted-foreground text-sm">
										Avatar setup still uses the existing session, user, global,
										and agent settings.
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										onClick={() => {
											onModeChange("avatar");
											onOpenChange(false);
											openConfigModal("global");
										}}
									>
										Open Avatar Settings
									</Button>
									<Button
										type="button"
										variant="secondary"
										onClick={() => onModeChange("avatar")}
									>
										Use Avatar Chat
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Done
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
