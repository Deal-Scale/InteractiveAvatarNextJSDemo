import { Pause, Play } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { AvatarOption } from "../AvatarConfig/hooks/useAvatarOptions";
import { Input } from "@/components/ui/input";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Option } from "../../data/options";

interface SessionQuickStartCardProps {
	avatarOptions: AvatarOption[];
	contextOptions?: Option[];
	voiceOptions?: Option[];
	isLoadingAvatarOptions?: boolean;
	isLoadingContextOptions?: boolean;
	isLoadingVoiceOptions?: boolean;
	selectedAvatar: string;
	selectedVoiceId?: string;
	customAvatarId: string;
	knowledgeBaseId: string;
	kbIdValid: boolean;
	customIdValid: boolean;
	isConnecting: boolean;
	onSelectAvatar: (value: string) => void;
	onSelectVoice?: (value: string) => void;
	onCustomAvatarChange: (value: string) => void;
	onKnowledgeBaseChange: (value: string) => void;
	onStartSession: (options: {
		avatarId?: string;
		knowledgeBaseId?: string;
		voiceId?: string;
	}) => void;
	onStartWithoutAvatar?: () => void;
}

/**
 * Presents the pre-session configuration card within the video panel so that users can
 * quickly pick an avatar, supply optional knowledge base details, and kick off a session
 * without opening the full configuration modal.
 */
export function SessionQuickStartCard({
	avatarOptions,
	contextOptions = [],
	voiceOptions = [],
	isLoadingAvatarOptions = false,
	isLoadingContextOptions = false,
	isLoadingVoiceOptions = false,
	selectedAvatar,
	selectedVoiceId,
	customAvatarId,
	knowledgeBaseId,
	kbIdValid,
	customIdValid,
	isConnecting,
	onSelectAvatar,
	onSelectVoice,
	onCustomAvatarChange,
	onKnowledgeBaseChange,
	onStartSession,
	onStartWithoutAvatar,
}: SessionQuickStartCardProps) {
	const avatarSelectId = useId();
	const voiceSelectId = useId();
	const contextSelectId = useId();
	const kbInputId = useId();
	const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
	const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(
		null,
	);

	const finalAvatarId =
		selectedAvatar === "CUSTOM" ? customAvatarId.trim() : selectedAvatar;
	const finalKnowledgeId = knowledgeBaseId.trim() || undefined;
	const hasAvatar = Boolean(finalAvatarId);
	const hasContextId = Boolean(finalKnowledgeId);
	const isAvatarValid =
		hasAvatar &&
		(selectedAvatar !== "CUSTOM" ||
			(Boolean(customAvatarId.trim()) && customIdValid));
	const isContextValid = hasContextId && kbIdValid;
	const isStartDisabled = isConnecting || !isAvatarValid || !isContextValid;
	const canStartTextChat = Boolean(onStartWithoutAvatar) && !isConnecting;
	const selectedVoiceOption = voiceOptions.find(
		(option) => option.value === selectedVoiceId,
	);
	const selectedVoicePreviewUrl = selectedVoiceOption?.previewUrl;
	const isVoicePreviewPlaying =
		Boolean(selectedVoicePreviewUrl) && playingVoicePreview === selectedVoiceId;

	const stopVoicePreview = () => {
		voicePreviewRef.current?.pause();
		voicePreviewRef.current = null;
		setPlayingVoicePreview(null);
	};

	const toggleVoicePreview = async () => {
		if (!selectedVoiceId || !selectedVoicePreviewUrl) return;

		if (isVoicePreviewPlaying) {
			stopVoicePreview();
			return;
		}

		stopVoicePreview();
		const audio = new Audio(selectedVoicePreviewUrl);
		voicePreviewRef.current = audio;
		audio.onended = () => setPlayingVoicePreview(null);
		audio.onerror = () => setPlayingVoicePreview(null);
		setPlayingVoicePreview(selectedVoiceId);
		try {
			await audio.play();
		} catch {
			setPlayingVoicePreview(null);
		}
	};

	const triggerStart = () => {
		onStartSession({
			avatarId: finalAvatarId,
			knowledgeBaseId: finalKnowledgeId,
			voiceId: selectedVoiceId?.trim() || undefined,
		});
	};

	return (
		<Card className="relative w-[360px] overflow-hidden border-border bg-card/80 backdrop-blur">
			<CardHeader>
				<CardTitle>Select an avatar to start session</CardTitle>
				<CardDescription>
					Choose an avatar and click Start Session to begin.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4">
					<div className="flex flex-col gap-2">
						<label
							className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
							htmlFor={avatarSelectId}
						>
							<span>Avatar</span>
							<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
								Required
							</span>
						</label>
						<Select value={selectedAvatar} onValueChange={onSelectAvatar}>
							<SelectTrigger
								id={avatarSelectId}
								className="bg-popover/90 border-border text-popover-foreground hover:bg-popover focus:ring-2 focus:ring-ring/50"
							>
								<SelectValue placeholder="Select an avatar" />
							</SelectTrigger>
							<SelectContent
								align="start"
								avoidCollisions={false}
								className="z-50 bg-popover/95 text-popover-foreground border border-border shadow-xl backdrop-blur"
								position="popper"
								side="bottom"
								sideOffset={4}
							>
								{avatarOptions.map((opt) => (
									<SelectItem
										key={opt.avatar_id}
										className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent data-[state=checked]:bg-accent"
										value={opt.avatar_id}
									>
										{opt.name}
									</SelectItem>
								))}
								{avatarOptions.length === 0 && (
									<div className="px-3 py-2 text-xs text-muted-foreground">
										{isLoadingAvatarOptions
											? "Loading LiveAvatar avatars..."
											: "No LiveAvatar avatars returned"}
									</div>
								)}
								{avatarOptions.length === 0 && (
									<SelectItem
										className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent"
										value="CUSTOM"
									>
										Paste Avatar UUID
									</SelectItem>
								)}
							</SelectContent>
						</Select>
						{avatarOptions.length === 0 && !isLoadingAvatarOptions ? (
							<div className="text-xs text-muted-foreground">
								Your LiveAvatar API key did not return avatar options. Paste a
								LiveAvatar avatar UUID below or confirm the key has access to
								published avatars.
							</div>
						) : null}
						{selectedAvatar === "CUSTOM" && (
							<div className="mt-2">
								<Input
									placeholder="Enter LiveAvatar avatar_id"
									value={customAvatarId}
									onChange={onCustomAvatarChange}
								/>
								{customAvatarId ? (
									customIdValid ? (
										<div className="text-primary text-xs mt-1">
											Avatar UUID format looks good
										</div>
									) : (
										<div className="text-destructive text-xs mt-1">
											LiveAvatar avatar_id must be a UUID
										</div>
									)
								) : null}
							</div>
						)}
						<div className="mt-3 flex flex-col gap-2">
							<label
								className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
								htmlFor={voiceSelectId}
							>
								<span>Voice</span>
								<span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
									Optional
								</span>
							</label>
							<div className="flex gap-2">
								<Select
									value={selectedVoiceId || "__DEFAULT__"}
									onValueChange={(value) => {
										stopVoicePreview();
										onSelectVoice?.(value === "__DEFAULT__" ? "" : value);
									}}
								>
									<SelectTrigger
										id={voiceSelectId}
										className="bg-popover/90 border-border text-popover-foreground hover:bg-popover focus:ring-2 focus:ring-ring/50"
									>
										<SelectValue placeholder="Use default voice" />
									</SelectTrigger>
									<SelectContent
										align="start"
										avoidCollisions={false}
										className="z-50 bg-popover/95 text-popover-foreground border border-border shadow-xl backdrop-blur"
										position="popper"
										side="bottom"
										sideOffset={4}
									>
										<SelectItem
											className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent"
											value="__DEFAULT__"
										>
											Use avatar default voice
										</SelectItem>
										{voiceOptions.map((option) => (
											<SelectItem
												key={option.value}
												className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent data-[state=checked]:bg-accent"
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
										{voiceOptions.length === 0 && (
											<div className="px-3 py-2 text-xs text-muted-foreground">
												{isLoadingVoiceOptions
													? "Loading LiveAvatar voices..."
													: "No LiveAvatar voices returned"}
											</div>
										)}
									</SelectContent>
								</Select>
								<Button
									aria-label={
										isVoicePreviewPlaying
											? "Pause voice preview"
											: "Play voice preview"
									}
									className="h-10 w-10 shrink-0 border-border bg-background/70 p-0 text-foreground hover:bg-muted"
									disabled={!selectedVoicePreviewUrl}
									size="icon"
									type="button"
									variant="outline"
									onClick={toggleVoicePreview}
								>
									{isVoicePreviewPlaying ? (
										<Pause className="h-4 w-4" aria-hidden="true" />
									) : (
										<Play className="h-4 w-4" aria-hidden="true" />
									)}
								</Button>
							</div>
							{selectedVoiceId && !selectedVoicePreviewUrl ? (
								<div className="text-xs text-muted-foreground">
									No preview audio returned for this voice.
								</div>
							) : null}
						</div>
						<div className="mt-3 flex flex-col gap-2">
							<label
								className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
								htmlFor={contextSelectId}
							>
								<span>Knowledge Base / Context</span>
								<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-destructive">
									Required
								</span>
							</label>
							<Select
								value={knowledgeBaseId || "__NONE__"}
								onValueChange={(value) => {
									onKnowledgeBaseChange(value === "__NONE__" ? "" : value);
								}}
							>
								<SelectTrigger
									id={contextSelectId}
									className="bg-popover/90 border-border text-popover-foreground hover:bg-popover focus:ring-2 focus:ring-ring/50"
								>
									<SelectValue placeholder="Use default context" />
								</SelectTrigger>
								<SelectContent
									align="start"
									avoidCollisions={false}
									className="z-50 bg-popover/95 text-popover-foreground border border-border shadow-xl backdrop-blur"
									position="popper"
									side="bottom"
									sideOffset={4}
								>
									<SelectItem
										className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent"
										value="__NONE__"
									>
										Select a context
									</SelectItem>
									{contextOptions.map((option) => (
										<SelectItem
											key={option.value}
											className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent data-[state=checked]:bg-accent"
											value={option.value}
										>
											{option.label}
										</SelectItem>
									))}
									{contextOptions.length === 0 && (
										<div className="px-3 py-2 text-xs text-muted-foreground">
											{isLoadingContextOptions
												? "Loading LiveAvatar contexts..."
												: "No LiveAvatar contexts returned"}
										</div>
									)}
								</SelectContent>
							</Select>
							<Input
								id={kbInputId}
								placeholder="Or paste LiveAvatar context_id"
								value={knowledgeBaseId}
								onChange={onKnowledgeBaseChange}
							/>
							{knowledgeBaseId ? (
								kbIdValid ? (
									<div className="text-primary text-xs">
										Context ID format looks good
									</div>
								) : (
									<div className="text-destructive text-xs">
										LiveAvatar context_id must be a UUID
									</div>
								)
							) : (
								<div className="text-muted-foreground text-xs">
									LiveAvatar embed sessions require a context_id.
								</div>
							)}
						</div>
						<div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-xs">
							<div className="mb-2 font-medium text-foreground">
								Required before Start Session
							</div>
							<div className="grid gap-1.5 text-muted-foreground">
								<div className="flex items-center justify-between gap-3">
									<span>Avatar selected</span>
									<span
										className={
											isAvatarValid ? "text-primary" : "text-destructive"
										}
									>
										{isAvatarValid ? "Ready" : "Required"}
									</span>
								</div>
								<div className="flex items-center justify-between gap-3">
									<span>LiveAvatar context_id</span>
									<span
										className={
											isContextValid ? "text-primary" : "text-destructive"
										}
									>
										{isContextValid ? "Ready" : "Required"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between gap-2">
				<Button
					className="border-border bg-background/70 text-foreground hover:bg-muted"
					disabled={!canStartTextChat}
					size="sm"
					variant="outline"
					onClick={onStartWithoutAvatar}
				>
					Start Text Chat
				</Button>
				<div className="relative inline-flex overflow-hidden rounded-md">
					{isStartDisabled ? (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="inline-flex">
										<Button
											disabled
											className="bg-secondary text-secondary-foreground"
											size="sm"
											variant="secondary"
											onClick={triggerStart}
										>
											{isConnecting ? "Connecting..." : "Start Session"}
										</Button>
									</span>
								</TooltipTrigger>
								<TooltipContent side="top">
									{isConnecting
										? "Connecting to avatar..."
										: "Select a LiveAvatar UUID avatar and context_id first."}
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<Button
							className="bg-secondary text-secondary-foreground"
							disabled={isConnecting}
							size="sm"
							variant="secondary"
							onClick={triggerStart}
						>
							{isConnecting ? "Connecting..." : "Start Session"}
						</Button>
					)}
					<BorderBeam borderWidth={2} duration={8} size={80} />
				</div>
			</CardFooter>
			<BorderBeam borderWidth={2} duration={8} initialOffset={10} size={120} />
			<BorderBeam
				reverse
				borderWidth={2}
				duration={10}
				initialOffset={60}
				size={160}
			/>
		</Card>
	);
}
