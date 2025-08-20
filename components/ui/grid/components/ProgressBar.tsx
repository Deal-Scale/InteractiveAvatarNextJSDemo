"use client";
import React from "react";

export function ProgressBar({ active }: { active: boolean }) {
	if (!active) return null;
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
		>
			<div className="h-full w-1/3 animate-pulse rounded-r bg-muted-foreground/40" />
		</div>
	);
}
