"use client";

import { Eye, Star, StarOff, X } from "lucide-react";
import React from "react";

export type AgentMonetizationSummary = {
	baseRate: number;
	usagePerMonth: number;
	usageLabel: string;
	multiplier: number;
	projectedMonthly: number;
	currency: string;
	profileLabel: string;
};

export type Agent = {
	id: string;
	name: string;
	avatarUrl?: string;
	role?: string;
	description?: string;
	tags?: string[];
	isOwnedByUser?: boolean;
	monetize?: boolean;
	rateMultiplier?: number;
	monetizationSummary?: AgentMonetizationSummary;
};

export default function AgentCard(props: {
	agent: Agent;
	onOpen?: (agent: Agent) => void;
	onFavorite?: (id: string, next: boolean) => void;
	onDelete?: (id: string) => void;
	isFavorite?: boolean;
}) {
	const { agent, onOpen, onFavorite, onDelete, isFavorite } = props;
	const { id, name, avatarUrl, role, isOwnedByUser } = agent;

	return (
		<div
			className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-background"
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
				className="text-left"
				onClick={() => onOpen?.(agent)}
				type="button"
			>
				{/* Media */}
				<div className="flex aspect-video items-center justify-center bg-muted/40">
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
				<div className="flex items-center gap-1 px-2 py-1 text-xs">
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
			</button>
		</div>
	);
}
