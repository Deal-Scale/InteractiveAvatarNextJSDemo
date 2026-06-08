"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

type MermaidActionsMenuProps = {
	isOpen: boolean;
	isTourPinned: boolean;
	onAddToGrid: () => void;
	onCopy: () => void;
	onReload: () => void;
	onToggle: () => void;
	onView: () => void;
	setOpen: (open: boolean) => void;
};

export function MermaidActionsMenu({
	isOpen,
	isTourPinned,
	onAddToGrid,
	onCopy,
	onReload,
	onToggle,
	onView,
	setOpen,
}: MermaidActionsMenuProps) {
	const closeAfterAction = () => {
		if (!isTourPinned) setOpen(false);
	};

	return (
		<div className="absolute right-3 top-3">
			<Button
				aria-label="Mermaid actions"
				className="h-8 w-8 border border-slate-600 bg-slate-800 p-0 text-slate-50 shadow-sm hover:bg-slate-700"
				size="icon"
				type="button"
				variant="secondary"
				data-tour="mermaid-actions"
				onClick={onToggle}
			>
				<MoreHorizontal className="h-4 w-4" />
			</Button>
			{isOpen ? (
				<div className="absolute right-0 top-[calc(100%+0.25rem)] z-[10000] grid min-w-40 gap-1 rounded-md border border-slate-700 bg-slate-950 p-1 text-slate-50 shadow-xl">
					<Button
						className="justify-start bg-slate-900 text-slate-50 hover:bg-slate-800"
						size="sm"
						type="button"
						variant="ghost"
						onClick={() => {
							onView();
							closeAfterAction();
						}}
					>
						View diagram
					</Button>
					<Button
						className="justify-start bg-slate-900 text-slate-50 hover:bg-slate-800"
						size="sm"
						type="button"
						variant="ghost"
						onClick={onReload}
					>
						Reload
					</Button>
					<Button
						className="justify-start bg-slate-900 text-slate-50 hover:bg-slate-800"
						size="sm"
						type="button"
						variant="ghost"
						onClick={onCopy}
					>
						Copy
					</Button>
					<Button
						className="justify-start bg-slate-900 text-slate-50 hover:bg-slate-800"
						size="sm"
						type="button"
						variant="ghost"
						data-tour="mermaid-add-to-grid"
						onClick={onAddToGrid}
					>
						Add to Grid
					</Button>
				</div>
			) : null}
		</div>
	);
}
