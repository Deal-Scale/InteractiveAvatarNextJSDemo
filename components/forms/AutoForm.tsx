"use client";

import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoField } from "./AutoField";
import type { FieldsConfig } from "./utils";
import { unwrapType } from "./utils";

type AutoFormProps<TSchema extends z.ZodObject<any, any>> = {
	schema: TSchema;
	form: UseFormReturn<z.infer<TSchema>>;
	fields?: FieldsConfig<z.infer<TSchema>>;
	onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
	submitLabel?: string;
	className?: string;
};

const getZodKind = (def: unknown): string | undefined =>
	((def as any)?._def?.typeName ?? (def as any)?._def?.type) as
		| string
		| undefined;

const getObjectShape = (
	def: unknown,
): Record<string, z.ZodTypeAny> | undefined => {
	const candidate = def as any;
	if (typeof candidate?._def?.shape === "function") {
		return candidate._def.shape() as Record<string, z.ZodTypeAny>;
	}
	if (candidate?.shape && typeof candidate.shape === "object") {
		return candidate.shape as Record<string, z.ZodTypeAny>;
	}
	if (candidate?._def?.shape && typeof candidate._def.shape === "object") {
		return candidate._def.shape as Record<string, z.ZodTypeAny>;
	}
	return undefined;
};

const sectionToneClassName = (tone: string | undefined) => {
	if (tone === "video") {
		return {
			wrapper:
				"border-sky-300/80 bg-sky-50/70 dark:border-sky-500/35 dark:bg-sky-500/10",
			badge:
				"border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/15 dark:text-sky-200",
		};
	}
	if (tone === "voice") {
		return {
			wrapper:
				"border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-500/35 dark:bg-emerald-500/10",
			badge:
				"border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200",
		};
	}
	if (tone === "tools") {
		return {
			wrapper:
				"border-violet-300/80 bg-violet-50/70 dark:border-violet-500/35 dark:bg-violet-500/10",
			badge:
				"border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-200",
		};
	}
	if (tone === "text") {
		return {
			wrapper:
				"border-amber-300/80 bg-amber-50/70 dark:border-amber-500/35 dark:bg-amber-500/10",
			badge:
				"border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200",
		};
	}
	return {
		wrapper: "border-border bg-muted/20",
		badge:
			"border-border bg-muted text-muted-foreground dark:border-border dark:bg-muted",
	};
};

export function AutoForm<TSchema extends z.ZodObject<any, any>>({
	schema,
	form,
	fields = {},
	onSubmit,
	submitLabel = "Save",
	className,
}: AutoFormProps<TSchema>) {
	const { handleSubmit, formState } = form;
	// Unwrap potential wrappers (Effects/Readonly/Branded/Pipeline/etc) to reach the ZodObject
	const baseSchema = unwrapType(schema as unknown as z.ZodTypeAny) as any;

	// Support Zod versions where shape is a function vs. a plain object
	let shape: Record<string, z.ZodTypeAny> = {} as any;
	try {
		shape = getObjectShape(baseSchema) ?? ({} as any);
	} catch {}

	if (!shape || Object.keys(shape).length === 0) {
		if (process.env.NODE_ENV !== "production") {
			try {
				console.warn("AutoForm: empty shape", {
					incomingType: (schema as any)?._def?.typeName,
					baseType: (baseSchema as any)?._def?.typeName,
				});
			} catch {}
		}
		shape = {} as any;
	}

	const schemaKeys = Object.keys(shape);
	const keys = React.useMemo(() => {
		const seen = new Set<string>();
		const configuredTopLevelKeys = Object.keys(fields)
			.map((key) => key.split(".")[0])
			.filter((key) => {
				if (seen.has(key) || !(key in shape)) return false;
				seen.add(key);
				return true;
			});

		return [
			...configuredTopLevelKeys,
			...schemaKeys.filter((key) => !seen.has(key)),
		];
	}, [fields, schemaKeys, shape]);

	// Flatten errors into dotted paths with messages (cycle-safe and selective)
	const flatErrors = React.useMemo(() => {
		const out: Array<{ name: string; message: string }> = [];
		const visited = new WeakSet<object>();
		const skipKeys = new Set(["message", "type", "types", "ref"]);
		const walk = (node: any, prefix: string[]) => {
			if (!node || typeof node !== "object") return;
			if (visited.has(node as object)) return;
			visited.add(node as object);
			for (const k of Object.keys(node)) {
				if (skipKeys.has(k)) continue;
				const next = (node as any)[k];
				const path = [...prefix, k];
				if (next && typeof next === "object") {
					const msg = (next as any).message as string | undefined;
					if (msg) out.push({ name: path.join("."), message: msg });
					walk(next as any, path);
				}
			}
		};
		walk(formState.errors as any, []);
		return out;
	}, [formState.errors]);

	const invalidSummary = React.useMemo(() => {
		if (!flatErrors.length) return null;
		return flatErrors.map(({ name, message }) => {
			const label =
				(fields as any)?.[name]?.label ?? name.split(".").pop() ?? name;
			// Normalize vague message for consistency
			const norm =
				String(message).trim().toLowerCase() === "invalid input"
					? `${label} is required`
					: message;
			return { label, message: norm };
		});
	}, [flatErrors, fields]);

	// Tooltip text for disabled submit
	const invalidTooltip = React.useMemo(() => {
		if (!invalidSummary || invalidSummary.length === 0) return undefined;
		return invalidSummary.map((it) => `${it.label}: ${it.message}`).join("\n");
	}, [invalidSummary]);

	const renderField = (
		fieldKey: string,
		def: z.ZodTypeAny,
		parentPath: string[] = [],
	): React.ReactNode => {
		const name = [...parentPath, fieldKey].join(".");
		const baseDef = unwrapType(def as unknown as z.ZodTypeAny) as any;
		const cfg = (fields as any)?.[name] ?? (fields as any)?.[fieldKey];

		if (cfg?.hidden) return null;

		if (process.env.NODE_ENV !== "production") {
			try {
				console.debug("AutoForm field", name, {
					raw: (def as any)?._def?.typeName,
					base: getZodKind(baseDef),
				});
			} catch {}
		}

		const innerShape = getObjectShape(baseDef);
		const isObject =
			getZodKind(baseDef) === "ZodObject" ||
			getZodKind(baseDef) === "object" ||
			Boolean(innerShape);

		if (isObject && innerShape) {
			const legendLabel = cfg?.label ?? fieldKey;
			const children = Object.keys(innerShape)
				.map((childKey) =>
					renderField(childKey, innerShape[childKey], [
						...parentPath,
						fieldKey,
					]),
				)
				.filter(Boolean);

			if (children.length === 0) return null;

			return (
				<fieldset key={name} className="rounded-md border border-border p-2">
					<legend className="px-1 text-xs uppercase tracking-wide text-muted-foreground">
						{legendLabel}
					</legend>
					<div className="space-y-2">{children}</div>
				</fieldset>
			);
		}

		return (
			<AutoField
				key={name}
				def={def}
				fields={fields as any}
				form={form}
				name={name}
			/>
		);
	};

	const renderedGroups = React.useMemo(() => {
		const groups: Array<{
			key: string;
			section?: {
				label: string;
				tone?: "text" | "voice" | "video" | "tools" | "general";
				description?: string;
			};
			nodes: React.ReactNode[];
			advanced?: Array<{
				name: string;
				label: string;
				resetLabel: string;
				defaultValue: unknown;
				node: React.ReactNode;
			}>;
		}> = [];
		const sectionIndex = new Map<string, number>();

		for (const key of keys) {
			const cfg = (fields as any)?.[key];
			const node = renderField(key, shape[key]);

			if (!node) continue;

			const section = cfg?.section;
			const sectionKey = section
				? `${section.label}:${section.tone ?? "general"}`
				: undefined;

			const addNodeToGroup = (group: (typeof groups)[number]) => {
				if (cfg?.advanced) {
					group.advanced = group.advanced ?? [];
					group.advanced.push({
						name: key,
						label: cfg.advanced.label ?? "Advanced",
						resetLabel: cfg.advanced.resetLabel ?? "Reset to defaults",
						defaultValue: cfg.defaultValue,
						node,
					});
					return;
				}
				group.nodes.push(node);
			};

			if (sectionKey && sectionIndex.has(sectionKey)) {
				addNodeToGroup(groups[sectionIndex.get(sectionKey)!]);
				continue;
			}

			const nextGroup = {
				key: sectionKey ?? `ungrouped-${key}`,
				section,
				nodes: [] as React.ReactNode[],
				advanced: undefined as
					| Array<{
							name: string;
							label: string;
							resetLabel: string;
							defaultValue: unknown;
							node: React.ReactNode;
					  }>
					| undefined,
			};
			addNodeToGroup(nextGroup);
			groups.push(nextGroup);

			if (sectionKey) {
				sectionIndex.set(sectionKey, groups.length - 1);
			}
		}

		return groups;
	}, [fields, form, keys, shape]);

	return (
		<form
			className={className ?? "space-y-3"}
			onSubmit={handleSubmit(onSubmit)}
		>
			{renderedGroups.map((group) => {
				if (!group.section) {
					return <React.Fragment key={group.key}>{group.nodes}</React.Fragment>;
				}

				const tone = sectionToneClassName(group.section.tone);
				const advancedItems = group.advanced ?? [];
				const advancedLabel = advancedItems[0]?.label ?? "Advanced";
				const advancedResetLabel =
					advancedItems[0]?.resetLabel ?? "Reset to defaults";
				const resetAdvanced = () => {
					for (const item of advancedItems) {
						if (item.defaultValue !== undefined) {
							form.setValue(item.name as any, item.defaultValue as any, {
								shouldDirty: true,
								shouldValidate: true,
							});
						}
					}
				};

				return (
					<details
						key={group.key}
						className={clsx("group rounded-md border", tone.wrapper)}
						open
					>
						<summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
							<span
								className={clsx(
									"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
									tone.badge,
								)}
							>
								{group.section.label}
							</span>
							{group.section.description ? (
								<span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
									{group.section.description}
								</span>
							) : (
								<span className="flex-1" />
							)}
							<ChevronRight
								className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
								aria-hidden="true"
							/>
						</summary>
						<div className="space-y-3 border-t border-border/70 p-3">
							{group.nodes}
						</div>
						{advancedItems.length > 0 ? (
							<details className="mx-3 mb-3 rounded-md border border-border bg-background/60">
								<summary className="flex cursor-pointer select-none items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-foreground">
									<span>{advancedLabel}</span>
									<button
										type="button"
										className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
										onClick={(event) => {
											event.preventDefault();
											resetAdvanced();
										}}
									>
										{advancedResetLabel}
									</button>
								</summary>
								<div className="space-y-3 border-t border-border p-3">
									{advancedItems.map((item) => (
										<React.Fragment key={item.name}>{item.node}</React.Fragment>
									))}
								</div>
							</details>
						) : null}
					</details>
				);
			})}
			{Boolean(invalidSummary?.length) && (
				<div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs">
					<div className="mb-1 font-medium text-destructive">
						{invalidSummary!.length} field
						{invalidSummary!.length > 1 ? "s" : ""} need attention
					</div>
					<ul className="list-inside list-disc space-y-0.5 text-destructive">
						{invalidSummary!.map((it) => (
							<li key={it.label}>
								<span className="font-medium">{it.label}:</span> {it.message}
							</li>
						))}
					</ul>
				</div>
			)}
			{!formState.isValid ? (
				<TooltipProvider>
					<Tooltip
						onOpenChange={(open) => {
							if (open) {
								try {
									void form.trigger();
								} catch {}
							}
						}}
					>
						<TooltipTrigger asChild>
							<span className="inline-block">
								<button
									className="pointer-events-none inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
									disabled
									type="submit"
								>
									{submitLabel}
								</button>
							</span>
						</TooltipTrigger>
						<TooltipContent forceMount>
							<div className="max-w-xs whitespace-pre-wrap">
								{formState.isValidating
									? "Validating..."
									: (invalidTooltip ?? "Complete required fields")}
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				<button
					className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
					type="submit"
				>
					{submitLabel}
				</button>
			)}
		</form>
	);
}
