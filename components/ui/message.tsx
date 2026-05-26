import * as React from "react";
import { Markdown } from "./markdown";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type MessageProps = {
	children: React.ReactNode;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

const Message = ({ children, className, ...props }: MessageProps) => (
	<div className={cn("flex gap-3", className)} {...props}>
		{children}
	</div>
);

export type MessageAvatarProps = {
	src: string;
	alt: string;
	fallback?: string;
	delayMs?: number;
	className?: string;
};

const MessageAvatar = ({
	src,
	alt,
	fallback,
	delayMs,
	className,
}: MessageAvatarProps) => {
	return (
		<Avatar className={cn("h-8 w-8 shrink-0", className)}>
			<AvatarImage alt={alt} src={src} />
			{fallback && (
				<AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
			)}
		</Avatar>
	);
};

export type MessageContentProps = {
	children: React.ReactNode;
	markdown?: boolean;
	className?: string;
} & React.ComponentProps<typeof Markdown> &
	React.HTMLProps<HTMLDivElement>;

function formatTextWithBadges(
	text: string,
	isUserMessage = false,
): React.ReactNode {
	if (!text) return text;

	const regex =
		/(@(?:Sales Assistant|Support Bot|Content Analyst|Configured Agent|[^[\]@\s]+(?:\s+[^[\]@\s]+)*)|\[KB:[^[\]]+\]|\[Tool:[^[\]]+\]|\[Asset:[^[\]]+\])/g;

	const parts = [];
	let lastIndex = 0;
	let match;

	while ((match = regex.exec(text)) !== null) {
		const matchIndex = match.index;
		const matchText = match[0];

		if (matchIndex > lastIndex) {
			parts.push(text.substring(lastIndex, matchIndex));
		}

		const idx = parts.length;
		if (matchText.startsWith("@")) {
			const name = matchText.substring(1).trim();
			parts.push(
				<span
					key={`agent-${idx}`}
					className={cn(
						"inline-flex items-center gap-1 rounded px-1.5 py-0.5 mx-0.5 text-xs font-semibold border align-baseline transition-all",
						isUserMessage
							? "bg-white/20 text-white border-white/30 hover:bg-white/35"
							: "bg-indigo-50 text-indigo-700 border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-500/20",
					)}
				>
					🤖 {name}
				</span>,
			);
		} else if (matchText.startsWith("[KB:") && matchText.endsWith("]")) {
			const name = matchText.substring(4, matchText.length - 1).trim();
			parts.push(
				<span
					key={`kb-${idx}`}
					className={cn(
						"inline-flex items-center gap-1 rounded px-1.5 py-0.5 mx-0.5 text-xs font-semibold border align-baseline transition-all",
						isUserMessage
							? "bg-white/20 text-white border-white/30 hover:bg-white/35"
							: "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/20",
					)}
				>
					📚 {name}
				</span>,
			);
		} else if (matchText.startsWith("[Tool:") && matchText.endsWith("]")) {
			const name = matchText.substring(6, matchText.length - 1).trim();
			parts.push(
				<span
					key={`tool-${idx}`}
					className={cn(
						"inline-flex items-center gap-1 rounded px-1.5 py-0.5 mx-0.5 text-xs font-semibold border align-baseline transition-all",
						isUserMessage
							? "bg-white/20 text-white border-white/30 hover:bg-white/35"
							: "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20 hover:bg-amber-100/50 dark:hover:bg-amber-500/20",
					)}
				>
					🛠️ {name}
				</span>,
			);
		} else if (matchText.startsWith("[Asset:") && matchText.endsWith("]")) {
			const name = matchText.substring(7, matchText.length - 1).trim();
			parts.push(
				<span
					key={`asset-${idx}`}
					className={cn(
						"inline-flex items-center gap-1 rounded px-1.5 py-0.5 mx-0.5 text-xs font-semibold border align-baseline transition-all",
						isUserMessage
							? "bg-white/20 text-white border-white/30 hover:bg-white/35"
							: "bg-cyan-50 text-cyan-700 border-cyan-200/50 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20 hover:bg-cyan-100/50 dark:hover:bg-cyan-500/20",
					)}
				>
					📎 {name}
				</span>,
			);
		} else {
			parts.push(matchText);
		}

		lastIndex = regex.lastIndex;
	}

	if (lastIndex < text.length) {
		parts.push(text.substring(lastIndex));
	}

	return <>{parts}</>;
}

const MessageContent = ({
	children,
	markdown = false,
	className,
	...props
}: MessageContentProps) => {
	const classNames = cn(
		"rounded-lg p-2 text-foreground bg-secondary prose dark:prose-invert break-words whitespace-normal min-w-0 max-w-full overflow-visible leading-relaxed",
		"prose-p:my-2 first:prose-p:mt-0 last:prose-p:mb-0",
		className,
	);

	const {
		showHeader: _showHeader,
		headerLabel: _headerLabel,
		remarkPlugins: _remarkPlugins,
		rehypePlugins: _rehypePlugins,
		components: _mdxComponents,
		...divProps
	} = props as any;

	const isUserMessage = className?.includes("bg-primary");

	return markdown ? (
		<Markdown
			data-invoker="MessageContent"
			className={classNames}
			{...props}
			showHeader={_showHeader ?? false}
		>
			{children as string}
		</Markdown>
	) : (
		<div className={classNames} {...divProps}>
			{typeof children === "string"
				? formatTextWithBadges(children, isUserMessage)
				: children}
		</div>
	);
};

export type MessageActionsProps = {
	children: React.ReactNode;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

const MessageActions = ({
	children,
	className,
	...props
}: MessageActionsProps) => (
	<div
		className={cn("text-muted-foreground flex items-center gap-2", className)}
		{...props}
	>
		{children}
	</div>
);

export type MessageActionProps = {
	className?: string;
	tooltip: React.ReactNode;
	children: React.ReactNode;
	side?: "top" | "bottom" | "left" | "right";
} & React.ComponentProps<typeof Tooltip>;

const MessageAction = ({
	tooltip,
	children,
	className,
	side = "top",
	...props
}: MessageActionProps) => {
	return (
		<TooltipProvider>
			<Tooltip {...props}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent className={className} side={side}>
					{tooltip}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export {
	Message,
	MessageAvatar,
	MessageContent,
	MessageActions,
	MessageAction,
};
