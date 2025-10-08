"use client";

import * as React from "react";

type ResultPreviewProps<T> = {
	values: T | null;
	title?: string;
};

export function ResultPreview<T>({ values, title }: ResultPreviewProps<T>) {
	if (!values) return null;

	return (
		<div className="mt-4 space-y-2">
			{title ? (
				<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{title}
				</div>
			) : null}
			<pre className="max-h-56 overflow-auto rounded-md bg-muted/60 p-3 text-xs">
				{JSON.stringify(values, null, 2)}
			</pre>
		</div>
	);
}
