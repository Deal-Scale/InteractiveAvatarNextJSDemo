"use client";

import React, { memo } from "react";

interface AuroraTextProps {
	children: React.ReactNode;
	className?: string;
	colors?: string[];
	speed?: number;
}

export const AuroraText = memo(
	({
		children,
		className = "",
		// Default to theme-driven aurora stops; can be overridden via props
		colors = [
			"hsl(var(--aurora-1))",
			"hsl(var(--aurora-2))",
			"hsl(var(--aurora-3))",
		],
		speed = 1,
	}: AuroraTextProps) => {
		const gradientStyle = {
			backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
			WebkitBackgroundClip: "text",
			WebkitTextFillColor: "transparent",
			animationDuration: `${10 / speed}s`,
		};

		return (
			<span className={`relative inline-block ${className}`}>
				<span className="sr-only">{children}</span>
				<span
					aria-hidden="true"
					className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
					style={gradientStyle}
				>
					{children}
				</span>
			</span>
		);
	},
);

AuroraText.displayName = "AuroraText";
