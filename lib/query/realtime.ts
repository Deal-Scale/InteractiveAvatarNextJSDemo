import type { QueryClient } from "@tanstack/react-query";

// Minimal event bus interface we can adapt WS/SSE to
export type RealtimeBus = {
  on: (event: string, handler: (payload?: any) => void) => void;
  off?: (event: string, handler: (payload?: any) => void) => void;
};

export type InvalidationRule =
  | { type: "invalidate"; key: readonly unknown[] }
  | { type: "prefetch"; key: readonly unknown[]; fn: () => Promise<any> };

export type RealtimeBinding = Record<string, InvalidationRule | InvalidationRule[]>;

/**
 * Binds a realtime bus (WebSocket/SSE) to React Query cache.
 * Map incoming events to invalidate/prefetch rules.
 */
export function bindRealtimeToQueryClient(
  client: QueryClient,
  bus: RealtimeBus,
  routes: RealtimeBinding,
) {
  Object.entries(routes).forEach(([event, rule]) => {
    const rules = Array.isArray(rule) ? rule : [rule];
    const handler = async () => {
      for (const r of rules) {
        if (r.type === "invalidate") {
          client.invalidateQueries({ queryKey: r.key });
        } else if (r.type === "prefetch") {
          try {
            await client.prefetchQuery({ queryKey: r.key, queryFn: r.fn });
          } catch {
            // ignore prefetch errors
          }
        }
      }
    };
    bus.on(event, handler);
  });
}
