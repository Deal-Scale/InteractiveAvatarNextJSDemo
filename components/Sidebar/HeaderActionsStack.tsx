"use client";

import {
	Bookmark,
	Image as ImageIcon,
	LayoutGrid,
	Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

import PlacementModal from "./PlacementModal";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSessionStore } from "@/lib/stores/session";

export default function HeaderActionsStack({
	onAssetsClick,
	onScrollToBookmarks,
}: {
	onAssetsClick?: () => void;
	onScrollToBookmarks?: () => void;
}) {
	const { openChatSettings } = useSessionStore();
	const [placementOpen, setPlacementOpen] = useState(false);

	// Alt+P global shortcut to open Placement
	useEffect(() => {
		const w = typeof window !== "undefined" ? window : undefined;
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
				aria-label="Chat settings"
				className="size-8 text-foreground hover:bg-muted"
				variant="ghost"
				onClick={() => openChatSettings()}
			>
				<Settings className="size-4" />
			</Button>
			<PlacementModal open={placementOpen} onOpenChange={setPlacementOpen} />
		</div>
	);
}
