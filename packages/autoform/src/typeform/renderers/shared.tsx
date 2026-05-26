import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { FieldConfig, ChoiceOption } from "../../utils/utils";
import type { TypeformQuestionType } from "../types";

export type TypeformRendererProps = {
	name: string;
	label: string;
	error?: string;
	cfg: FieldConfig;
	form: UseFormReturn<any>;
	def: z.ZodTypeAny;
	base: z.ZodTypeAny;
	questionType?: TypeformQuestionType;
};

export type TypeformRenderer = (
	props: TypeformRendererProps,
) => React.ReactNode | undefined;

export type TypeformRendererMap = Partial<
	Record<TypeformQuestionType, TypeformRenderer>
>;

export const FieldError: React.FC<{ message?: string }> = ({ message }) => {
	if (!message) return null;
	return (
		<span className="text-xs text-red-500 dark:text-red-400">{message}</span>
	);
};

export const FieldLabel: React.FC<{ label: string; description?: string }> = ({
	label,
	description,
}) => {
	return (
		<div className="flex flex-col">
			<span className="text-sm font-medium text-muted-foreground">{label}</span>
			{description ? (
				<span className="text-xs text-muted-foreground/80">{description}</span>
			) : null}
		</div>
	);
};

export const getOptions = (
	cfg: FieldConfig,
	fallback: ChoiceOption[] = [],
): ChoiceOption[] => {
	if (cfg.options && cfg.options.length) return cfg.options;
	return fallback;
};

export const ensureArray = <T,>(value: T | T[] | undefined): T[] => {
	if (Array.isArray(value)) return value;
	if (typeof value === "undefined") return [];
	return [value];
};
