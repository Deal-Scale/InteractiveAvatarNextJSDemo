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
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronDown, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Option } from "../../data/options";
import type { AvatarOption } from "../AvatarConfig/hooks/useAvatarOptions";

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

type VideoSelectKey = "avatar" | "voice" | "context";

type VideoSetupSelectOption = {
	label: string;
	value: string;
};

interface VideoSetupSelectProps {
	className?: string;
	id?: string;
	onOpenChange: (open: boolean) => void;
	onValueChange: (value: string) => void;
	open: boolean;
	options: VideoSetupSelectOption[];
	placeholder: string;
	value: string;
}

const VIDEO_SELECT_STYLE = {
	backgroundColor: "#020617",
	borderColor: "#334155",
	color: "#f8fafc",
} as const;

function cx(...classes: Array<false | null | string | undefined>) {
	return classes.filter(Boolean).join(" ");
}

function VideoSetupSelect({
	className,
	id,
	onOpenChange,
	onValueChange,
	open,
	options,
	placeholder,
	value,
}: VideoSetupSelectProps) {
	const generatedListId = useId();
	const listId = `${id ?? generatedListId}-menu`;
	const selectedOption = options.find((option) => option.value === value);

	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onOpenChange(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onOpenChange, open]);

	return (
		<div className={cx("relative w-full", className)}>
			<button
				aria-controls={listId}
				aria-expanded={open}
				className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-left text-slate-50 text-sm shadow-sm outline-none transition hover:bg-slate-900 focus:ring-2 focus:ring-ring/50"
				data-video-select-anchor="true"
				id={id}
				style={VIDEO_SELECT_STYLE}
				type="button"
				onClick={() => onOpenChange(!open)}
			>
				<span className="min-w-0 flex-1 truncate">
					{selectedOption?.label ?? placeholder}
				</span>
				<ChevronDown
					aria-hidden="true"
					className={cx("h-4 w-4 shrink-0 opacity-70", open && "rotate-180")}
				/>
			</button>
			{open ? (
				<div
					className="absolute top-[calc(100%+0.25rem)] right-0 left-0 z-[10000] max-h-64 overflow-y-auto rounded-md border p-1 shadow-2xl"
					data-video-select-surface="true"
					id={listId}
					style={VIDEO_SELECT_STYLE}
				>
					{options.map((option) => {
						const selected = option.value === value;
						return (
							<button
								aria-pressed={selected}
								className={cx(
									"flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-slate-50 text-sm outline-none transition hover:bg-slate-800 focus:bg-slate-800",
									selected && "bg-slate-800",
								)}
								key={option.value}
								style={{ backgroundColor: selected ? "#1e293b" : "#020617" }}
								type="button"
								onClick={() => {
									onValueChange(option.value);
									onOpenChange(false);
								}}
							>
								<span className="min-w-0 flex-1 truncate">{option.label}</span>
								{selected ? (
									<Check aria-hidden="true" className="h-4 w-4 shrink-0" />
								) : null}
							</button>
						);
					})}
				</div>
			) : null}
		</div>
	);
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
	const cardRef = useRef<HTMLDivElement | null>(null);
	const [playingVoicePreview, setPlayingVoicePreview] = useState<string | null>(
		null,
	);
	const [openSelect, setOpenSelect] = useState<VideoSelectKey | null>(null);

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
	const avatarSelectOptions =
		avatarOptions.length > 0
			? avatarOptions.map((option) => ({
					label: option.name,
					value: option.avatar_id,
				}))
			: [{ label: "Paste Avatar UUID", value: "CUSTOM" }];
	const voiceSelectOptions = [
		{ label: "Use avatar default voice", value: "__DEFAULT__" },
		...voiceOptions.map((option) => ({
			label: option.label,
			value: option.value,
		})),
	];
	const contextSelectOptions = [
		{ label: "Select a context", value: "__NONE__" },
		...contextOptions.map((option) => ({
			label: option.label,
			value: option.value,
		})),
	];

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

	useEffect(() => {
		if (!openSelect) return;

		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (
				target.closest("[data-video-select-anchor='true']") ||
				target.closest("[data-video-select-surface='true']")
			) {
				return;
			}
			setOpenSelect(null);
		};

		document.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [openSelect]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		window.dispatchEvent(
			new CustomEvent("deal-scale:video-select-open", {
				detail: { open: Boolean(openSelect) },
			}),
		);

		return () => {
			window.dispatchEvent(
				new CustomEvent("deal-scale:video-select-open", {
					detail: { open: false },
				}),
			);
		};
	}, [openSelect]);

	return (
		<Card
			ref={cardRef}
			className="relative w-[360px] overflow-visible border-border bg-card/80 backdrop-blur"
		>
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
							className="flex items-center justify-between gap-2 text-muted-foreground text-sm"
							htmlFor={avatarSelectId}
						>
							<span>Avatar</span>
							<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-medium text-[10px] text-destructive uppercase tracking-wide">
								Required
							</span>
						</label>
						<VideoSetupSelect
							id={avatarSelectId}
							open={openSelect === "avatar"}
							options={avatarSelectOptions}
							placeholder="Select an avatar"
							value={selectedAvatar}
							onOpenChange={(nextOpen) =>
								setOpenSelect(nextOpen ? "avatar" : null)
							}
							onValueChange={onSelectAvatar}
						/>
						{avatarOptions.length === 0 && !isLoadingAvatarOptions ? (
							<div className="text-muted-foreground text-xs">
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
										<div className="mt-1 text-primary text-xs">
											Avatar UUID format looks good
										</div>
									) : (
										<div className="mt-1 text-destructive text-xs">
											LiveAvatar avatar_id must be a UUID
										</div>
									)
								) : null}
							</div>
						)}
						<div className="mt-3 flex flex-col gap-2">
							<label
								className="flex items-center justify-between gap-2 text-muted-foreground text-sm"
								htmlFor={voiceSelectId}
							>
								<span>Voice</span>
								<span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
									Optional
								</span>
							</label>
							<div className="flex gap-2">
								<VideoSetupSelect
									id={voiceSelectId}
									open={openSelect === "voice"}
									options={voiceSelectOptions}
									placeholder="Use default voice"
									value={selectedVoiceId || "__DEFAULT__"}
									onOpenChange={(nextOpen) =>
										setOpenSelect(nextOpen ? "voice" : null)
									}
									onValueChange={(value) => {
										stopVoicePreview();
										onSelectVoice?.(value === "__DEFAULT__" ? "" : value);
									}}
								/>
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
							{voiceOptions.length === 0 ? (
								<div className="text-muted-foreground text-xs">
									{isLoadingVoiceOptions
										? "Loading LiveAvatar voices..."
										: "No LiveAvatar voices returned"}
								</div>
							) : null}
							{selectedVoiceId && !selectedVoicePreviewUrl ? (
								<div className="text-muted-foreground text-xs">
									No preview audio returned for this voice.
								</div>
							) : null}
						</div>
						<div className="mt-3 flex flex-col gap-2">
							<label
								className="flex items-center justify-between gap-2 text-muted-foreground text-sm"
								htmlFor={contextSelectId}
							>
								<span>Knowledge Base / Context</span>
								<span className="rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 font-medium text-[10px] text-destructive uppercase tracking-wide">
									Required
								</span>
							</label>
							<VideoSetupSelect
								id={contextSelectId}
								open={openSelect === "context"}
								options={contextSelectOptions}
								placeholder="Use default context"
								value={knowledgeBaseId || "__NONE__"}
								onOpenChange={(nextOpen) =>
									setOpenSelect(nextOpen ? "context" : null)
								}
								onValueChange={(value) => {
									onKnowledgeBaseChange(value === "__NONE__" ? "" : value);
								}}
							/>
							{contextOptions.length === 0 ? (
								<div className="text-muted-foreground text-xs">
									{isLoadingContextOptions
										? "Loading LiveAvatar contexts..."
										: "No LiveAvatar contexts returned"}
								</div>
							) : null}
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
