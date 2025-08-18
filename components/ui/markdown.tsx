import { memo, useId } from "react";
import * as React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { CodeBlock, CodeBlockCode } from "./code-block";

import { cn } from "@/lib/utils";

export type MarkdownProps = React.HTMLAttributes<HTMLDivElement> & {
  children: string;
  id?: string;
  className?: string;
  components?: Partial<Components>;
  showHeader?: boolean;
  headerLabel?: string;
};

function extractLanguage(className?: string): string {
  if (!className) return "plaintext";
  const match = className.match(/language-(\w+)/);

  return match ? match[1] : "plaintext";
}

function parseFenceMeta(meta?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!meta) return out;
  // matches key="value" pairs
  const regex = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(meta)) !== null) {
    out[m[1]] = m[2];
  }
  return out;
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
            // Token-based colors for theme adaptability
            "rounded-sm border border-border bg-muted px-1 font-mono text-[13px] text-foreground",
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
    const meta = (props as any)?.node?.meta as string | undefined;
    const metaMap = parseFenceMeta(meta);
    const themeOverride = metaMap.theme;
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
        <CodeBlockCode code={codeStr} language={language} theme={themeOverride} />
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
  showHeader = true,
  headerLabel = "Markdown",
  ...rest
}: MarkdownProps) {
  const generatedId = useId();
  const blockId = id ?? generatedId;
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      // noop
    }
  }, [children]);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const preview = typeof children === "string" ? children.slice(0, 80) : "[non-string]";
    const invoker = (rest as any)?.["data-invoker"] ?? "(unknown)";
    // Only log in dev to avoid noise
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[Markdown] render", { id: blockId, invoker, showHeader, headerLabel, preview });
      if (!showHeader) {
        // eslint-disable-next-line no-console
        console.debug("[Markdown] header hidden: showHeader is false. If this should be visible, pass showHeader or render Markdown directly.");
      }
    }
  }, [blockId, children, headerLabel, showHeader, rest]);

  return (
    <div className={className} id={blockId} {...rest}>
      {showHeader && (
        <div className="not-prose flex items-center justify-between rounded-t border border-border bg-muted/40 px-2 py-1 text-xs">
          <div className="text-muted-foreground">{headerLabel}</div>
          <div>
            <button
              type="button"
              aria-label="Copy markdown"
              onClick={handleCopy}
              className="rounded-md border border-border bg-background px-2 py-0.5 text-xs hover:bg-accent"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      <div className={showHeader ? "rounded-b border border-border" : ""}>
        <ReactMarkdown components={components} remarkPlugins={[remarkGfm, remarkBreaks]}>
          {children}
        </ReactMarkdown>
      </div>
    </div>
  );
}

const Markdown = memo(MarkdownComponent);

Markdown.displayName = "Markdown";

export { Markdown };
