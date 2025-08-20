"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "../../../../../../ui/calendar";

export function DateField({
	name,
	label,
	error,
	minDate,
	maxDate,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	minDate?: Date;
	maxDate?: Date;
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
					disabled={(date) => {
						const d = new Date(
							date.getFullYear(),
							date.getMonth(),
							date.getDate(),
						);
						if (minDate) {
							const m = new Date(
								minDate.getFullYear(),
								minDate.getMonth(),
								minDate.getDate(),
							);
							if (d < m) return true;
						}
						if (maxDate) {
							const M = new Date(
								maxDate.getFullYear(),
								maxDate.getMonth(),
								maxDate.getDate(),
							);
							if (d > M) return true;
						}
						return false;
					}}
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
