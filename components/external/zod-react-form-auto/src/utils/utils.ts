/*
===============================================================
 DO NOT EDIT — Zod v4 classic: accessible constructors we rely on
 This package uses Zod v4 (classic build). The following constructors
 are available and safe to reference via `z`:
 - z.ZodObject, z.ZodArray, z.ZodString, z.ZodNumber, z.ZodBoolean
 - z.ZodBigInt, z.ZodDate, z.ZodEnum, z.ZodLiteral, z.ZodUnion
 - z.ZodDiscriminatedUnion, z.ZodIntersection, z.ZodRecord, z.ZodSet
 - z.ZodMap, z.ZodTuple, z.ZodUnknown, z.ZodAny, z.ZodNull, z.ZodUndefined

 NOTE: Wrapper types like "Effects", "Readonly", etc. may not have
 exported constructors on `z`. To unwrap any wrapper, follow the
 internal `_def` chain (innerType | schema | type | out | in | source)
 instead of instanceof checks against non-exported constructors.
===============================================================
*/
import { z } from "zod";

export type Widget =
	| "input"
	| "number"
	| "textarea"
	| "select"
	| "switch"
	| "slider"
	| "password"
	| "radios"
	| "checkboxes"
	| "date-range"
	| "hidden";

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
	// File upload specific overrides
	acceptTypes?: string | string[];
	minFiles?: number;
	maxFiles?: number;
	// Date constraints
	minDate?: Date;
	maxDate?: Date;
	// Link constraints to another field's value (name of the field)
	minDateField?: string;
	maxDateField?: string;
	// Date range support
	endDateField?: string; // used when widget === "date-range" to link end date field name
	holidays?: Date[]; // disabled exact dates
	disableWeekdays?: number[]; // 0=Sun..6=Sat
	withTime?: boolean; // show time pickers alongside date(s)
};

export type FieldsConfig<T> = Partial<Record<keyof T & string, FieldConfig>>;

// Unwrap wrappers like Optional/Nullable/Default/Effects to detect the base type
export function unwrapType(t: z.ZodTypeAny): z.ZodTypeAny {
	let cur: any = t;
	const wrappers: string[] = [];

	let safety = 20;
	while (safety-- > 0 && cur) {
		// Prefer robust detection via _def.typeName to avoid cross-module instanceof issues
		const typeName = (cur as any)?._def?.typeName as string | undefined;
		const isKnownBaseByName = Boolean(
			typeName &&
				[
					"ZodObject",
					"ZodArray",
					"ZodEnum",
					"ZodUnion",
					"ZodLiteral",
					"ZodString",
					"ZodNumber",
					"ZodBoolean",
					"ZodDate",
					"ZodBigInt",
					"ZodRecord",
					"ZodMap",
					"ZodSet",
					"ZodTuple",
					"ZodUnknown",
					"ZodAny",
					"ZodNull",
					"ZodUndefined",
				].includes(typeName),
		);
		const isKnownBaseByInstance =
			cur instanceof z.ZodObject ||
			cur instanceof z.ZodArray ||
			cur instanceof z.ZodEnum ||
			cur instanceof z.ZodUnion ||
			cur instanceof z.ZodLiteral ||
			cur instanceof z.ZodString ||
			cur instanceof z.ZodNumber ||
			cur instanceof z.ZodBoolean ||
			cur instanceof z.ZodDate ||
			cur instanceof z.ZodBigInt ||
			cur instanceof z.ZodRecord ||
			cur instanceof z.ZodMap ||
			cur instanceof z.ZodSet ||
			cur instanceof z.ZodTuple ||
			cur instanceof z.ZodUnknown ||
			cur instanceof z.ZodAny ||
			cur instanceof z.ZodNull ||
			cur instanceof z.ZodUndefined;
		if (isKnownBaseByName || isKnownBaseByInstance) {
			break;
		}
		const def = (cur as any)?._def;
		// Follow wrapper-like pointers; be careful not to drill into array element types.
		// We only use def.type when the current node is NOT an Array/Tuple.
		const isArrayLike =
			typeName === "ZodArray" ||
			cur instanceof z.ZodArray ||
			typeName === "ZodTuple" ||
			cur instanceof z.ZodTuple;
		const next =
			def?.innerType ??
			def?.schema ??
			(!isArrayLike ? def?.type : undefined) ??
			def?.out ??
			def?.in ??
			def?.source;
		if (!next) break;
		wrappers.push(typeName ?? cur?.constructor?.name ?? "unknown");
		cur = next;
	}

	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("unwrapType trace", {
				wrappers,
				base: (cur as any)?._def?.typeName ?? cur?.constructor?.name,
			});
		} catch {}
	}

	return cur as z.ZodTypeAny;
}

// Specifically unwrap only until we reach a ZodObject (used by AutoForm)
export function unwrapToZodObject(
	t: z.ZodTypeAny,
): z.ZodObject<any, any> | z.ZodTypeAny {
	let cur: any = t;
	const wrappers: string[] = [];

	let safety = 20;
	while (safety-- > 0 && cur) {
		if (cur instanceof z.ZodObject) break;
		const def = (cur as any)?._def;
		const next =
			def?.innerType ??
			def?.schema ??
			def?.type ??
			def?.out ??
			def?.in ??
			def?.source;
		if (!next) break;
		wrappers.push(cur?.constructor?.name ?? "unknown");
		cur = next;
	}

	if (process.env.NODE_ENV !== "production") {
		try {
			console.debug("unwrapToZodObject trace", {
				wrappers,
				base: cur?.constructor?.name,
			});
		} catch {}
	}

	return cur as any;
}

export function enumStringValuesFromZodEnum(enumLike: any): string[] {
	// Try known locations first
	const fromDef = (enumLike as any)?._def?.values;
	if (Array.isArray(fromDef)) {
		return fromDef.filter((v): v is string => typeof v === "string");
	}
	if (fromDef && typeof fromDef === "object") {
		return Object.values(fromDef).filter(
			(v): v is string => typeof v === "string",
		);
	}
	const fromOptions = (enumLike as any)?.options;
	if (Array.isArray(fromOptions)) {
		return fromOptions.filter((v): v is string => typeof v === "string");
	}
	if (fromOptions && typeof fromOptions === "object") {
		return Object.values(fromOptions).filter(
			(v): v is string => typeof v === "string",
		);
	}
	// If the input itself is an array of strings, return it
	if (Array.isArray(enumLike)) {
		return (enumLike as unknown[]).filter(
			(v): v is string => typeof v === "string",
		);
	}
	// Safe final fallback for plain objects
	if (enumLike && typeof enumLike === "object") {
		return Object.values(enumLike).filter(
			(v): v is string => typeof v === "string",
		);
	}
	return [];
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

export function parseFileUploadConfig(
	def: any,
	cfg?: FieldConfig,
): {
	accept?: string;
	min?: number;
	max?: number;
} {
	const out: { accept?: string; min?: number; max?: number } = {};
	const desc = String(def?.description ?? "");

	// Accept from cfg
	if (cfg?.acceptTypes) {
		out.accept = Array.isArray(cfg.acceptTypes)
			? cfg.acceptTypes.join(",")
			: cfg.acceptTypes;
	}
	if (typeof cfg?.minFiles === "number") out.min = cfg.minFiles;
	if (typeof cfg?.maxFiles === "number") out.max = cfg.maxFiles;

	if (desc.startsWith("file-upload")) {
		const idx = desc.indexOf(":");
		const kvPart = idx >= 0 ? desc.slice(idx + 1).trim() : "";
		if (kvPart) {
			for (const segment of kvPart.split(";")) {
				const [kRaw, vRaw] = segment.split("=");
				const k = (kRaw ?? "").trim().toLowerCase();
				const v = (vRaw ?? "").trim();
				if (!k) continue;
				if (k === "accept" && v) out.accept = v;
				if (k === "min") {
					const n = Number(v);
					if (Number.isFinite(n)) out.min = n;
				}
				if (k === "max") {
					const n = Number(v);
					if (Number.isFinite(n)) out.max = n;
				}
			}
		}
	}

	return out;
}
