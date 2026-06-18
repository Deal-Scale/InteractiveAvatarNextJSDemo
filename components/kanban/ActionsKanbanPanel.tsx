"use client";

import { KanbanBoard } from "./KanbanBoard";
import NewTaskDialog from "./components/new-task-dialog";

export function ActionsKanbanPanel() {
	return (
		<div
			data-tour="kanban-page"
			className="flex min-h-full flex-1 flex-col gap-3 bg-background p-4 text-foreground"
		>
			<div
				data-tour="kanban-header"
				className="flex shrink-0 items-center justify-between gap-3"
			>
				<div>
					<h2 className="font-semibold text-base">Actions Kanban</h2>
					<p className="text-muted-foreground text-xs">
						Create tasks with the modal, then drag cards between sections.
					</p>
				</div>
				<div>
					<NewTaskDialog />
				</div>
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<KanbanBoard />
			</div>
		</div>
	);
}
