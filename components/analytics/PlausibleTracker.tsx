"use client";

import { useEffect } from "react";
import Plausible from "plausible-tracker";

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
 */
export default function PlausibleTracker() {
	useEffect(() => {
		try {
			const domain =
				process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || window.location.hostname;
			const trackLocalhost =
				process.env.NEXT_PUBLIC_PLAUSIBLE_TRACK_LOCALHOST === "true";
			const apiHost = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || undefined;

			const plausible = Plausible({
				domain,
				trackLocalhost,
				// Set hashMode=true only if your routing uses URL hashes
				hashMode: false,
				...(apiHost ? { apiHost } : {}),
			});

			const cleanupAutoPageviews = plausible.enableAutoPageviews();
			const cleanupOutbound = plausible.enableAutoOutboundTracking?.();

			return () => {
				try {
					cleanupAutoPageviews?.();
				} catch {}
				try {
					cleanupOutbound?.();
				} catch {}
			};
		} catch (e) {
			// Non-fatal: analytics should not break the app
			if (process.env.NODE_ENV !== "production") {
				// eslint-disable-next-line no-console
				console.warn("[Plausible] init failed", e);
			}
		}
	}, []);

	return null;
}
