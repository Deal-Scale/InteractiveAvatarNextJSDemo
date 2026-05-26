"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { KanbanColumn, KanbanTask } from "../utils/types";
import { useDndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ColumnActions } from "./column-action";
import { defaultCols } from "../utils/mocks";
import { TaskCard } from "./task-card";

export type ColumnType = "Column";

export interface ColumnDragData {
	type: ColumnType;
	column: KanbanColumn;
}

interface BoardColumnProps {
	column: KanbanColumn;
	tasks: KanbanTask[];
	isOverlay?: boolean;
}

export function BoardColumn({ column, tasks, isOverlay }: BoardColumnProps) {
	const tasksIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const {
		setNodeRef,
		attributes,
		listeners,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: column.id,
		data: {
			type: "Column",
			column,
		} satisfies ColumnDragData,
		attributes: { roleDescription: `Column: ${column.title}` },
	});

	const style = { transition, transform: CSS.Translate.toString(transform) };

	const variants = cva(
		"w-[350px] max-w-full bg-secondary flex flex-col flex-shrink-0 snap-center overflow-hidden",
		{
			variants: {
				dragging: {
					default: "border-2 border-transparent",
					over: "ring-2 opacity-30",
					overlay: "ring-2 ring-primary",
				},
			},
		},
	);

	const defaultColIds = new Set(defaultCols.map((col) => col.id));

	// Pass height down as inline style so column fills the parent container height
	return (
		<Card
			ref={setNodeRef}
			style={{ ...style, height: "100%" }}
			className={variants({
				dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
			})}
		>
			<CardHeader className="space-between flex shrink-0 flex-row items-center border-b-2 p-4 text-left font-semibold">
				<Button
					variant={"ghost"}
					{...attributes}
					{...listeners}
					className="-ml-2 relative h-auto cursor-grab p-1 text-primary/50"
				>
					<span className="sr-only">{`Move column: ${column.title}`}</span>
					<GripVertical />
				</Button>
				<span className="!mt-0 mr-auto font-semibold text-base">
					{column.title}
				</span>
				{!defaultColIds.has(column.id) && (
					<ColumnActions title={column.title} id={String(column.id)} />
				)}
			</CardHeader>
			<CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
				<ScrollArea className="flex-1 w-full">
					<div className="flex flex-col gap-6 pl-3 pr-4 pt-3 pb-6">
						<SortableContext items={tasksIds}>
							{tasks.map((task) => (
								<TaskCard key={task.id} task={task} />
							))}
						</SortableContext>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
	const dndContext = useDndContext();
	return (
		<div className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden">
			<div
				className={`flex flex-row gap-4 px-2 md:px-0 h-full items-start ${
					dndContext.active ? "snap-none" : ""
				}`}
			>
				{children}
			</div>
		</div>
	);
}
