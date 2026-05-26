"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
	listeners: any;
	onEdit: () => void;
	onDelete: () => void;
	aiControls?: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`relative flex flex-row flex-wrap items-center gap-x-1 gap-y-1 border-secondary border-b-2 px-3 py-2 ${className}`}
		>
			<Button
				variant="ghost"
				{...attributes}
				{...listeners}
				className="-ml-2 h-auto cursor-grab p-1 text-secondary-foreground/50 shrink-0"
			>
				<span className="sr-only">Move task</span>
				<GripVertical />
			</Button>
			<Badge variant="outline" className="font-semibold shrink-0">
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
				<div className="flex flex-wrap items-center gap-1 ml-auto">
					{aiControls}
				</div>
			)}
		</div>
	);
}
