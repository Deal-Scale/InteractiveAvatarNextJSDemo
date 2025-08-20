"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initGA, sendPageview } from "@/lib/analytics/ga";

/**
 * Initializes Google Analytics 4 (react-ga4) and auto-sends pageviews
 * on App Router navigation changes.
 *
 * Env configuration:
 * - NEXT_PUBLIC_ENABLE_GA4: "true" to enable GA4
 * - NEXT_PUBLIC_GA4_MEASUREMENT_IDS: comma-separated GA4 IDs (e.g. G-XXXX,G-YYYY)
 * - NEXT_PUBLIC_GA4_ALLOW_LOCALHOST: "true" to track on localhost
 */
export default function GA4Tracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const w = typeof window !== "undefined" ? window : undefined;
	const d = typeof document !== "undefined" ? document : undefined;

	useEffect(() => {
		try {
			const enabled = process.env.NEXT_PUBLIC_ENABLE_GA4 === "true";
			if (!enabled) return;

			const idsEnv = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_IDS || "";
			const ids = idsEnv
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
			if (ids.length === 0) return;

			const allowLocalhost =
				process.env.NEXT_PUBLIC_GA4_ALLOW_LOCALHOST === "true";
			const isLocalhost =
				typeof window !== "undefined" &&
				/^(localhost|127\.0\.0\.1)/.test(w?.location.hostname || "");
			if (isLocalhost && !allowLocalhost) return;

			initGA({ ids });
			// initial pageview
			const url = `${w?.location.pathname || ""}${w?.location.search || ""}`;
			sendPageview(url, d?.title || "");
		} catch (e) {
			if (process.env.NODE_ENV !== "production") {
				// eslint-disable-next-line no-console
				console.warn("[GA4] init failed", e);
			}
		}
		// run once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Send pageview on route/search changes
	useEffect(() => {
		try {
			const enabled = process.env.NEXT_PUBLIC_ENABLE_GA4 === "true";
			if (!enabled) return;
			const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
			sendPageview(url, d?.title || "");
		} catch {}
	}, [pathname, searchParams]);

	return null;
}
