"use client";

import type { Agent } from "./AgentCard";

export default function AgentPreview(props: { agent: Agent }) {
	const { agent } = props;
	const {
		name,
		avatarUrl,
		role,
		description,
		tags,
		abilities = [],
		modalities = [],
		promptStarter,
	} = agent;

	return (
		<div className="space-y-3">
			<div className="flex items-start gap-3">
				<div className="h-20 w-32 overflow-hidden rounded bg-muted/50">
					{avatarUrl ? (
						<img
							alt={name}
							className="h-full w-full object-cover"
							src={avatarUrl}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-muted-foreground">
							{name?.substring(0, 1).toUpperCase()}
						</div>
					)}
				</div>
				<div className="min-w-0">
					<div className="text-sm text-muted-foreground">{role || "Agent"}</div>
					{description && <p className="mt-1 text-sm">{description}</p>}
					{abilities.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1 text-xs">
							{abilities.map((ability) => (
								<span
									key={ability}
									className="rounded border border-violet-400/30 bg-violet-500/10 px-1.5 py-0.5 text-violet-700 dark:text-violet-300"
								>
									{ability}
								</span>
							))}
						</div>
					)}
					{modalities.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1 text-xs">
							{modalities.map((modality) => (
								<span
									key={modality}
									className="rounded border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-0.5 uppercase text-emerald-700 dark:text-emerald-300"
								>
									{modality}
								</span>
							))}
						</div>
					)}
					{promptStarter && (
						<div className="mt-2 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
							{promptStarter}
						</div>
					)}
					{tags && tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
							{tags.map((t) => (
								<span key={t} className="rounded bg-muted px-1.5 py-0.5">
									#{t}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
