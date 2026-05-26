"use client";

import { HelpCircle, PanelLeft, Search } from "lucide-react";
import React from "react";
import HeaderActionsStack from "@/components/Sidebar/HeaderActionsStack";
import { useAppTour } from "@/components/tour/AppTourProvider";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

type Props = {
	onAssetsClick: () => void;
	query: string;
	setQuery: (v: string) => void;
	onScrollToBookmarks?: () => void;
};

const SidebarHeaderSection: React.FC<Props> = ({
	onAssetsClick,
	query,
	setQuery,
	onScrollToBookmarks,
}) => {
	const { startTour } = useAppTour();

	return (
		<div className="flex flex-col gap-2 px-2 py-2" data-tour="sidebar-header">
			<div className="flex flex-row items-center justify-between gap-2">
				<div className="flex flex-row items-center gap-2 px-2">
					<SidebarTrigger className="size-8 inline-flex items-center justify-center rounded-md hover:bg-muted">
						<PanelLeft className="size-4" />
					</SidebarTrigger>
					<div className="bg-primary/10 size-8 rounded-md" />
					<div className="text-md font-medium tracking-tight text-foreground group-data-[state=collapsed]/sidebar:hidden">
						Mind Stream 🧠
					</div>
				</div>
				<div className="flex items-center gap-1">
					<button
						aria-label="Start app tour"
						className="inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
						data-tour="tour-start"
						type="button"
						onClick={() => startTour()}
					>
						<HelpCircle className="size-4" />
					</button>
					<HeaderActionsStack
						onAssetsClick={onAssetsClick}
						onScrollToBookmarks={onScrollToBookmarks}
					/>
				</div>
			</div>

			<div className="px-2 group-data-[state=collapsed]/sidebar:hidden">
				<div className="relative" data-tour="search-conversations">
					<Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="h-9 pl-8 text-sm bg-background text-foreground placeholder:text-muted-foreground border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
						placeholder="Search conversations..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
};

export default SidebarHeaderSection;
