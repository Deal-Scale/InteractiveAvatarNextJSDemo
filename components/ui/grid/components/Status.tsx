"use client";
import React from "react";

export function LoadingStatus({ show }: { show: boolean }) {
	if (!show) return null;
	return (
		<div role="status" aria-live="polite" className="text-sm text-gray-500">
			Loading…
		</div>
	);
}

export function ErrorStatus({ onRetry }: { onRetry: () => void }) {
	return (
		<div role="alert" className="text-sm text-red-600">
			Failed to load items.
			<button className="ml-2 underline" onClick={onRetry}>
				Retry
			</button>
		</div>
	);
}
