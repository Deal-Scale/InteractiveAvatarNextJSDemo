"use client";

import { useEffect, useMemo, useState } from "react";
import posthog, { PostHog } from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

/**
 * Initializes PostHog and provides the React context.
 *
 * Env configuration:
 * - NEXT_PUBLIC_ENABLE_POSTHOG: "true" to enable
 * - NEXT_PUBLIC_POSTHOG_KEY: your PostHog Project API Key
 * - NEXT_PUBLIC_POSTHOG_HOST: default https://us.i.posthog.com (or your EU/ self-hosted host)
 * - NEXT_PUBLIC_POSTHOG_CAPTURE_PAGEVIEW: "true" to auto capture pageviews (default true)
 * - NEXT_PUBLIC_POSTHOG_DEBUG: "true" to enable debug
 * - NEXT_PUBLIC_POSTHOG_SESSION_RECORDING: "true" to enable session replay
 */
export default function PostHogProviderBridge({
	children,
}: {
	children: React.ReactNode;
}) {
	const [client, setClient] = useState<PostHog | null>(null);

	useEffect(() => {
		try {
			const enabled = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === "true";
			if (!enabled) return;

			const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
			const host =
				process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
			if (!key) return;

			const capturePageview =
				process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_PAGEVIEW !== "false";
			const debug = process.env.NEXT_PUBLIC_POSTHOG_DEBUG === "true";
			const sessionRecording =
				process.env.NEXT_PUBLIC_POSTHOG_SESSION_RECORDING === "true";

			posthog.init(key, {
				api_host: host,
				autocapture: true,
				capture_pageview: capturePageview,
				// ISO date string inserted here allows experimenting with defaults timeline
				defaults: "2025-05-24",
				debug,
				...(sessionRecording ? { session_recording: {} } : {}),
			});

			setClient(posthog);
		} catch (e) {
			if (process.env.NODE_ENV !== "production") {
				// eslint-disable-next-line no-console
				console.warn("[PostHog] init failed", e);
			}
		}
	}, []);

	if (!client) return <>{children}</>;
	return <PostHogProvider client={client}>{children}</PostHogProvider>;
}
