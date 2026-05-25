import { Eye, MessageSquare, Mic, Star, StarOff, Video, X } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AgentConfig } from "@/lib/schemas/agent";

export type Agent = Partial<AgentConfig> & {
	id: string;
	name: string;
	avatarUrl?: string;
	role?: string;
	description?: string;
	tags?: string[];
	abilities?: string[];
	modalities?: Array<"video" | "chat" | "voice">;
	sessionType?: "text" | "voice" | "video" | "all";
	interactionModes?: Array<"text" | "voice" | "video">;
	promptStarter?: string;
	isOwnedByUser?: boolean;
};

const getGradientByName = (name: string) => {
	const gradients = [
		"from-indigo-500 to-purple-600",
		"from-blue-500 to-teal-500",
		"from-emerald-500 to-green-600",
		"from-orange-500 to-red-600",
		"from-pink-500 to-rose-600",
		"from-violet-600 to-purple-800",
	];
	let hash = 0;
	if (name) {
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
	}
	const index = Math.abs(hash) % gradients.length;
	return gradients[index];
};

export default function AgentCard(props: {
	agent: Agent;
	onOpen?: (agent: Agent) => void;
	onFavorite?: (id: string, next: boolean) => void;
	onDelete?: (id: string) => void;
	isFavorite?: boolean;
	visibleAbilityCount?: number;
}) {
	const {
		agent,
		onOpen,
		onFavorite,
		onDelete,
		isFavorite,
		visibleAbilityCount = 3,
	} = props;
	const {
		id,
		name,
		avatarUrl,
		role,
		description,
		abilities = [],
		modalities = [],
		promptStarter,
		isOwnedByUser,
	} = agent;
	const visibleAbilities = abilities.slice(0, visibleAbilityCount);

	return (
		<div
			className="group relative flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-background"
			title={name}
		>
			{/* Actions */}
			<div className="absolute right-1 top-1 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				<button
					aria-label="Open agent"
					className="rounded bg-background/80 p-1 hover:bg-background"
					onClick={(e) => {
						e.stopPropagation();
						onOpen?.(agent);
					}}
					type="button"
				>
					<Eye className="size-4" />
					<span className="sr-only">Open</span>
				</button>
				<button
					aria-label={isFavorite ? "Unfavorite agent" : "Favorite agent"}
					className="rounded bg-background/80 p-1 hover:bg-background"
					onClick={(e) => {
						e.stopPropagation();
						onFavorite?.(id, !isFavorite);
					}}
					type="button"
				>
					{isFavorite ? (
						<Star className="size-4 fill-yellow-400 text-yellow-500" />
					) : (
						<StarOff className="size-4" />
					)}
					<span className="sr-only">Favorite</span>
				</button>
				{isOwnedByUser && (
					<button
						aria-label="Delete agent"
						className="rounded bg-background/80 p-1 hover:bg-background"
						onClick={(e) => {
							e.stopPropagation();
							onDelete?.(id);
						}}
						type="button"
					>
						<X className="size-4" />
						<span className="sr-only">Delete</span>
					</button>
				)}
			</div>

			{/* Persistent Star for Favorite Agents (visible when not hovered) */}
			{isFavorite && (
				<div className="absolute right-1.5 top-1.5 z-[5] pointer-events-none transition-opacity group-hover:opacity-0 rounded-full bg-background/65 backdrop-blur-sm p-1 shadow-sm border border-border/20 flex items-center justify-center">
					<Star className="size-3 fill-yellow-400 text-yellow-500" />
				</div>
			)}

			{/* Clickable content */}
			<button
				aria-label={`Open ${name}`}
				className="flex h-full min-h-0 flex-col text-left"
				onClick={() => onOpen?.(agent)}
				type="button"
			>
				{/* Media */}
				<div className="flex h-14 shrink-0 items-center justify-center bg-muted/40 sm:h-16 w-full overflow-hidden">
					{avatarUrl ? (
						<img
							alt={name}
							className="h-full w-full object-cover"
							src={avatarUrl}
						/>
					) : (
						<div
							className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradientByName(name)} text-white font-semibold text-lg`}
						>
							{name?.substring(0, 1).toUpperCase()}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="min-h-0 flex-1 flex flex-col justify-between px-2 py-2 text-xs">
					<div className="min-w-0 space-y-1">
						{/* Name & Role (Vertical) */}
						<div className="min-w-0">
							<span
								className="block truncate font-semibold text-xs text-foreground leading-snug"
								title={name}
							>
								{name}
							</span>
							{role && (
								<span
									className="block truncate text-[0.62rem] text-muted-foreground font-medium"
									title={role}
								>
									{role}
								</span>
							)}
						</div>

						{/* Description */}
						{description && (
							<p
								className="line-clamp-2 text-[0.68rem] leading-snug text-muted-foreground"
								title={description}
							>
								{description}
							</p>
						)}
					</div>

					<div className="min-w-0 space-y-1.5 pt-1">
						{/* Badges (Abilities & Modalities side-by-side) */}
						<div className="flex items-center justify-between gap-1.5">
							{/* Abilities */}
							<div className="flex flex-wrap gap-1 min-w-0">
								{visibleAbilities.map((ability) => (
									<span
										key={ability}
										className="truncate rounded border border-violet-400/30 bg-violet-500/10 px-1 py-0.5 text-[0.6rem] font-medium leading-none text-violet-700 dark:text-violet-300"
										title={ability}
									>
										{ability}
									</span>
								))}
							</div>

							{/* Modalities */}
							{modalities.length > 0 && (
								<div className="flex shrink-0 items-center gap-1 rounded border border-emerald-400/20 bg-emerald-500/5 px-1 py-0.5 text-emerald-700 dark:text-emerald-300">
									{modalities.map((modality) => {
										if (modality === "chat") {
											return (
												<MessageSquare
													key="chat"
													aria-label="Chat"
													className="size-3"
												/>
											);
										}
										if (modality === "voice") {
											return (
												<Mic
													key="voice"
													aria-label="Voice"
													className="size-3"
												/>
											);
										}
										if (modality === "video") {
											return (
												<Video
													key="video"
													aria-label="Video"
													className="size-3"
												/>
											);
										}
										return null;
									})}
								</div>
							)}
						</div>

						{/* Prompt Starter */}
						{promptStarter && (
							<div
								className="truncate rounded bg-muted/65 hover:bg-muted/80 transition-colors px-1.5 py-0.5 text-[0.62rem] text-muted-foreground font-medium border border-border/30"
								title={promptStarter}
							>
								{promptStarter}
							</div>
						)}
					</div>
				</div>
			</button>
		</div>
	);
}
