import { RefObject, useCallback, useEffect, useState } from "react";

interface Options {
  inputOnly: boolean;
  depsForContentChange: readonly unknown[];
  extraBottomPadding?: number;
}

export function useScrollAnchored(
  scrollRef: RefObject<HTMLDivElement | null>,
  { inputOnly, depsForContentChange }: Options,
) {
  const [isAtBottom, setIsAtBottom] = useState(true);

  const recomputeIsAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 6; // px tolerance
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setIsAtBottom(atBottom);
  }, [scrollRef]);

  const handleScroll: React.UIEventHandler<HTMLDivElement> = () => {
    recomputeIsAtBottom();
  };

  // After content changes (new messages), scroll to bottom if user was at bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
  }, [scrollRef, isAtBottom, ...depsForContentChange]);

  // When switching from inputOnly to full chat (expanding), force scroll to bottom
  useEffect(() => {
    if (inputOnly) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
        setIsAtBottom(true);
      } catch {}
    });
  }, [inputOnly, scrollRef]);

  return { isAtBottom, handleScroll } as const;
}
