"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import EditTaskDialog from "../EditTaskDialog";

export default function NewTaskDialog() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button type="button" onClick={() => setOpen(true)}>
				<Plus className="h-4 w-4" />
				Add Task
			</Button>
			<EditTaskDialog
				open={open}
				onOpenChange={setOpen}
				mode="create"
				initialTab="manual"
			/>
		</>
	);
}
