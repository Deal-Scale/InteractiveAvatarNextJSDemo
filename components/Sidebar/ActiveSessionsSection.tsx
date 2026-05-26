"use client";

import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { useActiveSessionsQuery } from "@/lib/services/streaming/query";
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
				<SidebarGroupLabel className="border-emerald-400/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
					Active Sessions
				</SidebarGroupLabel>
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
						<div className="px-2 text-xs text-muted-foreground">Loading...</div>
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
							{items.map((session) => (
								<li
									key={session.session_id}
									className="rounded-md border border-border bg-card text-xs hover:bg-muted"
								>
									<button
										type="button"
										className="flex w-full cursor-pointer items-center justify-between px-2 py-1 text-left"
										onClick={() => {
											useSessionStore
												.getState()
												.setCurrentSessionId(session.session_id);
											useSessionStore.getState().setViewTab("video");
										}}
									>
										<span className="mr-2 min-w-0 truncate">
											<span className="font-medium">{session.status}</span>
											<span className="mx-1 text-muted-foreground">/</span>
											{session.mode ? (
												<>
													<span className="text-muted-foreground">
														{session.mode}
													</span>
													<span className="mx-1 text-muted-foreground">/</span>
												</>
											) : null}
											<span className="text-muted-foreground">
												{session.session_id}
											</span>
										</span>
										<span className="shrink-0 text-muted-foreground">
											{new Date(session.created_at * 1000).toLocaleTimeString()}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			)}
		</SidebarGroup>
	);
}
