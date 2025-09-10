"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Check if the Gemini SSE endpoint is properly configured server-side.
 * Uses GET /api/gemini-stream?health=1 which returns 204 when OK.
 */
export function useGeminiAvailability() {
	const [available, setAvailable] = useState<boolean>(true);
	const [checking, setChecking] = useState<boolean>(false);
	const [lastError, setLastError] = useState<string | null>(null);

	const check = useCallback(async () => {
		try {
			setChecking(true);
			setLastError(null);
			const res = await fetch("/api/gemini-stream?health=1", {
				method: "GET",
				// Avoid caching
				headers: { "Cache-Control": "no-cache" },
			});
			const ok = res.status === 204;
			setAvailable(ok);
			if (!ok) setLastError(`Gemini health failed: ${res.status}`);
		} catch (e) {
			setAvailable(false);
			setLastError((e as Error).message);
		} finally {
			setChecking(false);
		}
	}, []);

	useEffect(() => {
		// Initial check
		void check();

		// Re-check on tab visibility changes
		const onVis = () => {
			if (document.visibilityState === "visible") void check();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, [check]);

	return { available, checking, lastError, retry: check } as const;
}
