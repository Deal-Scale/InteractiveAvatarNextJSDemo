"use client";
import React from "react";

export function LoadingStatus({ show }: { show: boolean }) {
	if (!show) return null;
	return (
		<div
			role="status"
			aria-live="polite"
			className="text-sm text-muted-foreground"
		>
			Loading…
		</div>
	);
}

export function ErrorStatus({ onRetry }: { onRetry: () => void }) {
	return (
		<div role="alert" className="text-sm text-destructive">
			Failed to load items.
			<button
				className="ml-2 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				onClick={onRetry}
			>
				Retry
			</button>
		</div>
	);
}
