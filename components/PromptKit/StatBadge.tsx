"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatBadgeProps = {
	label: string;
	value: string | number;
	hint?: string;
	className?: string;
};

// Simple PromptKit-like stat badge to showcase custom JSX rendering in messages
export function StatBadge({ label, value, hint, className }: StatBadgeProps) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-card-foreground shadow-sm",
				className,
			)}
		>
			<span className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</span>
			<span className="text-base font-semibold">{value}</span>
			{hint ? (
				<span className="text-xs text-muted-foreground/80">{hint}</span>
			) : null}
		</div>
	);
}
