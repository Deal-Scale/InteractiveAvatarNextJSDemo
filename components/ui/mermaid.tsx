"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MermaidProps = {
	chart?: string;
	children?: React.ReactNode;
	className?: string;
	showControls?: boolean;
	onAddToGrid?: (payload: { code: string; svg?: string }) => void;
};

export function Mermaid({ chart, children, className }: MermaidProps) {
	const code = String(chart ?? children ?? "");

	return (
		<div className={cn("rounded-md border border-border bg-background p-3", className)}>
			<pre className="overflow-x-auto whitespace-pre-wrap text-xs">{code}</pre>
			<div className="mt-2 flex justify-end">
				<Button size="sm" type="button" variant="secondary">
					Mermaid preview
				</Button>
			</div>
		</div>
	);
}
