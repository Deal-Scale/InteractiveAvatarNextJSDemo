"use client";

import React from "react";
import type { Command } from "@/types/commands";
import { cn } from "@/lib/utils";

export type SlashCommandPaletteProps = {
	anchorRect: DOMRect;
	items: Command[]; // root
	submenuItems?: Command[]; // optional nested
	highlightedIndex: number; // root highlight
	highlightedSubIndex?: number; // submenu highlight
	onHighlight: (index: number) => void; // root
	onHighlightSub?: (index: number) => void; // submenu
	onSelect: (cmd: Command) => void;
	onClose: () => void;
	onOpenSubmenu?: (cmd?: Command) => void; // pass undefined to close submenu
	onBack?: () => void;
};

export const SlashCommandPalette: React.FC<SlashCommandPaletteProps> = ({
	anchorRect,
	items,
	submenuItems,
	highlightedIndex,
	highlightedSubIndex = 0,
	onHighlight,
	onHighlightSub,
	onSelect,
	onClose,
	onOpenSubmenu,
	onBack,
}) => {
	return (
		<div
			role="listbox"
			aria-label="Slash command palette"
			className={cn(
				"fixed z-50 max-h-72 rounded-md border bg-popover text-popover-foreground shadow-md",
				"outline-none",
				"flex",
			)}
			// Always open upward: position at the anchor and translate above with a small gap
			style={{
				left: anchorRect.left,
				top: anchorRect.top - 6,
				transform: "translateY(-100%)",
			}}
		>
			{/* Root column */}
			<div
				className="w-64 max-h-72 overflow-auto p-1"
				onMouseLeave={() => {
					// When pointer leaves the root list, collapse submenu
					onOpenSubmenu?.(undefined);
				}}
			>
				{items.length === 0 ? (
					<div className="px-2 py-1.5 text-sm text-muted-foreground">
						No commands
					</div>
				) : (
					items.map((item, idx) => (
						<div
							key={item.id}
							role="option"
							aria-selected={idx === highlightedIndex}
							className={cn(
								"flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
								idx === highlightedIndex
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground",
							)}
							onMouseEnter={() => {
								onHighlight(idx);
								// Open submenu if present; otherwise close any existing submenu
								if (item.children && item.children.length > 0) {
									onOpenSubmenu?.(item);
								} else {
									onOpenSubmenu?.(undefined);
								}
							}}
							onMouseDown={(e) => {
								// prevent textarea blur
								e.preventDefault();
							}}
							onClick={() => onSelect(item)}
							title={[item.keywords?.join(", ") || "", item.description || ""]
								.filter(Boolean)
								.join(" · ")}
						>
							<div className="flex min-w-0 items-center gap-2">
								{item.icon ? (
									<span className="shrink-0 text-base leading-none">
										{item.icon}
									</span>
								) : null}
								<div className="min-w-0">
									<div className="truncate font-medium">{item.label}</div>
									{item.description ? (
										<div className="truncate text-xs text-muted-foreground">
											{item.description}
										</div>
									) : null}
								</div>
							</div>
							{item.children ? (
								<span className="ml-2 shrink-0 opacity-70">▸</span>
							) : null}
						</div>
					))
				)}
			</div>

			{/* Submenu column (optional) */}
			{submenuItems && submenuItems.length > 0 ? (
				<div className="w-64 max-h-72 overflow-auto border-l p-1">
					{submenuItems.map((item, idx) => (
						<div
							key={item.id}
							role="option"
							aria-selected={idx === highlightedSubIndex}
							className={cn(
								"flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm",
								idx === highlightedSubIndex
									? "bg-accent text-accent-foreground"
									: "hover:bg-accent hover:text-accent-foreground",
							)}
							onMouseEnter={() => onHighlightSub?.(idx)}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => onSelect(item)}
							title={[item.keywords?.join(", ") || "", item.description || ""]
								.filter(Boolean)
								.join(" · ")}
						>
							<div className="flex min-w-0 items-center gap-2">
								{item.icon ? (
									<span className="shrink-0 text-base leading-none">
										{item.icon}
									</span>
								) : null}
								<div className="min-w-0">
									<div className="truncate font-medium">{item.label}</div>
									{item.description ? (
										<div className="truncate text-xs text-muted-foreground">
											{item.description}
										</div>
									) : null}
								</div>
							</div>
						</div>
					))}
				</div>
			) : null}
		</div>
	);
};
