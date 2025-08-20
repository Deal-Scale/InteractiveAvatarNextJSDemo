"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";

export function NumberField({
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
	const { register } = form;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input
				className="rounded-md border border-border bg-background px-3 py-2 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
				type="number"
				{...register(name as any, { valueAsNumber: true })}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}

export function NumberSliderField({
	name,
	label,
	error,
	min,
	max,
	step,
	form,
}: {
	name: string;
	label: string;
	error?: string;
	min?: number;
	max?: number;
	step?: number;
	form: UseFormReturn<any>;
}) {
	const { register } = form;
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted-foreground">{label}</span>
			<input
				className="w-full accent-primary"
				min={min}
				max={max}
				step={step}
				type="range"
				{...register(name as any, { valueAsNumber: true })}
			/>
			{error && (
				<span className="text-xs text-red-500 dark:text-red-400">{error}</span>
			)}
		</div>
	);
}
