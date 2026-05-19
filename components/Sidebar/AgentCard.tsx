"use client";

import { Eye, Star, StarOff, X } from "lucide-react";
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
						<Star className="size-4" />
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

			{/* Clickable content */}
			<button
				aria-label={`Open ${name}`}
				className="flex h-full min-h-0 flex-col text-left"
				onClick={() => onOpen?.(agent)}
				type="button"
			>
				{/* Media */}
				<div className="flex h-14 shrink-0 items-center justify-center bg-muted/40 sm:h-16">
					{avatarUrl ? (
						<img
							alt={name}
							className="h-full w-full object-cover"
							src={avatarUrl}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
							{name?.substring(0, 1).toUpperCase()}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="min-h-0 flex-1 space-y-1 px-2 py-2 text-xs">
					<div className="flex items-center gap-1">
						<span className="truncate font-medium" title={name}>
							{name}
						</span>
						{role && (
							<span
								className="ml-auto truncate text-muted-foreground"
								title={role}
							>
								{role}
							</span>
						)}
					</div>
					{description && (
						<p className="line-clamp-1 text-[0.7rem] leading-snug text-muted-foreground">
							{description}
						</p>
					)}
					{abilities.length > 0 && (
						<TooltipProvider delayDuration={200}>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex flex-wrap gap-1 overflow-visible">
										{visibleAbilities.map((ability) => (
											<span
												key={ability}
												className="max-w-full truncate rounded border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 text-[0.62rem] leading-tight text-violet-700 dark:text-violet-300"
											>
												{ability}
											</span>
										))}
									</div>
								</TooltipTrigger>
								<TooltipContent
									side="right"
									align="start"
									className="z-[10000] max-w-64 text-xs"
								>
									<div className="font-medium">MCP abilities</div>
									<div className="mt-1 flex flex-wrap gap-1">
										{abilities.map((ability) => (
											<span
												key={ability}
												className="rounded border border-border bg-muted px-1.5 py-0.5"
											>
												{ability}
											</span>
										))}
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					)}
					{modalities.length > 0 && (
						<div className="flex flex-wrap gap-1">
							{modalities.map((modality) => (
								<span
									key={modality}
									className="truncate rounded border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 text-[0.62rem] uppercase leading-tight text-emerald-700 dark:text-emerald-300"
								>
									{modality}
								</span>
							))}
						</div>
					)}
					{promptStarter && (
						<div
							className="truncate rounded bg-muted px-1.5 py-1 text-[0.68rem] text-muted-foreground"
							title={promptStarter}
						>
							{promptStarter}
						</div>
					)}
				</div>
			</button>
		</div>
	);
}
