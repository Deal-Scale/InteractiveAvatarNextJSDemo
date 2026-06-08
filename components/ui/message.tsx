import * as React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

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
}: MessageAvatarProps) => (
	<Avatar className={cn("h-8 w-8 shrink-0", className)}>
		<AvatarImage alt={alt} src={src} />
		{fallback && <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>}
	</Avatar>
);

export type MessageContentProps = {
	children: React.ReactNode;
	markdown?: boolean;
	className?: string;
	showHeader?: boolean;
	headerLabel?: string;
} & React.HTMLProps<HTMLDivElement>;

const MessageContent = ({
	children,
	className,
	headerLabel,
	markdown = false,
	showHeader = false,
	...props
}: MessageContentProps) => {
	const contentClassName = cn(
		"min-w-0 max-w-full overflow-visible break-words whitespace-normal rounded-lg bg-secondary p-2 leading-relaxed text-foreground",
		className,
	);

	if (markdown && typeof children === "string") {
		return (
			<Markdown
				className={contentClassName}
				headerLabel={headerLabel}
				showHeader={showHeader}
				{...props}
			>
				{children}
			</Markdown>
		);
	}

	return (
		<div className={contentClassName} {...props}>
			{children}
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
		className={cn("flex items-center gap-2 text-muted-foreground", className)}
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
}: MessageActionProps) => (
	<TooltipProvider>
		<Tooltip {...props}>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent className={className} side={side}>
				{tooltip}
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

export { Message, MessageAction, MessageActions, MessageAvatar, MessageContent };
