"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type MermaidProps = {
  chart?: string;
  children?: React.ReactNode; // allow array/text from JSX parser
  className?: string;
  config?: any; // mermaid.Config, typed lazily to avoid type dep on server
  idPrefix?: string;
};

export function Mermaid({ chart, children, className, config, idPrefix = "mermaid" }: MermaidProps) {
  const [svg, setSvg] = React.useState<string>("");
  const uid = React.useId().replace(":", "");
  const childrenText = React.useMemo(() => {
    if (typeof children === "string") return children;
    if (children == null) return "";
    try {
      return React.Children.toArray(children).join("");
    } catch {
      return String(children);
    }
  }, [children]);

  const code = String(chart ?? childrenText ?? "").trim();

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!code) return;
      // reset while rendering to show fallback
      setSvg("");
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict", ...config });
      try {
        const { svg } = await mermaid.render(`${idPrefix}-${uid}`, code);
        if (!cancelled) setSvg(svg);
      } catch (err) {
        if (!cancelled) setSvg(`<pre class='text-red-500'>Mermaid render error: ${String(err)}</pre>`);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [code, idPrefix, config, uid]);

  if (!code) return null;
  if (!svg) {
    return (
      <pre className={cn("text-xs text-muted-foreground whitespace-pre-wrap", className)}>
        {code}
      </pre>
    );
  }
  return <div className={cn("mermaid-container overflow-auto", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}
