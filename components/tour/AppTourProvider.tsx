"use client";

import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { createPortal } from "react-dom";
import {
	isAppTourEvent,
	markAppTourInteraction,
} from "@/lib/utils/tourInteractions";
import { type TourId, tourRegistry } from "./tourRegistry";
import type { TourDefinition } from "./tourTypes";

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
type RuntimeTourStep = TourDefinition["steps"][number] & {
	before?: () => Promise<void> | void;
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

async function waitForTourElement(selector: string) {
	if (typeof window === "undefined") return null;
	const startedAt = window.performance.now();

	while (window.performance.now() - startedAt < 3500) {
		const target = document.querySelector(selector);
		if (target instanceof HTMLElement) {
			const rect = target.getBoundingClientRect();
			if (rect.width > 0 && rect.height > 0) {
				return target;
			}
		}
		await new Promise((resolve) => window.setTimeout(resolve, 75));
	}

	const fallback = document.querySelector(selector);
	return fallback instanceof HTMLElement ? fallback : null;
}

function enableTourPointerInteractions(portalElement: HTMLElement | null) {
	if (typeof document === "undefined") return;
	document.body.style.pointerEvents = "";
	if (portalElement) {
		portalElement.style.pointerEvents = "auto";
	}
}

export function AppTourProvider({ children }: { children: ReactNode }) {
	const [run, setRun] = useState(false);
	const [tourRunId, setTourRunId] = useState(0);
	const [stepIndex, setStepIndex] = useState(0);
	const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
	const [activeTourId, setActiveTourId] = useState<TourId>("app-overview");
	const [completionTourId, setCompletionTourId] = useState<TourId | null>(null);
	const [completedTourIds, setCompletedTourIds] = useState<TourId[]>([]);
	const [mounted, setMounted] = useState(false);
	const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

	useEffect(() => {
		let root = document.getElementById("floating-ui-root");
		if (!root) {
			root = document.createElement("div");
			root.id = "floating-ui-root";
			document.body.appendChild(root);
		}

		setCompletedTourIds(loadCompletedTourIds());
		setPortalElement(root);
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const markTourChromeInteraction = (event: Event) => {
			if (isAppTourEvent(event)) {
				markAppTourInteraction();
			}
		};

		document.addEventListener("pointerdown", markTourChromeInteraction, true);
		document.addEventListener("mousedown", markTourChromeInteraction, true);
		document.addEventListener("click", markTourChromeInteraction, true);

		return () => {
			document.removeEventListener(
				"pointerdown",
				markTourChromeInteraction,
				true,
			);
			document.removeEventListener(
				"mousedown",
				markTourChromeInteraction,
				true,
			);
			document.removeEventListener("click", markTourChromeInteraction, true);
		};
	}, [mounted]);

	useEffect(() => {
		if (!run && !completionTourId) return;

		const previousPortalPointerEvents = portalElement?.style.pointerEvents;
		enableTourPointerInteractions(portalElement);

		return () => {
			if (portalElement && previousPortalPointerEvents !== undefined) {
				portalElement.style.pointerEvents = previousPortalPointerEvents;
			}
		};
	}, [completionTourId, portalElement, run]);

	const startTour = useCallback((tourId: TourId = "app-overview") => {
		setActiveTourId(tourId);
		setCompletionTourId(null);
		setStepIndex(0);
		setTourRunId((current) => current + 1);
		setRun(true);
	}, []);

	const stopTour = useCallback(() => {
		closeMermaidTourMenu();
		restoreTourHiddenChrome();
		setRun(false);
	}, []);

	const completeTour = useCallback(
		(showRelatedTours: boolean) => {
			closeMermaidTourMenu();
			restoreTourHiddenChrome();
			setCompletedTourIds((current) => {
				if (current.includes(activeTourId)) return current;
				const next = [...current, activeTourId];
				saveCompletedTourIds(next);
				return next;
			});
			setRun(false);
			setCompletionTourId(showRelatedTours ? activeTourId : null);
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
	const activeStep = activeTour.steps[stepIndex] as RuntimeTourStep | undefined;
	const completionTour = completionTourId
		? tourRegistry[completionTourId]
		: null;
	const relatedTours =
		completionTour?.relatedTourIds?.map((id) => tourRegistry[id]) ?? [];
	const tourZIndex = 2147483000;
	const totalSteps = activeTour.steps.length;
	const tooltipPosition = targetRect
		? {
				left: Math.min(
					Math.max(16, targetRect.left),
					typeof window === "undefined"
						? targetRect.left
						: window.innerWidth - 352,
				),
				top: Math.min(
					targetRect.bottom + 12,
					typeof window === "undefined"
						? targetRect.bottom
						: window.innerHeight - 220,
				),
			}
		: {
				left: 24,
				top: 96,
			};
	const tourChrome =
		mounted && portalElement
			? createPortal(
					<>
						{completionTour && relatedTours.length > 0 && (
							<div
								className="-translate-x-1/2 fixed bottom-4 left-1/2 z-[2147483647] w-[min(92vw,520px)] rounded-lg border border-border bg-card p-3 text-card-foreground shadow-2xl"
								data-app-tour-completion=""
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-semibold text-sm">
											Continue guided setup
										</div>
										<p className="mt-1 text-muted-foreground text-xs">
											Choose the next focused tour after {completionTour.title}.
										</p>
									</div>
									<button
										type="button"
										className="rounded-md px-2 py-1 text-muted-foreground text-xs hover:bg-muted"
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
								[data-app-tour-tooltip] {
									z-index: ${tourZIndex + 1} !important;
								}

								[data-app-tour-overlay],
								[data-app-tour-spotlight] {
									z-index: ${tourZIndex} !important;
								}
							`}
						</style>
						{run && activeStep ? (
							<>
								{activeStep.hideOverlay ? null : (
									<button
										type="button"
										aria-label="Skip guided tour"
										className="pointer-events-auto fixed inset-0 bg-black/60"
										data-app-tour-overlay=""
										onClick={() => completeTour(false)}
									/>
								)}
								{targetRect ? (
									<div
										className="pointer-events-none fixed rounded-md border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.58)]"
										data-app-tour-spotlight=""
										style={{
											height: targetRect.height + 12,
											left: targetRect.left - 6,
											top: targetRect.top - 6,
											width: targetRect.width + 12,
										}}
									/>
								) : null}
								<div
									className="pointer-events-auto fixed w-[min(320px,calc(100vw-32px))] rounded-lg border border-border bg-card p-4 text-card-foreground shadow-2xl"
									data-app-tour-tooltip=""
									style={{
										left: tooltipPosition.left,
										top: tooltipPosition.top,
									}}
								>
									<div className="text-sm leading-relaxed">
										{activeStep.content}
									</div>
									<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
										<span className="text-muted-foreground text-xs">
											{stepIndex + 1} of {totalSteps}
										</span>
										<div className="flex items-center gap-2">
											<button
												type="button"
												className="rounded-md px-2 py-1 text-muted-foreground text-xs hover:bg-muted"
												onClick={() => completeTour(false)}
											>
												Skip
											</button>
											<button
												type="button"
												className="rounded-md px-2 py-1 text-muted-foreground text-xs hover:bg-muted disabled:opacity-40"
												disabled={stepIndex === 0}
												onClick={() =>
													setStepIndex((current) => Math.max(0, current - 1))
												}
											>
												Back
											</button>
											<button
												type="button"
												className="rounded-md bg-primary px-3 py-1 text-primary-foreground text-xs hover:opacity-90"
												onClick={() => {
													if (stepIndex >= totalSteps - 1) {
														completeTour(true);
														return;
													}
													setStepIndex((current) =>
														Math.min(totalSteps - 1, current + 1),
													);
												}}
											>
												{stepIndex >= totalSteps - 1 ? "Done" : "Next"}
											</button>
										</div>
									</div>
								</div>
							</>
						) : null}
					</>,
					portalElement,
				)
			: null;

	// biome-ignore lint/correctness/useExhaustiveDependencies: tourRunId intentionally replays the current step when a tour restarts.
	useEffect(() => {
		if (!mounted || !run || !activeStep) {
			setTargetRect(null);
			return;
		}

		let active = true;

		const prepareStep = async () => {
			await activeStep.before?.();
			enableTourPointerInteractions(portalElement);
			const target =
				typeof activeStep.target === "string"
					? await waitForTourElement(activeStep.target)
					: null;

			if (!active) return;

			if (target) {
				target.scrollIntoView({
					behavior: "instant",
					block: "center",
					inline: "nearest",
				});
				setTargetRect(target.getBoundingClientRect());
				return;
			}

			console.warn("[tour] Target not found", {
				activeTourId,
				target: activeStep.target,
			});
			setTargetRect(null);
		};

		void prepareStep();

		return () => {
			active = false;
		};
	}, [activeStep, activeTourId, mounted, run, tourRunId]);

	return (
		<AppTourContext.Provider value={value}>
			{children}
			{tourChrome}
		</AppTourContext.Provider>
	);
}

export function useAppTour() {
	return useContext(AppTourContext);
}
