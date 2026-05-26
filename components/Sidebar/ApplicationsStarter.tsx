"use client";

import {
	AppWindow,
	CheckIcon,
	ChevronRight,
	FolderIcon,
	PlayIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useAppTour } from "@/components/tour/AppTourProvider";
import { tourGroups } from "@/components/tour/tourGroups";
import { tourDefinitions } from "@/components/tour/tourRegistry";
import { Button } from "@/components/ui/button";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { AppOption } from "./types";

type TourDefinition = (typeof tourDefinitions)[number];

export default function ApplicationsStarter(props: {
	collapsedStarter: boolean;
	setCollapsedStarter: (fn: (v: boolean) => boolean) => void;
	apps?: AppOption[];
	onOpenGlobalSettings?: () => void;
}) {
	const { collapsedStarter, setCollapsedStarter, apps, onOpenGlobalSettings } =
		props;
	const { completedTourIds, startTour } = useAppTour();
	const [openTourGroups, setOpenTourGroups] = useState<Set<string>>(
		() => new Set(tourGroups.map((group) => group.id)),
	);
	const tourById = useMemo(
		() => new Map(tourDefinitions.map((tour) => [tour.id, tour])),
		[],
	);

	const toggleTourGroup = (groupId: string) => {
		setOpenTourGroups((current) => {
			const next = new Set(current);
			if (next.has(groupId)) {
				next.delete(groupId);
			} else {
				next.add(groupId);
			}
			return next;
		});
	};

	useEffect(() => {
		const openAppTours = () => {
			setCollapsedStarter(() => false);
			setOpenTourGroups(new Set(tourGroups.map((group) => group.id)));
		};
		window.addEventListener("tour-open-app-tours", openAppTours);
		return () => {
			window.removeEventListener("tour-open-app-tours", openAppTours);
		};
	}, [setCollapsedStarter]);

	return (
		<SidebarGroup>
			<button
				data-tour="app-tours"
				className="flex w-full items-center justify-between px-2 py-1 text-left rounded-md hover:bg-muted"
				type="button"
				onClick={() => setCollapsedStarter((v) => !v)}
			>
				<SidebarGroupLabel className="border-indigo-400/35 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300">
					App Tours
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

					<div className="space-y-2 px-2 pb-2 group-data-[state=collapsed]/sidebar:hidden">
						{tourGroups.map((group) => {
							const open = openTourGroups.has(group.id);
							const groupTours = group.tourIds
								.map((tourId) => tourById.get(tourId))
								.filter((tour): tour is TourDefinition => Boolean(tour));
							const completedCount = groupTours.filter((tour) =>
								completedTourIds.includes(tour.id),
							).length;

							return (
								<div
									key={group.id}
									className="overflow-hidden rounded-md border border-border bg-background"
								>
									<button
										type="button"
										className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left hover:bg-muted"
										onClick={() => toggleTourGroup(group.id)}
									>
										<span className="flex min-w-0 items-center gap-2">
											<FolderIcon className="size-3.5 shrink-0 text-muted-foreground" />
											<span className="min-w-0">
												<span className="block truncate text-xs font-medium text-foreground">
													{group.title}
												</span>
												<span className="block truncate text-[11px] text-muted-foreground">
													{completedCount}/{groupTours.length} complete
												</span>
											</span>
										</span>
										<ChevronRight
											className={cn(
												"size-3 shrink-0 text-muted-foreground transition-transform",
												open && "rotate-90",
											)}
										/>
									</button>
									{open && (
										<div className="space-y-1 border-t border-border p-1.5">
											{groupTours.map((tour) => {
												const completed = completedTourIds.includes(tour.id);
												return (
													<button
														key={tour.id}
														type="button"
														className="flex w-full min-w-0 items-start gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
														onClick={() => startTour(tour.id)}
													>
														<span
															className={cn(
																"mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border",
																group.accentClassName,
															)}
														>
															{completed ? (
																<CheckIcon className="size-3" />
															) : (
																<PlayIcon className="size-3" />
															)}
														</span>
														<span className="min-w-0">
															<span className="block truncate text-xs font-medium text-foreground">
																{tour.title}
															</span>
															<span className="line-clamp-2 block text-[11px] leading-snug text-muted-foreground">
																{tour.description}
															</span>
														</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{apps && apps.length > 0 && (
						<SidebarMenu>
							{apps.map((s) => (
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
					)}
				</>
			)}
		</SidebarGroup>
	);
}
