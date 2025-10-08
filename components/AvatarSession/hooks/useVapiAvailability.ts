"use client";

import { useEffect, useState } from "react";

/**
 * Temporary availability hook for the Vapi voice provider.
 * We optimistically mark it available until a real health endpoint is wired up.
 */
export function useVapiAvailability() {
	const [available, setAvailable] = useState<boolean>(true);
	const [checking, setChecking] = useState<boolean>(false);
	const [lastError, setLastError] = useState<string | null>(null);

	useEffect(() => {
		setAvailable(true);
		setChecking(false);
		setLastError(null);
	}, []);

	return { available, checking, lastError, retry: async () => {} } as const;
}
