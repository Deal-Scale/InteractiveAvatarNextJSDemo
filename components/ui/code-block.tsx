"use client";

import React, { useEffect, useState } from "react";

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

function normalizeShikiLanguage(language: string) {
	const normalized = language.toLowerCase();
	const aliases: Record<string, string> = {
		cjs: "javascript",
		js: "javascript",
		mjs: "javascript",
		py: "python",
		sh: "bash",
		shell: "bash",
		ts: "typescript",
	};

	return aliases[normalized] ?? normalized;
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
	theme = "github-dark",
	className,
	...props
}: CodeBlockCodeProps) {
	const [highlightedHtml, setHighlightedHtml] = useState("");

	useEffect(() => {
		let cancelled = false;

		import("shiki")
			.then(({ codeToHtml }) =>
				codeToHtml(code, {
					lang: normalizeShikiLanguage(language || "text"),
					theme,
				}),
			)
			.then((html) => {
				if (!cancelled) setHighlightedHtml(html);
			})
			.catch(() => {
				if (!cancelled) setHighlightedHtml("");
			});

		return () => {
			cancelled = true;
		};
	}, [code, language, theme]);

	return (
		<div
			className={cn(
				"w-full overflow-x-auto text-[13px] [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:!bg-transparent [&>pre]:px-4 [&>pre]:py-4 [&>pre]:whitespace-pre [&>pre>code]:block [&>pre>code]:whitespace-pre",
				className,
			)}
			{...props}
		>
			{highlightedHtml ? (
				<div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
			) : (
				<pre>
					<code data-language={language}>{code}</code>
				</pre>
			)}
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
		<div
			className={cn("flex items-center justify-between", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { CodeBlock, CodeBlockCode, CodeBlockGroup };
