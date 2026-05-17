"use client";

import { KanbanBoard } from "./KanbanBoard";
import NewTaskDialog from "./components/new-task-dialog";

export function ActionsKanbanPanel() {
	return (
		<div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden bg-background p-4 text-foreground">
			<div className="flex shrink-0 items-center justify-between gap-3">
				<div>
					<h2 className="text-base font-semibold">Actions Kanban</h2>
					<p className="text-xs text-muted-foreground">
						Create tasks with the modal, then drag cards between sections.
					</p>
				</div>
				<NewTaskDialog />
			</div>
			<div className="min-h-0 flex-1 overflow-hidden">
				<KanbanBoard />
			</div>
		</div>
	);
}
