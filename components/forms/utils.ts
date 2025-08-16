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
};

export type FieldsConfig<T> = Partial<Record<keyof T & string, FieldConfig>>;

// Unwrap wrappers like Optional/Nullable/Default/Effects to detect the base type
export function unwrapType(t: z.ZodTypeAny): z.ZodTypeAny {
  let cur: any = t;

  while (
    cur?._def?.typeName === "ZodOptional" ||
    cur?._def?.typeName === "ZodNullable" ||
    cur?._def?.typeName === "ZodDefault" ||
    cur?._def?.typeName === "ZodEffects"
  ) {
    if (cur?._def?.innerType) {
      cur = cur._def.innerType;
    } else if (cur?._def?.schema) {
      cur = cur._def.schema;
    } else {
      break;
    }
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
