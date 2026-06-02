"use client";

import React from "react";

import { cn } from "@/lib/utils";

export type CodeBlockProps = {
	children?: React.ReactNode;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
	return (
		<div
			className={cn(
				"not-prose flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export type CodeBlockCodeProps = {
	code: string;
	language?: string;
	theme?: string;
	className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlockCode({
	code,
	language = "tsx",
	className,
	...props
}: CodeBlockCodeProps) {
	return (
		<div
			className={cn(
				"w-full overflow-x-auto text-[13px] [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:px-4 [&>pre]:py-4 [&>pre]:whitespace-pre [&>pre>code]:block [&>pre>code]:whitespace-pre",
				className,
			)}
			{...props}
		>
			<pre>
				<code data-language={language}>{code}</code>
			</pre>
		</div>
	);
}

export type CodeBlockGroupProps = React.HTMLAttributes<HTMLDivElement>;

function CodeBlockGroup({
	children,
	className,
	...props
}: CodeBlockGroupProps) {
	return (
		<div className={cn("flex items-center justify-between", className)} {...props}>
			{children}
		</div>
	);
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
