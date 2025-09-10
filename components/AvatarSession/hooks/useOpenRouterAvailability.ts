"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Health-check for OpenRouter upstream availability via local proxy.
 * GET /api/openrouter/health returns 204 when upstream is reachable and API key is configured.
 */
export function useOpenRouterAvailability() {
	const [available, setAvailable] = useState<boolean>(false);
	const [checking, setChecking] = useState<boolean>(false);
	const [lastError, setLastError] = useState<string | null>(null);

	const check = useCallback(async () => {
		try {
			setChecking(true);
			setLastError(null);
			const res = await fetch("/api/openrouter/health", {
				method: "GET",
				headers: { "Cache-Control": "no-cache" },
			});
			const ok = res.status === 204;
			setAvailable(ok);
			if (!ok) setLastError(`OpenRouter health failed: ${res.status}`);
		} catch (e) {
			setAvailable(false);
			setLastError((e as Error).message);
		} finally {
			setChecking(false);
		}
	}, []);

	useEffect(() => {
		void check();
	}, [check]);

	return { available, checking, lastError, retry: check } as const;
}
