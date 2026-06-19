"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GripVertical, MoreVertical, Pencil, Trash } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export function DragHeader({
	attributes,
	listeners,
	onEdit,
	onDelete,
	aiControls,
	className = "",
}: {
	attributes: HTMLAttributes<HTMLElement>;
	listeners?: HTMLAttributes<HTMLElement>;
	onEdit: () => void;
	onDelete: () => void;
	aiControls?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`relative flex min-w-0 flex-row flex-wrap items-center gap-x-1 gap-y-1 overflow-hidden border-secondary border-b-2 px-3 py-2 ${className}`}
		>
			<Button
				variant="ghost"
				{...attributes}
				{...listeners}
				className="-ml-2 h-auto shrink-0 cursor-grab p-1 text-secondary-foreground/50"
			>
				<span className="sr-only">Move task</span>
				<GripVertical />
			</Button>
			<Badge variant="outline" className="shrink-0 font-semibold">
				Task
			</Badge>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Open quick actions</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-36">
					<DropdownMenuItem onClick={onEdit}>
						<Pencil className="mr-2 h-4 w-4" /> Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={onDelete}
					>
						<Trash className="mr-2 h-4 w-4" /> Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{aiControls && (
				<div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1">
					{aiControls}
				</div>
			)}
		</div>
	);
}
