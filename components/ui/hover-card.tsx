"use client";

import * as React from "react";

export function HoverCard({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

export function HoverCardTrigger({
	asChild,
	children,
}: {
	asChild?: boolean;
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

export function HoverCardContent({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div>{children}</div>;
}
