"use client";

import type { Agent } from "./AgentCard";

import React, { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AgentPreview from "./AgentPreview";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AutoForm } from "@/components/forms/AutoForm";
import { AgentConfigSchema } from "@/lib/schemas/agent";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AgentModal(props: {
	mode: "view" | "edit" | "create";
	agent?: Agent | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: (agent: Agent) => void; // used for edit and create
	onStartPreview?: (agent: Agent) => void; // optional action in view mode
	onRequestEdit?: () => void; // request parent to switch to edit mode
}) {
	const {
		mode,
		agent,
		open,
		onOpenChange,
		onSave,
		onStartPreview,
		onRequestEdit,
	} = props;

	const [draft, setDraft] = useState<Agent | null>(null);

	// initial blank for create mode
	const initialCreate: Agent = useMemo(
		() => ({
			id: "new",
			name: "",
			avatarUrl: "",
			role: "",
			description: "",
			tags: [],
		}),
		[],
	);

	const effectiveMode = mode;
	const working = useMemo<Agent | null>(() => {
		if (effectiveMode === "create") return draft ?? initialCreate;
		return (draft as Agent | null) ?? agent ?? null;
	}, [effectiveMode, draft, agent, initialCreate]);

	// Reset when dialog is opened
	React.useEffect(() => {
		if (open) setDraft(null);
	}, [open]);

	// Reset when the target agent changes
	React.useEffect(() => {
		if (agent?.id != null) setDraft(null);
	}, [agent?.id]);

	// Do not early-return before hooks; instead render conditionally below
	const hasWorking = Boolean(working);

	const isView = effectiveMode === "view";
	const isEdit = effectiveMode === "edit";
	const isCreate = effectiveMode === "create";

	// Combined schema: full AgentConfig + sidebar-only fields + create-only monetization fields
	const AgentFormSchema = useMemo(() => {
		const base = AgentConfigSchema as unknown as z.ZodObject<any>;
		return base.extend({
			role: z.string().optional(),
			avatarUrl: z.string().url().optional().or(z.literal("")).optional(),
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
			// create-mode extras
			monetize: z.boolean().optional().default(false),
			// keep as string to align with select options below
			rateMultiplier: z.enum(["1", "2", "3", "4", "5"]).optional(),
		});
	}, []);

	// Single form instance used for both edit and create
	const form = useForm<z.infer<typeof AgentFormSchema>>({
		resolver: zodResolver(AgentFormSchema),
		mode: "onChange",
		defaultValues: {
			id: (working as any)?.id || "new",
			name: working?.name || "",
			avatarId: undefined as any,
			role: working?.role || "",
			avatarUrl: working?.avatarUrl || "",
			description: working?.description || "",
			tags: working?.tags || [],
			monetize: false,
			rateMultiplier: "1",
		},
	});

	React.useEffect(() => {
		// Sync form defaults when switching target or mode
		form.reset({
			id: (working as any)?.id || "new",
			name: working?.name || "",
			avatarId: undefined as any,
			role: working?.role || "",
			avatarUrl: working?.avatarUrl || "",
			description: working?.description || "",
			tags: working?.tags || [],
			monetize: false,
			rateMultiplier: "1",
		});
	}, [working, form]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[96vw] md:w-[640px] max-w-[96vw] p-4 md:p-6 bg-card text-foreground flex flex-col max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>
						{isCreate && <span className="font-semibold">Create Agent</span>}
						{isEdit && (
							<span className="font-semibold">{`Edit Agent: ${working?.name || "Untitled"}`}</span>
						)}
						{isView && (
							<span className="font-semibold">{working?.name || "Agent"}</span>
						)}
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto">
					{isView ? (
						<div className="space-y-4">
							{hasWorking && <AgentPreview agent={working as Agent} />}
							<div className="flex justify-end gap-2">
								{(agent?.isOwnedByUser ?? false) && (
									<Button
										type="button"
										variant="outline"
										onClick={() => onRequestEdit?.()}
									>
										Edit
									</Button>
								)}
								<Button
									type="button"
									variant="ghost"
									onClick={() => onOpenChange(false)}
								>
									Close
								</Button>
								<Button
									type="button"
									variant="default"
									onClick={() => onStartPreview?.(working as Agent)}
								>
									Start / Preview
								</Button>
							</div>
						</div>
					) : (
						<>
							{isCreate && (
								<div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
									<span className="font-medium">Monetization</span>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs cursor-help"
												aria-label="Monetization info"
											>
												?
											</button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												To monetize your agent, multiply by the current base
												agent rate.
											</p>
										</TooltipContent>
									</Tooltip>
								</div>
							)}
							{(() => {
								const monetize = form.watch("monetize");
								const fields: any = {
									name: { label: "Name" },
									role: { label: "Role" },
									avatarUrl: { label: "Avatar URL" },
									description: { label: "Description", widget: "textarea" },
									tags: { label: "Tags" },
								};
								if (isCreate) {
									fields.monetize = { label: "Monetize" };
									if (monetize) {
										fields.rateMultiplier = {
											label: "Multiplier",
											widget: "select",
											options: [
												{ label: "1x", value: "1" },
												{ label: "2x", value: "2" },
												{ label: "3x", value: "3" },
												{ label: "4x", value: "4" },
												{ label: "5x", value: "5" },
											],
										};
									}
								}
								return (
									<AutoForm
										className="space-y-3"
										schema={AgentFormSchema}
										form={form as any}
										fields={fields}
										submitLabel={isCreate ? "Create" : "Save"}
										onSubmit={(values: z.infer<typeof AgentFormSchema>) => {
											const name = String(values.name ?? "");
											const role =
												values.role != null ? String(values.role) : "";
											const avatarUrl =
												values.avatarUrl != null
													? String(values.avatarUrl)
													: "";
											const description =
												values.description != null
													? String(values.description)
													: "";
											const tags: string[] = Array.isArray(values.tags)
												? (values.tags as string[])
												: typeof (values as any).tags === "string"
													? ((values as any).tags as string)
															.split(",")
															.map((s: string) => s.trim())
															.filter(Boolean)
													: [];

											const next: Agent = {
												id:
													(values as any)?.id ||
													working?.id ||
													`new-${Date.now()}`,
												name,
												role,
												avatarUrl,
												description,
												tags,
												isOwnedByUser: isCreate ? true : working?.isOwnedByUser,
											};
											onSave?.(next);
											onOpenChange(false);
										}}
									/>
								);
							})()}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
