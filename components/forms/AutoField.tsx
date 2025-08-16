"use client";
import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

import {
  unwrapType,
  enumStringValuesFromZodEnum,
  optionsFromStrings,
  booleanSelectOptions,
  isSensitiveString,
  isMultilineString,
  type FieldsConfig,
} from "./utils";
import { SensitiveInput } from "./fields";

export type AutoFieldProps = {
  name: string;
  def: z.ZodTypeAny;
  form: UseFormReturn<any>;
  fields?: FieldsConfig<any>;
};

export const AutoField: React.FC<AutoFieldProps> = ({ name, def, form, fields = {} }) => {
  const { register, formState, setValue, getValues } = form;

  const cfg = (fields as any)[name] || {};
  const label = cfg.label ?? name;
  const error = (formState.errors as any)[name]?.message as string | undefined;

  // Helper to render a select (single or multi)
  const renderSelect = (
    opts: Array<{ value: string; label: string }>,
    multiple = false,
  ) => {
    if (multiple) {
      const current = (getValues() as any)[name] ?? [];
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <select
            multiple
            value={current as string[]}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
              setValue(name as any, selected as any, { shouldValidate: true, shouldDirty: true });
            }}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
        <select
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          defaultValue=""
          {...register(name as any)}
        >
          <option disabled value="">
            Select {label}
          </option>
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  };

  const base = unwrapType(def);
  if (process.env.NODE_ENV !== "production") {
    try {
      // eslint-disable-next-line no-console
      console.debug("AutoField detect", {
        name,
        typeName: (base as any)?._def?.typeName,
      });
    } catch {}
  }

  // Enum
  if ((base as any)?._def?.typeName === "ZodEnum") {
    const values = enumStringValuesFromZodEnum((base as any).options);
    const opts = optionsFromStrings(values);
    return renderSelect(opts, Boolean((cfg as any).multiple));
  }

  // Union of enums/strings/literals -> select
  if ((base as any)._def?.typeName === "ZodUnion") {
    const options: z.ZodTypeAny[] = (base as any)._def?.options ?? [];
    const stringVals: string[] = [];
    for (const opt of options) {
      if ((opt as any)?._def?.typeName === "ZodEnum") {
        const raw = (opt as any).options;
        const vals: unknown[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});
        for (const v of vals) if (typeof v === "string") stringVals.push(v);
      } else if ((opt as any)._def?.typeName === "ZodNativeEnum") {
        const enumObj = (opt as any)._def.values as Record<string, string | number>;
        for (const v of Object.values(enumObj)) if (typeof v === "string") stringVals.push(v);
      } else if ((opt as any)._def?.typeName === "ZodLiteral") {
        const litVal = (opt as any)._def?.value;
        if (typeof litVal === "string") stringVals.push(litVal);
      }
    }
    if (stringVals.length) {
      const opts = Array.from(new Set(stringVals)).map((v) => ({ value: v, label: v }));
      return renderSelect(opts, Boolean((cfg as any).multiple));
    }
  }

  // Native enum
  if ((base as any)._def?.typeName === "ZodNativeEnum") {
    const enumObj = (base as any)._def.values as Record<string, string | number>;
    const values = Object.values(enumObj).filter((v): v is string => typeof v === "string");
    const opts = optionsFromStrings(values);
    return renderSelect(opts, Boolean((cfg as any).multiple));
  }

  // Array -> multi select or textarea
  if ((base as any)._def?.typeName === "ZodArray") {
    const el = (base as any)._def.type as z.ZodTypeAny;
    if ((el as any)?._def?.typeName === "ZodEnum") {
      const values = enumStringValuesFromZodEnum((el as any).options);
      const opts = optionsFromStrings(values);
      return renderSelect(opts, true);
    }
    if ((el as any)._def?.typeName === "ZodNativeEnum") {
      const enumObj = (el as any)._def.values as Record<string, string | number>;
      const values = Object.values(enumObj).filter((v): v is string => typeof v === "string");
      const opts = optionsFromStrings(values);
      return renderSelect(opts, true);
    }
    if ((el as any)._def?.typeName === "ZodString" && (cfg as any).options?.length) {
      return renderSelect((cfg as any).options!, true);
    }
    if ((el as any)._def?.typeName === "ZodString") {
      const current = (getValues() as any)[name] as string[] | undefined;
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <textarea
            className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            rows={cfg.rows ?? 5}
            placeholder={cfg.placeholder ?? "Enter values, one per line"}
            value={(current ?? []).join("\n")}
            onChange={(e) => {
              const arr = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
              setValue(name as any, arr as any, { shouldValidate: true, shouldDirty: true });
            }}
          />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }
  }

  // Boolean
  if ((base as any)._def?.typeName === "ZodBoolean") {
    if ((cfg as any).widget === "select") {
      const current = (getValues() as any)[name] as boolean | undefined;
      const opts = booleanSelectOptions((cfg as any).options as Array<{ value: string; label: string }>);
      const value = typeof current === "boolean" ? String(current) : "";
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <select
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              const boolVal = v === "true" ? true : v === "false" ? false : undefined;
              setValue(name as any, boolVal as any, { shouldValidate: true, shouldDirty: true });
            }}
          >
            <option value="" disabled>
              Select {label}
            </option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
        <input className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100" type="checkbox" {...register(name as any)} />
      </label>
    );
  }

  // Number
  if ((base as any)._def?.typeName === "ZodNumber") {
    if ((cfg as any).widget === "slider") {
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <input
            className="w-full accent-zinc-900 dark:accent-zinc-100"
            type="range"
            min={(cfg as any).min}
            max={(cfg as any).max}
            step={(cfg as any).step}
            {...register(name as any, { valueAsNumber: true })}
          />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          type="number"
          {...register(name as any, { valueAsNumber: true })}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  }

  // String
  if ((base as any)._def?.typeName === "ZodString") {
    const stringDef = (def as any)._def as {
      description?: string;
      checks?: Array<{ kind: string; regex?: RegExp }>;
    };
    const checks = stringDef.checks ?? [];
    const regexCheck = checks.find((c) => c.kind === "regex" && c.regex);
    const isEmail = checks.some((c) => c.kind === "email");
    const sensitive = isSensitiveString(stringDef, cfg as any);
    const multiline = isMultilineString(stringDef, cfg as any);

    if (sensitive) {
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <SensitiveInput name={name} register={register} />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    if ((cfg as any).widget === "select" || (cfg as any).options?.length) {
      const opts = (cfg as any).options ?? [];
      return renderSelect(opts, Boolean((cfg as any).multiple));
    }

    if (multiline) {
      return (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <details className="rounded-md border border-zinc-300 open:bg-white dark:border-zinc-700 dark:open:bg-zinc-900">
            <summary className="cursor-pointer select-none bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {`Edit ${label}`}
            </summary>
            <div className="p-2">
              <textarea
                className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                rows={(cfg as any).rows ?? 5}
                {...register(name as any)}
              />
            </div>
          </details>
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          placeholder={(cfg as any).placeholder}
          pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
          title={regexCheck?.regex ? regexCheck.regex.toString() : undefined}
          type={isEmail ? "email" : "text"}
          {...register(name as any)}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  }

  // File upload marker
  if ((def as any).description === "file-upload") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
        <input
          multiple
          type="file"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 file:mr-4 file:rounded file:border-0 file:bg-zinc-200 file:px-2 file:py-1 file:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-zinc-300"
          {...register(name as any)}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  }

  // Default text input
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
      <input
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        type="text"
        {...register(name as any)}
      />
      {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
    </div>
  );
};
