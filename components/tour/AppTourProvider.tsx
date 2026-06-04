"use client";

import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import Joyride, { EVENTS, type EventData, STATUS } from "react-joyride";
import { type TourId, tourRegistry } from "./tourRegistry";

type AppTourContextValue = {
	activeTourId: TourId;
	completedTourIds: TourId[];
	startTour: (tourId?: TourId) => void;
	stopTour: () => void;
};

const AppTourContext = createContext<AppTourContextValue>({
	activeTourId: "app-overview",
	completedTourIds: [],
	startTour: () => {},
	stopTour: () => {},
});

const COMPLETED_TOURS_KEY = "mind-stream.completedTourIds";

type MermaidTourWindow = Window & {
	__mindStreamTourMermaidActionsOpen?: boolean;
};

function closeMermaidTourMenu() {
	if (typeof window === "undefined") return;
	(window as MermaidTourWindow).__mindStreamTourMermaidActionsOpen = false;
	window.dispatchEvent(new CustomEvent("tour-close-mermaid-actions"));
}

function restoreTourHiddenChrome() {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent("tour-show-chat-reopen"));
}

function loadCompletedTourIds(): TourId[] {
	if (typeof window === "undefined") return [];
	try {
		const parsed = JSON.parse(
			window.localStorage.getItem(COMPLETED_TOURS_KEY) || "[]",
		);
		return Array.isArray(parsed)
			? parsed.filter((id): id is TourId => id in tourRegistry)
			: [];
	} catch {
		return [];
	}
}

function saveCompletedTourIds(ids: TourId[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(ids));
}

export function AppTourProvider({ children }: { children: ReactNode }) {
	const [run, setRun] = useState(false);
	const [tourRunId, setTourRunId] = useState(0);
	const [activeTourId, setActiveTourId] = useState<TourId>("app-overview");
	const [completionTourId, setCompletionTourId] = useState<TourId | null>(null);
	const [completedTourIds, setCompletedTourIds] =
		useState<TourId[]>(loadCompletedTourIds);

	const startTour = useCallback((tourId: TourId = "app-overview") => {
		setActiveTourId(tourId);
		setCompletionTourId(null);
		setTourRunId((current) => current + 1);
		setRun(true);
	}, []);

	const stopTour = useCallback(() => {
		closeMermaidTourMenu();
		restoreTourHiddenChrome();
		setRun(false);
	}, []);

	const handleJoyrideCallback = useCallback(
		(data: EventData) => {
			const { index, status, type } = data;

			if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
				closeMermaidTourMenu();
				restoreTourHiddenChrome();
				const completedBySkip = status === STATUS.SKIPPED;
				setCompletedTourIds((current) => {
					if (current.includes(activeTourId)) return current;
					const next = [...current, activeTourId];
					saveCompletedTourIds(next);
					return next;
				});
				setRun(false);
				setCompletionTourId(completedBySkip ? null : activeTourId);
				return;
			}

			if (type === EVENTS.TARGET_NOT_FOUND) {
				closeMermaidTourMenu();
				restoreTourHiddenChrome();
				console.warn("[tour] Target not found; pausing tour", {
					activeTourId,
					index,
					target: data.step?.target,
				});
				setRun(false);
				return;
			}
		},
		[activeTourId],
	);

	const value = useMemo(
		() => ({
			activeTourId,
			completedTourIds,
			startTour,
			stopTour,
		}),
		[activeTourId, completedTourIds, startTour, stopTour],
	);
	const activeTour = tourRegistry[activeTourId] ?? tourRegistry["app-overview"];
	const completionTour = completionTourId
		? tourRegistry[completionTourId]
		: null;
	const relatedTours =
		completionTour?.relatedTourIds?.map((id) => tourRegistry[id]) ?? [];
	const tourZIndex = 2147483000;

	return (
		<AppTourContext.Provider value={value}>
			{children}
			{completionTour && relatedTours.length > 0 && (
				<div className="fixed bottom-4 left-1/2 z-[2147483647] w-[min(92vw,520px)] -translate-x-1/2 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xl">
					<div className="flex items-start justify-between gap-3">
						<div>
							<div className="text-sm font-semibold">Continue guided setup</div>
							<p className="mt-1 text-xs text-muted-foreground">
								Choose the next focused tour after {completionTour.title}.
							</p>
						</div>
						<button
							type="button"
							className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
							onClick={() => setCompletionTourId(null)}
						>
							Close
						</button>
					</div>
					<div className="mt-3 grid gap-2 sm:grid-cols-2">
						{relatedTours.map((tour) => (
							<button
								key={tour.id}
								type="button"
								className="rounded-md border border-border bg-background px-3 py-2 text-left text-xs hover:bg-muted"
								onClick={() => startTour(tour.id)}
							>
								<span className="block font-medium text-foreground">
									{tour.title}
								</span>
								<span className="mt-0.5 line-clamp-2 block text-muted-foreground">
									{tour.description}
								</span>
							</button>
						))}
					</div>
				</div>
			)}
			<style>
				{`
					.react-joyride__floater,
					.react-joyride__tooltip {
						z-index: ${tourZIndex + 1} !important;
					}

					.react-joyride__overlay,
					.react-joyride__spotlight {
						z-index: ${tourZIndex} !important;
					}
				`}
			</style>
			<Joyride
				continuous
				key={`${activeTourId}-${tourRunId}`}
				onEvent={handleJoyrideCallback}
				options={{
					arrowColor: "hsl(var(--card))",
					backgroundColor: "hsl(var(--card))",
					buttons: ["back", "close", "primary", "skip"],
					blockTargetInteraction: true,
					overlayClickAction: false,
					overlayColor: "rgba(0, 0, 0, 0.58)",
					primaryColor: "hsl(var(--primary))",
					scrollOffset: 96,
					showProgress: true,
					skipBeacon: true,
					targetWaitTimeout: 3000,
					textColor: "hsl(var(--foreground))",
					width: 320,
					zIndex: tourZIndex,
				}}
				run={run}
				steps={activeTour.steps}
				styles={{
					floater: {
						zIndex: tourZIndex + 1,
					},
					overlay: {
						pointerEvents: "none",
					},
					spotlight: {
						pointerEvents: "none",
					},
					tooltip: {
						border: "1px solid hsl(var(--border))",
						borderRadius: 8,
						boxSizing: "border-box",
						boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28)",
						maxWidth: "calc(100vw - 32px)",
						width: "min(320px, calc(100vw - 32px))",
						zIndex: tourZIndex + 1,
					},
					tooltipContainer: {
						textAlign: "left",
					},
					tooltipFooter: {
						flexWrap: "wrap",
						gap: 8,
						justifyContent: "center",
					},
					buttonBack: {
						color: "hsl(var(--muted-foreground))",
					},
					buttonClose: {
						color: "hsl(var(--muted-foreground))",
					},
					buttonPrimary: {
						borderRadius: 6,
					},
					buttonSkip: {
						color: "hsl(var(--muted-foreground))",
					},
				}}
			/>
		</AppTourContext.Provider>
	);
}

export function useAppTour() {
	return useContext(AppTourContext);
}
