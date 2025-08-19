"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { useActiveSessionsQuery } from "@/lib/services/streaming/query";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useSessionStore } from "@/lib/stores/session";

export default function ActiveSessionsSection(props: {
	collapsed: boolean;
	setCollapsed: (updater: (prev: boolean) => boolean) => void;
}) {
	const { collapsed, setCollapsed } = props;
	const { data, isLoading, isError } = useActiveSessionsQuery();

	const sessions = data?.sessions ?? [];
	const total = sessions.length;

	const items = useMemo(
		() =>
			sessions
				.slice()
				.sort((a, b) => b.created_at - a.created_at)
				.slice(0, 10),
		[sessions],
	);

	return (
		<SidebarGroup>
			<button
				type="button"
				onClick={() => setCollapsed((v) => !v)}
				className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
			>
				<SidebarGroupLabel>Active Sessions</SidebarGroupLabel>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					{!isLoading && !isError ? <span>{total}</span> : null}
					<ChevronRight
						className={`size-3 transition-transform ${collapsed ? "rotate-0" : "rotate-90"}`}
					/>
				</div>
			</button>

			{!collapsed && (
				<div className="pt-2">
					{isLoading && (
						<div className="px-2 text-xs text-muted-foreground">Loading…</div>
					)}
					{isError && (
						<div className="px-2 text-xs text-destructive">Failed to load</div>
					)}
					{!isLoading && !isError && items.length === 0 && (
						<div className="px-2 text-xs text-muted-foreground">
							No active sessions
						</div>
					)}
					{!isLoading && !isError && items.length > 0 && (
						<ul className="px-2 space-y-1">
							{items.map((s) => (
								<li
									key={s.session_id}
									className="flex items-center justify-between rounded-md border border-border bg-card px-2 py-1 text-xs hover:bg-muted cursor-pointer"
									onClick={() => {
										// Set current session and bring focus to the video tab
										useSessionStore
											.getState()
											.setCurrentSessionId(s.session_id);
										useSessionStore.getState().setViewTab("video");
									}}
								>
									<div className="truncate mr-2">
										<span className="font-medium">{s.status}</span>
										<span className="mx-1 text-muted-foreground">•</span>
										<span className="text-muted-foreground truncate align-middle">
											{s.session_id}
										</span>
									</div>
									<span className="text-muted-foreground">
										{new Date(s.created_at * 1000).toLocaleTimeString()}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</SidebarGroup>
	);
}
