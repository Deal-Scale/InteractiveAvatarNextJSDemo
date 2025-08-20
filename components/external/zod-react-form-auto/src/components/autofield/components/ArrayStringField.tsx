"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function ArrayStringField({
	name,
	label,
	error,
	rows,
	placeholder,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	rows?: number;
	placeholder?: string;
	form: UseFormReturn<any>;
}) {
	const { register, watch, setValue } = form;
	const currentRaw = watch(name as any) as any;
	const current = Array.isArray(currentRaw)
		? (currentRaw as string[])
		: undefined;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<textarea
				className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				placeholder={placeholder ?? "Enter values, one per line"}
				rows={rows ?? 5}
				value={(current ?? []).join("\n")}
				onChange={(e) => {
					const arr = e.target.value
						.split("\n")
						.map((s) => s.trim())
						.filter(Boolean);
					setValue(name as any, arr as any, {
						shouldValidate: true,
						shouldDirty: true,
					});
				}}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
