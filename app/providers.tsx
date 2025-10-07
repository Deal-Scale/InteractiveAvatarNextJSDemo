"use client";

import type React from "react";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query/client";
import PostHogProviderBridge from "@/components/analytics/PostHogProviderBridge";

// QueryClient is provided by lib/query/client with real-time friendly defaults

export default function AppProviders({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			// Lazy-init MSW only in dev to allow running without a backend
			(async () => {
				try {
					const { worker } = await import("@/mocks/browser");
					await worker.start({
						onUnhandledRequest: "bypass",
					});
					// eslint-disable-next-line no-console
					console.info("[MSW] Service worker started (dev only)");
				} catch (err) {
					// eslint-disable-next-line no-console
					console.warn(
						"[MSW] Not initialized. Did you run `npx msw init public/` and install `msw`?",
						err,
					);
				}
			})();
		}
	}, []);

	return (
		<PostHogProviderBridge>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} position="bottom" />
			</QueryClientProvider>
		</PostHogProviderBridge>
	);
}
