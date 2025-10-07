"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { usePlacementStore } from "@/lib/stores/placement";

interface PlacementModalProps {
	open: boolean;
	onOpenChange: (v: boolean) => void;
}

const PRESETS = {
	default: {
		sidebarCollapsed: false,
		dockMode: "bottom" as const,
		bottomHeightFrac: 0.35,
	},
	focusChat: {
		sidebarCollapsed: true,
		dockMode: "bottom" as const,
		bottomHeightFrac: 0.7,
	},
	// For video, prefer a right dock to give vertical space to the canvas
	focusVideo: {
		sidebarCollapsed: true,
		dockMode: "right" as const,
		rightWidthFrac: 0.38,
		activeVideoTab: "video" as const,
	},
	// Minimal uses a small floating window
	minimal: {
		sidebarCollapsed: true,
		dockMode: "floating" as const,
		floating: { width: 420, height: 280, x: 24, y: 24, visible: true } as const,
	},
};

export default function PlacementModal({
	open,
	onOpenChange,
}: PlacementModalProps) {
	const {
		dockMode,
		setDockMode,
		bottomHeightFrac,
		setBottomHeightFrac,
		rightWidthFrac,
		setRightWidthFrac,
		sidebarCollapsed,
		setSidebarCollapsed,
		setActiveVideoTab,
		floating,
		setFloating,
	} = usePlacementStore();

	// Unique IDs for inputs to avoid duplicate ids across the app
	const bottomId = React.useId();
	const leftDistId = React.useId();

	// Platform-aware shortcut labeling
	const isMac =
		typeof window !== "undefined" &&
		/Mac|iPhone|iPad|iPod/i.test(navigator.platform);
	const altKey = isMac ? "⌥" : "Alt";
	const label = (suffix: string) =>
		isMac ? `${altKey}${suffix}` : `${altKey}+${suffix}`;
	const L = {
		presets: {
			default: label("1"),
			focusChat: label("2"),
			focusVideo: label("3"),
			minimal: label("4"),
		},
		dock: {
			bottom: label("B"),
			right: label("R"),
			floating: label("F"),
		},
	} as const;

	// Apply preset helper - memoized to avoid stale refs and for exhaustive-deps
	const applyPreset = React.useCallback(
		(key: keyof typeof PRESETS) => {
			const p = PRESETS[key];
			setSidebarCollapsed(p.sidebarCollapsed);
			setDockMode(p.dockMode);
			if ("bottomHeightFrac" in p && typeof p.bottomHeightFrac === "number") {
				setBottomHeightFrac(p.bottomHeightFrac);
			}
			if ("rightWidthFrac" in p && typeof p.rightWidthFrac === "number") {
				setRightWidthFrac(p.rightWidthFrac);
			}
			if ("activeVideoTab" in p && p.activeVideoTab) {
				setActiveVideoTab(p.activeVideoTab as any);
			}
			if ("floating" in p && p.floating) {
				setFloating({ ...p.floating });
			}
		},
		[
			setSidebarCollapsed,
			setDockMode,
			setBottomHeightFrac,
			setRightWidthFrac,
			setActiveVideoTab,
			setFloating,
		],
	);

	// Alt-based shortcuts active while modal is open
	React.useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (!e.altKey) return;
			const key = e.key.toLowerCase();
			// Presets
			if (key === "1") {
				e.preventDefault();
				applyPreset("default");
			} else if (key === "2") {
				e.preventDefault();
				applyPreset("focusChat");
			} else if (key === "3") {
				e.preventDefault();
				applyPreset("focusVideo");
			} else if (key === "4") {
				e.preventDefault();
				applyPreset("minimal");
			}
			// Dock modes
			else if (key === "b") {
				e.preventDefault();
				setDockMode("bottom");
			} else if (key === "r") {
				e.preventDefault();
				setDockMode("right");
			} else if (key === "f") {
				e.preventDefault();
				setDockMode("floating");
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, applyPreset, setDockMode]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Placement</DialogTitle>
					<DialogDescription>
						Adjust layout to fit your current task.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4">
					<div className="grid grid-cols-2 gap-2">
						<div className="flex flex-col items-center gap-1">
							<Button
								variant="secondary"
								onClick={() => applyPreset("default")}
							>
								Default
							</Button>
							<div className="text-[10px] leading-none text-muted-foreground">
								{L.presets.default}
							</div>
						</div>
						<div className="flex flex-col items-center gap-1">
							<Button
								variant="secondary"
								onClick={() => applyPreset("focusChat")}
							>
								Focus Chat
							</Button>
							<div className="text-[10px] leading-none text-muted-foreground">
								{L.presets.focusChat}
							</div>
						</div>
						<div className="flex flex-col items-center gap-1">
							<Button
								variant="secondary"
								onClick={() => applyPreset("focusVideo")}
							>
								Focus Video
							</Button>
							<div className="text-[10px] leading-none text-muted-foreground">
								{L.presets.focusVideo}
							</div>
						</div>
						<div className="flex flex-col items-center gap-1">
							<Button
								variant="secondary"
								onClick={() => applyPreset("minimal")}
							>
								Minimal
							</Button>
							<div className="text-[10px] leading-none text-muted-foreground">
								{L.presets.minimal}
							</div>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-sm text-foreground">Sidebar collapsed</span>
						<Button
							aria-pressed={sidebarCollapsed}
							variant={sidebarCollapsed ? "default" : "outline"}
							size="sm"
							onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
						>
							{sidebarCollapsed ? "On" : "Off"}
						</Button>
					</div>

					<div className="space-y-2">
						<div className="text-sm text-foreground">Dock mode</div>
						<div className="flex gap-2">
							<div className="flex flex-col items-center gap-1">
								<Button
									variant={dockMode === "bottom" ? "default" : "outline"}
									size="sm"
									onClick={() => setDockMode("bottom")}
								>
									Bottom
								</Button>
								<div className="text-[10px] leading-none text-muted-foreground">
									{L.dock.bottom}
								</div>
							</div>
							<div className="flex flex-col items-center gap-1">
								<Button
									variant={dockMode === "right" ? "default" : "outline"}
									size="sm"
									onClick={() => setDockMode("right")}
								>
									Right
								</Button>
								<div className="text-[10px] leading-none text-muted-foreground">
									{L.dock.right}
								</div>
							</div>
							<div className="flex flex-col items-center gap-1 sm:flex">
								<Button
									variant={dockMode === "floating" ? "default" : "outline"}
									size="sm"
									className="hidden sm:inline-flex"
									onClick={() => setDockMode("floating")}
								>
									Floating
								</Button>
								<div className="hidden sm:block text-[10px] leading-none text-muted-foreground">
									{L.dock.floating}
								</div>
							</div>
						</div>
					</div>

					{dockMode === "bottom" && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-foreground">Bottom height</span>
								<span className="text-xs text-muted-foreground">
									{Math.round(bottomHeightFrac * 100)}%
								</span>
							</div>
							<Slider
								id={bottomId}
								value={[Math.round(bottomHeightFrac * 100)]}
								min={20}
								max={80}
								step={1}
								onValueChange={(v) => setBottomHeightFrac((v?.[0] ?? 35) / 100)}
							/>
						</div>
					)}

					{dockMode === "right" && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-foreground">Left distance</span>
								<span className="text-xs text-muted-foreground">
									{Math.round((1 - rightWidthFrac) * 100)}%
								</span>
							</div>
							<Slider
								id={leftDistId}
								value={[Math.round((1 - rightWidthFrac) * 100)]}
								min={0}
								max={80}
								step={1}
								onValueChange={(v) => {
									const left = (v?.[0] ?? 68) / 100;
									setRightWidthFrac(1 - left);
								}}
							/>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
