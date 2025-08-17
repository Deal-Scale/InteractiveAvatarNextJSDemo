import { memo, useId } from "react";
import * as React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { CodeBlock, CodeBlockCode } from "./code-block";

import { cn } from "@/lib/utils";

export type MarkdownProps = {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
};

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);

  return match ? match[1] : "plaintext";
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line;

    if (isInline) {
      return (
        <span
          className={cn(
            "bg-primary-foreground rounded-sm px-1 font-mono text-sm",
            className,
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    const language = extractLanguage(className);
    const codeStr = String(children ?? "");
    const [copied, setCopied] = React.useState(false);

    const handleCopy = React.useCallback(async () => {
      try {
        await navigator.clipboard.writeText(codeStr);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch (e) {
        // noop
      }
    }, [codeStr]);

    const handleShare = React.useCallback(async () => {
      const payload = { title: "Code snippet", text: codeStr } as ShareData;
      try {
        if (navigator.share) {
          await navigator.share(payload);
        } else {
          await navigator.clipboard.writeText(codeStr);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }
      } catch (e) {
        // user cancelled or unsupported
      }
    }, [codeStr]);

    return (
      <CodeBlock className={className}>
        <div className="not-prose flex items-center justify-end gap-2 border-b border-border bg-muted/40 px-2 py-1">
          <button
            type="button"
            aria-label="Copy code"
            onClick={handleCopy}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-xs hover:bg-accent"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            aria-label="Share code"
            onClick={handleShare}
            className="rounded-md border border-border bg-background px-2 py-0.5 text-xs hover:bg-accent"
          >
            Share
          </button>
        </div>
        <CodeBlockCode code={codeStr} language={language} />
      </CodeBlock>
    );
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>;
  },
};

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  return (
    <div className={className} id={blockId}>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

const Markdown = memo(MarkdownComponent);

Markdown.displayName = "Markdown";

export { Markdown };
