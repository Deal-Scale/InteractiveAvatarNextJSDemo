"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../../../../../../ui/calendar";

export function DateField({
	name,
	label,
	error,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	form: UseFormReturn<any>;
}) {
	const { register, watch, setValue } = form;
	const current = watch(name as any) as any as Date | undefined;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input type="hidden" {...register(name as any)} />
			<div className="rounded-md border border-border p-2">
				<Calendar
					mode="single"
					selected={current}
					onSelect={(d) =>
						setValue(name as any, (d ?? undefined) as any, {
							shouldValidate: true,
							shouldDirty: true,
							shouldTouch: true,
						})
					}
					initialFocus
				/>
			</div>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
