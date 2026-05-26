"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import EditTaskDialog from "../EditTaskDialog";

export default function NewTaskDialog() {
	const [open, setOpen] = useState(false);
	const [initialTab, setInitialTab] = useState<"manual" | "ai">("manual");

	useEffect(() => {
		const openManual = () => {
			setInitialTab("manual");
			setOpen(true);
		};
		const openAi = () => {
			setInitialTab("ai");
			setOpen(true);
		};
		const closeTaskModal = () => {
			setOpen(false);
		};
		window.addEventListener("tour-open-kanban-manual-task-modal", openManual);
		window.addEventListener("tour-open-kanban-ai-task-modal", openAi);
		window.addEventListener("tour-close-kanban-task-modal", closeTaskModal);
		return () => {
			window.removeEventListener(
				"tour-open-kanban-manual-task-modal",
				openManual,
			);
			window.removeEventListener("tour-open-kanban-ai-task-modal", openAi);
			window.removeEventListener(
				"tour-close-kanban-task-modal",
				closeTaskModal,
			);
		};
	}, []);

	return (
		<>
			<Button
				type="button"
				data-tour="kanban-add-task"
				onClick={() => {
					setInitialTab("manual");
					setOpen(true);
				}}
			>
				<Plus className="h-4 w-4" />
				Add Task
			</Button>
			<EditTaskDialog
				open={open}
				onOpenChange={setOpen}
				mode="create"
				initialTab={initialTab}
			/>
		</>
	);
}
