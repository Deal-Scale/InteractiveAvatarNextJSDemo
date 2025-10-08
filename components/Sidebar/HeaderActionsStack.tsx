"use client";

import { useEffect, useState } from "react";
import {
	Settings,
	Image as ImageIcon,
	LayoutGrid,
	Bookmark,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/lib/stores/session";
import PlacementModal from "@/components/Sidebar/PlacementModal";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HeaderActionsStack({
	onAssetsClick,
	onScrollToBookmarks,
}: {
	onAssetsClick?: () => void;
	onScrollToBookmarks?: () => void;
}) {
	const { openConfigModal } = useSessionStore();
	const [placementOpen, setPlacementOpen] = useState(false);

	// SSR-safe window alias
	const w = typeof window !== "undefined" ? window : undefined;

	// Alt+P global shortcut to open Placement
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.altKey && (e.key === "p" || e.key === "P")) {
				e.preventDefault();
				setPlacementOpen(true);
			}
		};
		w?.addEventListener("keydown", handler);
		return () => w?.removeEventListener("keydown", handler);
	}, []);

	return (
		<div className="flex flex-col items-center gap-1">
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							aria-label="Placement"
							title="Placement (Alt+P)"
							className="size-8 text-foreground hover:bg-muted"
							variant="ghost"
							onClick={() => setPlacementOpen(true)}
						>
							<LayoutGrid className="size-4" />
						</Button>
					</TooltipTrigger>
					<TooltipContent side="left">Placement (Alt+P)</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<Button
				aria-label="Bookmarks"
				className="size-8 text-foreground hover:bg-muted"
				variant="ghost"
				onClick={onScrollToBookmarks}
			>
				<Bookmark className="size-4" />
			</Button>
			<Button
				aria-label="Assets"
				className="size-8 text-foreground hover:bg-muted"
				variant="ghost"
				onClick={onAssetsClick}
			>
				<ImageIcon className="size-4" />
			</Button>
			<Button
				aria-label="Avatar settings"
				className="size-8 text-foreground hover:bg-muted"
				variant="ghost"
				onClick={() => openConfigModal()}
			>
				<Settings className="size-4" />
			</Button>
			<PlacementModal open={placementOpen} onOpenChange={setPlacementOpen} />
		</div>
	);
}
