"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

type ReasoningContextType = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
};

const ReasoningContext = createContext<ReasoningContextType | undefined>(
	undefined,
);

function useReasoningContext() {
	const context = useContext(ReasoningContext);

	if (!context) {
		throw new Error(
			"useReasoningContext must be used within a Reasoning provider",
		);
	}

	return context;
}

export type ReasoningProps = {
	children: React.ReactNode;
	className?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	isStreaming?: boolean;
};

function Reasoning({
	children,
	className,
	open,
	onOpenChange,
	isStreaming,
}: ReasoningProps) {
	const [internalOpen, setInternalOpen] = useState(false);

	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const handleOpenChange = (newOpen: boolean) => {
		if (!isControlled) {
			setInternalOpen(newOpen);
		}
		onOpenChange?.(newOpen);
	};

	useEffect(() => {
		if (isStreaming && !isOpen) {
			handleOpenChange(true);
		}
	}, [isOpen, isStreaming]);

	return (
		<ReasoningContext.Provider
			value={{
				isOpen,
				onOpenChange: handleOpenChange,
			}}
		>
			<div className={className}>{children}</div>
		</ReasoningContext.Provider>
	);
}

export type ReasoningTriggerProps = {
	children: React.ReactNode;
	className?: string;
} & React.HTMLAttributes<HTMLButtonElement>;

function ReasoningTrigger({
	children,
	className,
	...props
}: ReasoningTriggerProps) {
	const { isOpen, onOpenChange } = useReasoningContext();

	return (
		<button
			className={cn(
				"flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-sm hover:bg-accent hover:text-accent-foreground",
				className,
			)}
			onClick={() => onOpenChange(!isOpen)}
			{...props}
		>
			<span className="text-primary">{children}</span>
		</button>
	);
}

export type ReasoningContentProps = {
	children: React.ReactNode;
	className?: string;
	markdown?: boolean;
	contentClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

function ReasoningContent({
	children,
	className,
	contentClassName,
	markdown = false,
	...props
}: ReasoningContentProps) {
	const { isOpen } = useReasoningContext();

	return isOpen ? (
		<div
			className={cn(
				"overflow-hidden rounded-md border border-border bg-card p-2 text-muted-foreground",
				className,
				contentClassName,
			)}
			{...props}
		>
			{markdown && typeof children === "string" ? (
				<Markdown showHeader={false}>{children}</Markdown>
			) : (
				children
			)}
		</div>
	) : null;
}

export { Reasoning, ReasoningContent, ReasoningTrigger };
