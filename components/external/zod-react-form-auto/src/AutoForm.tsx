"use client";
import type { FieldsConfig } from "./utils/utils";
import { unwrapToZodObject } from "./utils/utils";

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
	// Unwrap potential wrappers (Effects/Readonly/Branded/Pipeline/etc) but stop at ZodObject
	const baseSchema = unwrapToZodObject(
		schema as unknown as z.ZodTypeAny,
	) as any;
	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("[AutoFormDebug] baseSchema", {
				incomingType: (schema as any)?.constructor?.name,
				baseType: (baseSchema as any)?.constructor?.name,
				shapeKeys:
					typeof baseSchema?._def?.shape === "function"
						? Object.keys((baseSchema._def.shape() as any) ?? {})
						: Object.keys((baseSchema?.shape as any) ?? {}),
			});
		} catch {}
	}

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
					incomingType: (schema as any)?.constructor?.name,
					baseType: (baseSchema as any)?.constructor?.name,
				});
			} catch {}
		}
		shape = {} as any;
	}

	const keys = Object.keys(shape);

	return (
		<form
			className={className ?? "space-y-3"}
			onSubmit={handleSubmit(onSubmit)}
		>
			{keys.map((key) => {
				const def = shape[key];

				if (process.env.NODE_ENV !== "production") {
					try {
						console.debug("[AutoFormDebug] field", {
							key,
							type: def?.constructor?.name,
							defType: typeof def,
							defKeys:
								def && typeof def === "object"
									? Object.keys(def as any)
									: undefined,
						});
					} catch {}
				}
				// Support nested object fields by rendering their children with dotted names
				if (def instanceof z.ZodObject) {
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
			<button
				className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
				disabled={!formState.isValid}
				type="submit"
			>
				{submitLabel}
			</button>
		</form>
	);
}
