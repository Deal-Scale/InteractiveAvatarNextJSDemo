import { z } from "zod";

import type { TypeformQuestionType } from "../typeform/types";

export type Widget =
	| "input"
	| "number"
	| "textarea"
	| "select"
	| "switch"
	| "slider"
	| "password"
	| "date"
	| "date-range";

export type ChoiceOption = {
	value: string;
	label: string;
	description?: string;
	imageUrl?: string;
	icon?: string;
};

export type FieldConfig = {
	label?: string;
	widget?: Widget;
	options?: ChoiceOption[];
	min?: number;
	max?: number;
	step?: number;
	multiple?: boolean;
	rows?: number;
	placeholder?: string;
	// Calendar UI options (for date/date-range widgets)
	numberOfMonths?: number;
	captionLayout?: "dropdown" | "buttons";
	fromYear?: number;
	toYear?: number;
	description?: string;
	helperText?: string;
	questionType?: TypeformQuestionType;
	questionSettings?: Record<string, unknown> & {
		legalText?: string;
		contactFields?: string[];
		addressFields?: string[];
		fieldLabels?: Record<string, string>;
		phonePattern?: string;
		ratingMax?: number;
		ratingIcon?: string;
		npsLabels?: string[];
		ranking?: { enforceUnique?: boolean };
		matrix?: {
			rows: string[];
			columns: string[];
			multiSelect?: boolean;
		};
		pictureChoice?: boolean;
		videoAccept?: string;
		calendlyUrl?: string;
		payment?: {
			currency?: string;
			minimum?: number;
			maximum?: number;
		};
		clarifyPrompt?: string;
		content?: string;
	};
};

export type FieldsConfig<T> = Partial<Record<keyof T & string, FieldConfig>>;

// Unwrap wrappers like Optional/Nullable/Default/Effects to detect the base type
export function unwrapType(t: z.ZodTypeAny): z.ZodTypeAny {
	let cur: any = t;
	const wrappers: string[] = [];

	let safety = 20;
	while (safety-- > 0 && cur) {
		const tn = cur?._def?.typeName as string | undefined;
		const isWrapper = [
			"ZodOptional",
			"ZodNullable",
			"ZodDefault",
			"ZodEffects",
			"ZodReadonly",
			"ZodBranded",
			"ZodPromise",
			"ZodCatch",
			"ZodPipeline",
		].includes(tn ?? "");
		if (!isWrapper) break;

		const def = (cur as any)?._def;
		const next =
			def?.innerType ??
			def?.schema ??
			def?.type ??
			def?.out ??
			def?.in ??
			def?.source;
		if (!next) break;
		wrappers.push(tn ?? cur?.constructor?.name ?? "unknown");
		cur = next;
	}

	if (process.env.NODE_ENV !== "production") {
		try {
			console.log("unwrapType trace", {
				wrappers,
				base: cur?._def?.typeName,
			});
		} catch {}
	}

	return cur as z.ZodTypeAny;
}

export function enumStringValuesFromZodEnum(enumLike: any): string[] {
	const raw = (enumLike as any).options ?? enumLike;
	const values: unknown[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});

	return values.filter((v): v is string => typeof v === "string");
}

export function optionsFromStrings(values: string[]) {
	return values.map((v) => ({ value: v, label: v }));
}

export function booleanSelectOptions(
	custom?: Array<{ value: string; label: string }>,
) {
	return (
		custom ?? [
			{ value: "true", label: "True" },
			{ value: "false", label: "False" },
		]
	);
}

export function isSensitiveString(def: any, cfg?: FieldConfig) {
	const desc = def?.description?.toLowerCase?.() ?? "";

	return (
		desc.includes("sensitive") ||
		desc.includes("password") ||
		cfg?.widget === "password"
	);
}

export function isMultilineString(def: any, cfg?: FieldConfig) {
	const desc = def?.description?.toLowerCase?.() ?? "";

	return desc.includes("multiline") || cfg?.widget === "textarea";
}
