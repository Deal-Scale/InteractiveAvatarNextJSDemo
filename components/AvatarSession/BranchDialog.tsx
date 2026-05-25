"use client";

import type React from "react";
import { useEffect, useId, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionStore } from "@/lib/stores/session";
import { useAgentStore } from "@/lib/stores/agent";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export interface BranchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	messageContent: string;
	agentName?: string | null;
	actionText: string;
	onActionTextChange: (v: string) => void;
	onConfirm: (targetAgentId: string, targetAgentName: string) => void;
}

export const BranchDialog: React.FC<BranchDialogProps> = ({
	open,
	onOpenChange,
	messageContent,
	agentName,
	actionText,
	onActionTextChange,
	onConfirm,
}) => {
	const actionId = useId();
	const agentSelectId = useId();

	const currentAgent = useAgentStore((s) => s.currentAgent);
	const agentSettings = useSessionStore((s) => s.agentSettings);

	const agents = useMemo(() => {
		const base = [
			{
				id: "agent-1",
				name: "Sales Assistant",
				role: "Revenue",
				icon: "🤖",
			},
			{
				id: "agent-2",
				name: "Support Bot",
				role: "Customer Success",
				icon: "💬",
			},
			{
				id: "agent-3",
				name: "Content Analyst",
				role: "Research",
				icon: "📊",
			},
		];

		if (agentSettings?.id) {
			const exists = base.some((b) => b.id === agentSettings.id);
			if (!exists) {
				return [
					{
						id: agentSettings.id,
						name: agentSettings.name || "Configured Agent",
						role: "Configured",
						icon: "⚙️",
					},
					...base,
				];
			}
		}
		return base;
	}, [agentSettings]);

	const [selectedAgentId, setSelectedAgentId] = useState<string>("");

	useEffect(() => {
		if (open) {
			if (currentAgent?.id && agents.some((a) => a.id === currentAgent.id)) {
				setSelectedAgentId(currentAgent.id);
			} else if (agents.length > 0) {
				setSelectedAgentId(agents[0].id);
			}
		}
	}, [open, currentAgent, agents]);

	const handleConfirm = () => {
		const targetAgent = agents.find((a) => a.id === selectedAgentId);
		onConfirm(selectedAgentId, targetAgent?.name || "Agent");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Branch to agent</DialogTitle>
					<DialogDescription>
						Provide an action for the agent. The original AI response is shown
						for context.
					</DialogDescription>
				</DialogHeader>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="min-h-[200px] rounded-md border bg-muted p-2 text-sm overflow-auto max-h-[380px]">
						<p className="font-medium mb-1 text-muted-foreground">
							Original AI response
						</p>
						<pre className="whitespace-pre-wrap break-words text-foreground/90 font-mono text-xs">
							{messageContent}
						</pre>
					</div>
					<div className="flex flex-col gap-3">
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium" htmlFor={agentSelectId}>
								Target Agent
							</label>
							<Select
								value={selectedAgentId}
								onValueChange={setSelectedAgentId}
							>
								<SelectTrigger
									id={agentSelectId}
									className="bg-popover/90 border-border text-popover-foreground hover:bg-popover focus:ring-2 focus:ring-ring/50"
								>
									<SelectValue placeholder="Select an agent" />
								</SelectTrigger>
								<SelectContent className="z-[70] bg-popover/95 text-popover-foreground border border-border shadow-xl backdrop-blur">
									{agents.map((agent) => (
										<SelectItem
											key={agent.id}
											value={agent.id}
											className="cursor-pointer text-foreground focus:bg-accent data-[highlighted]:bg-accent data-[state=checked]:bg-accent"
										>
											<span className="mr-2">{agent.icon}</span>
											<span>{agent.name}</span>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium" htmlFor={actionId}>
								Action prompt for agent
							</label>
							<Textarea
								id={actionId}
								value={actionText}
								onChange={(e) => onActionTextChange(e.target.value)}
								placeholder="Describe what the agent should do with this response"
								rows={6}
							/>
							<p className="text-xs text-muted-foreground">
								Tip: Be specific about desired output. You can ask the agent to
								propose two alternatives labeled A and B for easier comparison.
							</p>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleConfirm}>Send to agent</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
