"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Health check for OpenAI provider.
 * GET /api/open-ai/health returns 204 when OPENAI_API_KEY is configured.
 */
export function useOpenAIAAvailability() {
	const [available, setAvailable] = useState<boolean>(false);
	const [checking, setChecking] = useState<boolean>(false);
	const [lastError, setLastError] = useState<string | null>(null);

	const check = useCallback(async () => {
		try {
			setChecking(true);
			setLastError(null);
			const res = await fetch("/api/open-ai/health", {
				method: "GET",
				headers: { "Cache-Control": "no-cache" },
			});
			const ok = res.status === 204;
			setAvailable(ok);
			if (!ok) setLastError(`OpenAI health failed: ${res.status}`);
		} catch (error) {
			setAvailable(false);
			setLastError((error as Error).message);
		} finally {
			setChecking(false);
		}
	}, []);

	useEffect(() => {
		void check();
	}, [check]);

	return { available, checking, lastError, retry: check } as const;
}
