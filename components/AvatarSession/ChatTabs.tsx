import React from "react";
import { Mic, MessageSquareText } from "lucide-react";

import type { ChatMode } from "@/lib/stores/session";
import { cn } from "@/lib/utils";

const TAB_CONFIG: Record<
	ChatMode,
	{
		label: string;
		provider: string;
		icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	}
> = {
	text: {
		label: "Text",
		provider: "HeyGen Streaming Avatar",
		icon: MessageSquareText,
	},
	voice: {
		label: "Voice",
		provider: "ElevenLabs Voice",
		icon: Mic,
	},
};

interface ChatModeTabsProps {
	value: ChatMode;
	onValueChange: (mode: ChatMode) => void;
	isVoiceActive: boolean;
	isVoiceLoading: boolean;
}

export function ChatModeTabs({
	value,
	onValueChange,
	isVoiceActive,
	isVoiceLoading,
}: ChatModeTabsProps) {
	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
				<span className="font-medium uppercase tracking-wide text-foreground/80">
					Interaction channel
				</span>
				<span>Choose how you want to collaborate with the avatar.</span>
			</div>

			<div
				className="grid gap-2 sm:grid-cols-2"
				role="tablist"
				aria-label="Chat modes"
			>
				{(Object.keys(TAB_CONFIG) as ChatMode[]).map((key) => {
					const tab = TAB_CONFIG[key];
					const selected = value === key;
					const Icon = tab.icon;

					return (
						<button
							key={key}
							type="button"
							role="tab"
							id={`chat-mode-${key}`}
							aria-selected={selected}
							aria-controls={`chat-mode-panel-${key}`}
							className={cn(
								"relative flex h-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								selected
									? "border-primary/80 bg-primary/10"
									: "border-border bg-card/70 hover:border-primary/40 hover:bg-primary/5",
							)}
							onClick={() => onValueChange(key)}
						>
							<span
								className={cn(
									"mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
									selected
										? "border-primary bg-primary/20 text-primary"
										: "border-border bg-muted text-foreground",
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
							<span className="flex min-w-0 flex-1 flex-col">
								<span className="text-sm font-medium text-foreground">
									{tab.label}
								</span>
								<span className="text-xs text-muted-foreground">
									{tab.provider}
								</span>
							</span>
							{key === "voice" && (
								<span
									className={cn(
										"ml-auto text-xs font-semibold",
										isVoiceActive
											? "text-emerald-500"
											: isVoiceLoading
												? "text-amber-500"
												: "text-muted-foreground",
									)}
								>
									{isVoiceActive
										? "Live"
										: isVoiceLoading
											? "Connecting"
											: "Ready"}
								</span>
							)}
						</button>
					);
				})}
			</div>

			<div
				id={`chat-mode-panel-${value}`}
				role="note"
				className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground"
			>
				{value === "text" && (
					<span>
						Typed prompts flow through the HeyGen Streaming Avatar for
						responses.
					</span>
				)}
				{value === "voice" && (
					<span>
						{isVoiceActive
							? "ElevenLabs voice chat is live. Use the microphone controls below to continue."
							: isVoiceLoading
								? "Connecting to ElevenLabs voice… hang tight while the stream becomes available."
								: "Press the mic button to start an ElevenLabs voice session with the streaming avatar."}
					</span>
				)}
			</div>
		</div>
	);
}
