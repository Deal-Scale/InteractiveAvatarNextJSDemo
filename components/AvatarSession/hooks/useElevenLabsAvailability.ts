"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Health-check for ElevenLabs server configuration.
 * GET /api/elevenlabs/health returns 204 when ELEVENLABS_API_KEY is present.
 */
export function useElevenLabsAvailability() {
	const [available, setAvailable] = useState<boolean>(false);
	const [checking, setChecking] = useState<boolean>(false);
	const [lastError, setLastError] = useState<string | null>(null);

	const check = useCallback(async () => {
		try {
			setChecking(true);
			setLastError(null);
			const res = await fetch("/api/elevenlabs/health", {
				method: "GET",
				headers: { "Cache-Control": "no-cache" },
			});
			const ok = res.status === 204;
			setAvailable(ok);
			if (!ok) setLastError(`ElevenLabs health failed: ${res.status}`);
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
