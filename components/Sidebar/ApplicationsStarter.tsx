"use client";

import { AppWindow, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import type { AppOption } from "./types";

export default function ApplicationsStarter(props: {
	collapsedStarter: boolean;
	setCollapsedStarter: (fn: (v: boolean) => boolean) => void;
	apps?: AppOption[];
	onOpenGlobalSettings?: () => void;
}) {
	const { collapsedStarter, setCollapsedStarter, apps, onOpenGlobalSettings } =
		props;

	const starterApps: AppOption[] = useMemo(
		() =>
			(apps && apps.length > 0
				? apps
				: [
						{
							id: "starter-1",
							label: "Quick Demo",
							icon: <AppWindow className="size-4" />,
						},
						{
							id: "starter-2",
							label: "Sales Flow",
							icon: <AppWindow className="size-4" />,
						},
						{
							id: "starter-3",
							label: "Support Flow",
							icon: <AppWindow className="size-4" />,
						},
					]) as AppOption[],
		[apps],
	);

	return (
		<SidebarGroup>
			<button
				className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
				type="button"
				onClick={() => setCollapsedStarter((v) => !v)}
			>
				<SidebarGroupLabel className="border-indigo-400/35 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
					Chat Settings
				</SidebarGroupLabel>
				<ChevronRight
					className={`size-3 transition-transform ${collapsedStarter ? "rotate-0" : "rotate-90"}`}
				/>
			</button>
			{!collapsedStarter && (
				<>
					<div className="px-2 py-2 group-data-[state=collapsed]/sidebar:hidden">
						<Button
							className="flex w-full items-center gap-2 bg-background text-foreground border border-border hover:bg-muted"
							variant="outline"
							onClick={() => onOpenGlobalSettings?.()}
						>
							Settings
						</Button>
					</div>

					{/* Starter apps */}
					<SidebarMenu>
						{starterApps.map((s) => (
							<SidebarMenuButton key={s.id} className="justify-start">
								<span className="mr-2 inline-flex size-4 items-center justify-center overflow-hidden rounded">
									{s.imageUrl ? (
										<img
											alt={s.label}
											className="h-4 w-4 object-cover"
											src={s.imageUrl}
										/>
									) : (
										(s.icon ?? <AppWindow className="size-4" />)
									)}
								</span>
								<span
									style={{
										transform: "scale(0.8)",
										transformOrigin: "left center",
									}}
								>
									{s.label}
								</span>
							</SidebarMenuButton>
						))}
					</SidebarMenu>
				</>
			)}
		</SidebarGroup>
	);
}
