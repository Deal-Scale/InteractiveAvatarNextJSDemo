import type { AvatarOption } from "@/components/AvatarConfig/hooks/useAvatarOptions";
import { Input } from "@/components/Input";
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
import { useId } from "react";

interface SessionQuickStartCardProps {
	avatarOptions: AvatarOption[];
	selectedAvatar: string;
	customAvatarId: string;
	knowledgeBaseId: string;
	kbIdValid: boolean;
	customIdValid: boolean;
	isConnecting: boolean;
	onSelectAvatar: (value: string) => void;
	onCustomAvatarChange: (value: string) => void;
	onKnowledgeBaseChange: (value: string) => void;
	onStartSession: (options: {
		avatarId?: string;
		knowledgeBaseId?: string;
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
	selectedAvatar,
	customAvatarId,
	knowledgeBaseId,
	kbIdValid,
	customIdValid,
	isConnecting,
	onSelectAvatar,
	onCustomAvatarChange,
	onKnowledgeBaseChange,
	onStartSession,
	onStartWithoutAvatar,
}: SessionQuickStartCardProps) {
	const avatarSelectId = useId();
	const kbInputId = useId();

	const finalAvatarId =
		selectedAvatar === "CUSTOM" ? customAvatarId.trim() : selectedAvatar;
	const finalKnowledgeId = knowledgeBaseId.trim() || undefined;
	const isStartDisabled =
		isConnecting ||
		!finalAvatarId ||
		(selectedAvatar === "CUSTOM" &&
			(!customAvatarId.trim() || !customIdValid)) ||
		(finalKnowledgeId && !kbIdValid);

	const triggerStart = () => {
		onStartSession({
			avatarId: finalAvatarId,
			knowledgeBaseId: finalKnowledgeId,
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
							className="text-sm text-muted-foreground"
							htmlFor={avatarSelectId}
						>
							Avatar
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
								<SelectItem
									className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent"
									value="CUSTOM"
								>
									Custom Avatar ID
								</SelectItem>
							</SelectContent>
						</Select>
						{selectedAvatar === "CUSTOM" && (
							<div className="mt-2">
								<Input
									placeholder="Enter custom agent ID"
									value={customAvatarId}
									onChange={onCustomAvatarChange}
								/>
								{customAvatarId ? (
									customIdValid ? (
										<div className="text-primary text-xs mt-1">
											Agent ID found
										</div>
									) : (
										<div className="text-destructive text-xs mt-1">
											Agent ID not found in available avatars
										</div>
									)
								) : null}
							</div>
						)}
						<div className="mt-3 flex flex-col gap-2">
							<label
								className="text-sm text-muted-foreground"
								htmlFor={kbInputId}
							>
								Knowledge Base ID (optional)
							</label>
							<Input
								id={kbInputId}
								placeholder="Enter knowledge base ID (if any)"
								value={knowledgeBaseId}
								onChange={onKnowledgeBaseChange}
							/>
							{knowledgeBaseId ? (
								kbIdValid ? (
									<div className="text-primary text-xs">
										Knowledge Base ID format looks good
									</div>
								) : (
									<div className="text-destructive text-xs">
										Invalid Knowledge Base ID format
									</div>
								)
							) : null}
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex justify-between gap-2">
				<Button
					className="border-border bg-background/70 text-foreground hover:bg-muted"
					size="sm"
					variant="outline"
					onClick={onStartWithoutAvatar}
				>
					Start without avatar
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
										: "Set up your agent and settings first"}
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
