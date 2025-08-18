"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type MermaidProps = {
  chart?: string;
  children?: string; // alternative to chart
  className?: string;
  config?: any; // mermaid.Config, typed lazily to avoid type dep on server
  idPrefix?: string;
};

export function Mermaid({ chart, children, className, config, idPrefix = "mermaid" }: MermaidProps) {
  const [svg, setSvg] = React.useState<string>("");
  const uid = React.useId().replace(":", "");
  const code = (chart ?? children ?? "").trim();

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!code) return;
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

  return <div className={cn("mermaid-container overflow-auto", className)} dangerouslySetInnerHTML={{ __html: svg }} />;
}
