"use client";

import React, { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

import { cn } from "@/lib/utils";

export type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

function CodeBlock({ children, className, ...props }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "not-prose flex w-full flex-col border overflow-hidden",
        "border-border bg-card text-card-foreground rounded-xl",
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
  theme = "github-light",
  className,
  ...props
}: CodeBlockCodeProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>");

        return;
      }

      const html = await codeToHtml(code, { lang: language, theme });

      setHighlightedHtml(html);
    }
    highlight();
  }, [code, language, theme]);

  const classNames = cn(
    [
      "w-full overflow-x-auto text-[13px]",
      // Ensure pre has padding and no margin; container manages rounding
      "[&>pre]:px-4 [&>pre]:py-4 [&>pre]:m-0",
      // Do not wrap code lines; allow horizontal scroll on pre & code
      "[&>pre]:whitespace-pre [&>pre]:overflow-x-auto",
      "[&>pre>code]:whitespace-pre [&>pre>code]:block",
    ].join(" "),
    className,
  );

  // SSR fallback: render plain code if not hydrated yet
  return highlightedHtml ? (
    <div
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      className={classNames}
      {...props}
    />
  ) : (
    <div className={classNames} {...props}>
      <pre>
        <code>{code}</code>
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
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CodeBlockGroup, CodeBlockCode, CodeBlock };
