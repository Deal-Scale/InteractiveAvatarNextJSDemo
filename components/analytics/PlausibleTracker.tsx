"use client";

import { useEffect } from "react";
import {
	init as initPlausible,
	enableAutoPageviews,
	enableAutoOutboundTracking,
} from "@/lib/analytics/plausible";

/**
 * Initializes Plausible Analytics on the client.
 * - Enables automatic SPA pageview tracking
 * - Enables outbound link click tracking
 * - Cleans up listeners on unmount
 *
 * Configure via env vars:
 * - NEXT_PUBLIC_PLAUSIBLE_DOMAIN: your Plausible domain (e.g. example.com)
 * - NEXT_PUBLIC_PLAUSIBLE_TRACK_LOCALHOST: "true" to track localhost during development
 * - NEXT_PUBLIC_PLAUSIBLE_API_HOST: override Plausible API host if self-hosting
 * - NEXT_PUBLIC_PLAUSIBLE_HASH_MODE: "true" to enable hashMode
 */
export default function PlausibleTracker() {
	useEffect(() => {
		try {
			const domain =
				process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || window.location.hostname;
			const trackLocalhost =
				process.env.NEXT_PUBLIC_PLAUSIBLE_TRACK_LOCALHOST === "true";
			const apiHost = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || undefined;
			const hashMode = process.env.NEXT_PUBLIC_PLAUSIBLE_HASH_MODE === "true";

			initPlausible({
				domain,
				trackLocalhost,
				hashMode,
				...(apiHost ? { apiHost } : {}),
			});

			const cleanupAutoPageviews = enableAutoPageviews();
			const cleanupOutbound = enableAutoOutboundTracking();

			return () => {
				try {
					cleanupAutoPageviews?.();
				} catch {}
				try {
					cleanupOutbound?.();
				} catch {}
			};
		} catch (e) {
			if (process.env.NODE_ENV !== "production") {
				// eslint-disable-next-line no-console
				console.warn("[Plausible] init failed", e);
			}
		}
	}, []);

	return null;
}
