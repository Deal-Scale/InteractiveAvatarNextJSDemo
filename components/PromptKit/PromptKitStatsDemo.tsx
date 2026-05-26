"use client";

import React from "react";
import { StatBadge } from "./StatBadge";

export type PromptKitStatsDemoProps = {
	variant?: "tokens-latency" | "accuracy-score";
	className?: string;
};

// Custom PromptKit stats demo component to replace inline JSX strings
export function PromptKitStatsDemo({
	variant = "tokens-latency",
	className,
}: PromptKitStatsDemoProps) {
	if (variant === "tokens-latency") {
		return (
			<div className={`flex items-center gap-2 ${className || ""}`}>
				<StatBadge label="Tokens" value="1,234" hint="used" />
				<StatBadge label="Latency" value="142ms" />
			</div>
		);
	}

	if (variant === "accuracy-score") {
		return (
			<div className={`flex items-center gap-2 ${className || ""}`}>
				<StatBadge label="Accuracy" value="98%" />
				<StatBadge label="Score" value="A" hint="model" />
			</div>
		);
	}

	return null;
}
