"use client";

import { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type PromptSuggestionProps = {
	children: React.ReactNode;
	variant?: VariantProps<typeof buttonVariants>["variant"];
	size?: VariantProps<typeof buttonVariants>["size"];
	className?: string;
	highlight?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function PromptSuggestion({
	children,
	variant,
	size,
	className,
	highlight,
	...props
}: PromptSuggestionProps) {
	const isHighlightMode = highlight !== undefined && highlight.trim() !== "";
	const content = typeof children === "string" ? children : "";
	const needsTooltip = content.length > 48 || content.includes("\n");

	const renderButton = (extraClassName?: string) => (
		<Button
			className={cn("rounded-full", extraClassName ?? className)}
			size={size || "lg"}
			title={content || undefined}
			variant={variant || "outline"}
			{...props}
		>
			{children}
		</Button>
	);

	if (!isHighlightMode) {
		if (!needsTooltip) return renderButton();
		return (
			<TooltipProvider delayDuration={150}>
				<Tooltip>
					<TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
					<TooltipContent className="max-w-sm whitespace-pre-wrap text-xs">
						{content}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	if (!content) {
		return renderButton(
			cn(
				"w-full cursor-pointer justify-start rounded-xl py-2",
				"hover:bg-accent",
				className,
			),
		);
	}

	const trimmedHighlight = highlight.trim();
	const contentLower = content.toLowerCase();
	const highlightLower = trimmedHighlight.toLowerCase();
	const shouldHighlight = contentLower.includes(highlightLower);

	const button = (
		<Button
			className={cn(
				"w-full cursor-pointer justify-start gap-0 rounded-xl py-2",
				"hover:bg-accent",
				className,
			)}
			size={size || "sm"}
			title={content}
			variant={variant || "ghost"}
			{...props}
		>
			{shouldHighlight ? (
				(() => {
					const index = contentLower.indexOf(highlightLower);

					if (index === -1)
						return (
							<span className="text-muted-foreground whitespace-pre-wrap">
								{content}
							</span>
						);

					const actualHighlightedText = content.substring(
						index,
						index + highlightLower.length,
					);

					const before = content.substring(0, index);
					const after = content.substring(index + actualHighlightedText.length);

					return (
						<span>
							{before && (
								<span className="text-muted-foreground whitespace-pre-wrap">
									{before}
								</span>
							)}
							<span className="text-primary font-medium whitespace-pre-wrap">
								{actualHighlightedText}
							</span>
							{after && (
								<span className="text-muted-foreground whitespace-pre-wrap">
									{after}
								</span>
							)}
						</span>
					);
				})()
			) : (
				<span className="text-muted-foreground whitespace-pre-wrap">
					{content}
				</span>
			)}
		</Button>
	);

	if (!needsTooltip) return button;

	return (
		<TooltipProvider delayDuration={150}>
			<Tooltip>
				<TooltipTrigger asChild>{button}</TooltipTrigger>
				<TooltipContent className="max-w-sm whitespace-pre-wrap text-xs">
					{content}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

export { PromptSuggestion };
