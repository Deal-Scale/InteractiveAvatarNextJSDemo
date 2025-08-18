import { useEffect, useState, RefObject } from "react";

export function useInputAutoHeight(ref: RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        setHeight(Math.ceil(h));
      }
    });
    ro.observe(el);
    // Initialize immediately
    setHeight(Math.ceil(el.getBoundingClientRect().height));
    return () => ro.disconnect();
  }, [ref]);

  return height;
}
