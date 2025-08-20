"use client";
import type { FieldsConfig } from "./utils";
import { unwrapType } from "./utils";

import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

import { AutoField } from "./AutoField";

type AutoFormProps<TSchema extends z.ZodObject<any, any>> = {
	schema: TSchema;
	form: UseFormReturn<z.infer<TSchema>>;
	fields?: FieldsConfig<z.infer<TSchema>>;
	onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
	submitLabel?: string;
	className?: string;
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
		if (typeof baseSchema?._def?.shape === "function") {
			shape = baseSchema._def.shape() as Record<string, z.ZodTypeAny>;
		} else if (baseSchema?.shape && typeof baseSchema.shape === "object") {
			shape = baseSchema.shape as Record<string, z.ZodTypeAny>;
		}
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

	const keys = Object.keys(shape);

	// Flatten errors into dotted paths with messages
	const flatErrors = React.useMemo(() => {
		const out: Array<{ name: string; message: string }> = [];
		const walk = (node: any, prefix: string[]) => {
			if (!node) return;
			for (const k of Object.keys(node)) {
				const next = node[k];
				const path = [...prefix, k];
				if (next && typeof next === "object") {
					const msg = (next as any).message as string | undefined;
					if (msg) out.push({ name: path.join("."), message: msg });
					// dive deeper for nested objects
					walk(next as any, path);
				}
			}
		};
		walk(formState.errors as any, []);
		return out;
		// eslint-disable-next-line react-hooks/exhaustive-deps
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

	return (
		<form
			className={className ?? "space-y-3"}
			onSubmit={handleSubmit(onSubmit)}
		>
			{keys.map((key) => {
				const def = shape[key];

				if (process.env.NODE_ENV !== "production") {
					try {
						console.debug("AutoForm field", key, (def as any)?._def?.typeName);
					} catch {}
				}
				// Support nested object fields by rendering their children with dotted names
				if ((def as any)?._def?.typeName === "ZodObject") {
					const innerShape: Record<string, z.ZodTypeAny> =
						typeof (def as any)._def?.shape === "function"
							? ((def as any)._def.shape() as Record<string, z.ZodTypeAny>)
							: ((def as any).shape as Record<string, z.ZodTypeAny>);

					return (
						<fieldset key={key} className="rounded-md border border-border p-2">
							<legend className="px-1 text-xs uppercase tracking-wide text-muted-foreground">
								{key}
							</legend>
							<div className="space-y-2">
								{Object.keys(innerShape).map((childKey) => {
									const name = `${key}.${childKey}`;
									const childDef = innerShape[childKey];

									return (
										<AutoField
											key={name}
											def={childDef}
											fields={fields as any}
											form={form}
											name={name}
										/>
									);
								})}
							</div>
						</fieldset>
					);
				}

				return (
					<AutoField
						key={key}
						def={def}
						fields={fields as any}
						form={form}
						name={key}
					/>
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
			<button
				className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
				disabled={!formState.isValid}
				title={!formState.isValid ? invalidTooltip : undefined}
				type="submit"
			>
				{submitLabel}
			</button>
		</form>
	);
}
