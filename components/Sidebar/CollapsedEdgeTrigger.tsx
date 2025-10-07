"use client";

import { ChevronRight, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useSessionStore } from "@/lib/stores/session";

export default function CollapsedEdgeTrigger() {
	const { open, setOpen } = useSidebar();
	const { openConfigModal } = useSessionStore();

	if (open) return null;

	return (
		<div className="fixed left-3 bottom-3 z-50 flex flex-col items-start gap-2">
			<Button
				aria-label="Open sidebar"
				className="size-9 inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-md hover:bg-primary/15 backdrop-blur supports-[backdrop-filter]:bg-primary/10"
				variant="ghost"
				onClick={() => setOpen(true)}
			>
				<ChevronRight className="size-5" />
			</Button>
			<Button
				aria-label="Avatar settings"
				className="size-9 inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary shadow-md hover:bg-primary/15 backdrop-blur supports-[backdrop-filter]:bg-primary/10"
				variant="ghost"
				onClick={openConfigModal}
			>
				<Settings className="size-5" />
			</Button>
		</div>
	);
}
