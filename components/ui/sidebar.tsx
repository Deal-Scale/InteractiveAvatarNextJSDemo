"use client";

import React, { createContext, useContext } from "react";

import { usePlacementStore } from "@/lib/stores/placement";

// Basic provider to manage open/close state for a collapsible sidebar
type SidebarCtx = {
	open: boolean;
	setOpen: (v: boolean) => void;
};

const Ctx = createContext<SidebarCtx | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
	const sidebarCollapsed = usePlacementStore((s) => s.sidebarCollapsed);
	const setSidebarCollapsed = usePlacementStore((s) => s.setSidebarCollapsed);
	const open = !sidebarCollapsed;
	const setOpen = (v: boolean) => setSidebarCollapsed(!v);

	return <Ctx.Provider value={{ open, setOpen }}>{children}</Ctx.Provider>;
}

export function useSidebar() {
	const ctx = useContext(Ctx);

	if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");

	return ctx;
}

export function SidebarTrigger({
	className,
	children,
}: {
	className?: string;
	children?: React.ReactNode;
}) {
	const { open, setOpen } = useSidebar();

	return (
		<button
			aria-label="Toggle sidebar"
			aria-pressed={open}
			className={className}
			type="button"
			onClick={() => setOpen(!open)}
		>
			{children ?? (
				// Simple hamburger fallback
				<div className="flex flex-col gap-0.5">
					<span className="block h-0.5 w-5 bg-current" />
					<span className="block h-0.5 w-5 bg-current" />
					<span className="block h-0.5 w-5 bg-current" />
				</div>
			)}
		</button>
	);
}

export function SidebarInset({ children }: { children: React.ReactNode }) {
	// Container next to sidebar area
	return <div className="flex-1 min-w-0">{children}</div>;
}

interface SidebarProps {
	children: React.ReactNode;
	className?: string;
}

export function Sidebar({ children, className = "" }: SidebarProps) {
	const { open, setOpen } = useSidebar();

	return (
		<nav
			aria-label="Primary"
			className={
				"relative group/sidebar transition-[width] duration-200 bg-background text-foreground " +
				(open ? "w-[320px] border-r border-border" : "w-0 border-r-0") +
				(className ? ` ${className}` : "")
			}
			data-state={open ? "open" : "collapsed"}
		>
			=
			{!open && (
				<button
					aria-label="Open sidebar"
					className="fixed left-0 top-1/2 -translate-y-1/2 z-40 h-16 w-3 rounded-r border border-primary/40 bg-primary/10 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary backdrop-blur supports-[backdrop-filter]:bg-primary/10"
					type="button"
					onClick={() => setOpen(true)}
				/>
			)}
			<div className="flex h-full flex-col gap-4 py-4 max-h-full overflow-y-auto px-2 pb-20 group-data-[state=collapsed]/sidebar:hidden">
				{children}
			</div>
		</nav>
	);
}

export function SidebarHeader({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={`shrink-0 ${className}`}>{children}</div>;
}

export function SidebarContent({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={`flex-1 min-h-0 ${className}`}>{children}</div>;
}

export function SidebarGroup({ children }: { children: React.ReactNode }) {
	return <div className="px-2 py-2">{children}</div>;
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="px-2 pb-1 text-xs uppercase tracking-wide text-muted-foreground">
			{children}
		</div>
	);
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
	return <ul className="flex flex-col gap-0.5">{children}</ul>;
}

export function SidebarMenuButton({
	children,
	onClick,
	className = "",
}: {
	children: React.ReactNode;
	onClick?: () => void;
	className?: string;
}) {
	return (
		<li>
			<div
				role="button"
				tabIndex={0}
				className={`w-full text-left rounded-md px-3 py-2 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick?.();
					}
				}}
			>
				{children}
			</div>
		</li>
	);
}

export function SidebarFooter({
	children,
	className = "",
}: {
	children?: React.ReactNode;
	className?: string;
}) {
	return <div className={`mt-auto shrink-0 ${className}`}>{children}</div>;
}
