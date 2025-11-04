import { z } from "zod";

export type Widget =
	| "input"
	| "number"
	| "textarea"
	| "select"
	| "switch"
	| "slider"
	| "password";

export type FieldConfig = {
	label?: string;
	widget?: Widget;
	options?: Array<{ value: string; label: string }>;
	min?: number;
	max?: number;
	step?: number;
	multiple?: boolean;
	rows?: number;
	placeholder?: string;
	disabled?: boolean;
	helpText?: string;
};

export type FieldsConfig<T> = Partial<Record<keyof T & string, FieldConfig>>;

// Unwrap wrappers like Optional/Nullable/Default/Effects to detect the base type
export function unwrapType(t: z.ZodTypeAny): z.ZodTypeAny {
	let cur: any = t;
	const trace: string[] = [];

	// To avoid infinite loops, cap the number of unwrap iterations
	let safety = 20;
	while (safety-- > 0) {
		const tn = cur?._def?.typeName as string | undefined;
		if (!tn) break;

		// List of wrapper typeNames we want to unwrap through
		const isWrapper =
			tn === "ZodOptional" ||
			tn === "ZodNullable" ||
			tn === "ZodDefault" ||
			tn === "ZodEffects" ||
			tn === "ZodReadonly" ||
			tn === "ZodBranded" ||
			tn === "ZodPromise" ||
			tn === "ZodCatch" ||
			tn === "ZodPipeline";
		if (!isWrapper) break;

		trace.push(tn);

		// Common inner references used by Zod wrappers
		if (cur?._def?.innerType) {
			cur = cur._def.innerType;
			continue;
		}
		if (cur?._def?.schema) {
			cur = cur._def.schema;
			continue;
		}
		// ZodPromise
		if (cur?._def?.type) {
			cur = cur._def.type;
			continue;
		}
		// ZodPipeline (in/out); prefer out if present, else in/source
		if (cur?._def?.out) {
			cur = cur._def.out;
			continue;
		}
		if (cur?._def?.in) {
			cur = cur._def.in;
			continue;
		}
		if (cur?._def?.source) {
			cur = cur._def.source;
			continue;
		}
		break;
	}

	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("unwrapType trace", {
				wrappers: trace,
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
