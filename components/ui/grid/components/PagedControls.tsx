"use client";
import React from "react";

type Props = {
	page: number;
	pageSize: number;
	total: number | undefined;
	hasNextPage: boolean;
	setPage: (page: number) => void;
};

export function PagedControls({
	page,
	pageSize,
	total,
	hasNextPage,
	setPage,
}: Props) {
	return (
		<div className="flex items-center justify-between gap-3">
			<button
				className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
				onClick={() => setPage(Math.max(1, page - 1))}
				disabled={page <= 1}
			>
				Previous
			</button>
			<div className="text-sm text-muted-foreground">
				Page {page} of {Math.max(1, Math.ceil((total ?? 0) / pageSize))}
			</div>
			<button
				className="rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
				onClick={() => setPage(page + 1)}
				disabled={!hasNextPage}
			>
				Next
			</button>
		</div>
	);
}
