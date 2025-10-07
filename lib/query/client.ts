import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Real-time friendly defaults
				staleTime: 30_000, // 30s: consider fresh briefly, revalidate often
				gcTime: 5 * 60_000, // 5m: keep in memory for quick back/forward
				retry: 2,
				retryDelay: (attempt) => Math.min(3000, 300 * 2 ** attempt),
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				networkMode: "always",
			},
			mutations: {
				retry: 1,
				retryDelay: (attempt) => Math.min(2000, 250 * 2 ** attempt),
				networkMode: "always",
			},
		},
	});
}

// App-wide singleton (sufficient for single-window apps)
export const queryClient = createQueryClient();
