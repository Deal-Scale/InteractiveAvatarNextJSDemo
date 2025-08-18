import type { QueryClient, QueryKey } from "@tanstack/react-query";

export function prefetchOnHover(
  el: HTMLElement,
  client: QueryClient,
  key: QueryKey,
  fn: () => Promise<any>,
) {
  let prefetched = false;
  const handler = () => {
    if (prefetched) return;
    prefetched = true;
    void client.prefetchQuery({ queryKey: key, queryFn: fn });
  };
  el.addEventListener("mouseenter", handler, { once: true });
  el.addEventListener("focus", handler, { once: true, capture: true });
  return () => {
    el.removeEventListener("mouseenter", handler);
    el.removeEventListener("focus", handler, true);
  };
}
