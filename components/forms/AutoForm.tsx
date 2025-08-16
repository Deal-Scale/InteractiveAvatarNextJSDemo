import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

type Widget = "input" | "number" | "textarea" | "select" | "switch" | "slider";

type FieldConfig = {
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

type AutoFormProps<TSchema extends z.ZodObject<any, any>> = {
  schema: TSchema;
  form: UseFormReturn<z.infer<TSchema>>;
  fields?: FieldsConfig<z.infer<TSchema>>;
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
  submitLabel?: string;
  className?: string;
};

export function AutoForm<TSchema extends z.ZodObject<any, any>>({
  schema,
  form,
  fields = {},
  onSubmit,
  submitLabel = "Save",
  className,
}: AutoFormProps<TSchema>) {
  const { register, handleSubmit, formState, setValue, getValues } = form;
  const shape = schema.shape;

  const renderField = (key: string, def: z.ZodTypeAny) => {
    const cfg = fields[key] || {};
    const label = cfg.label ?? key;
    const error = (formState.errors as any)[key]?.message as string | undefined;

    // Helper to render a select (single or multi)
    const renderSelect = (
      opts: Array<{ value: string; label: string }>,
      multiple = false,
    ) => {
      if (multiple) {
        const current = (getValues() as any)[key] ?? [];
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <select
              multiple
              value={current as string[]}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setValue(key as any, selected as any, { shouldValidate: true, shouldDirty: true });
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
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <select
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            defaultValue=""
            {...register(key as any)}
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

    if (def instanceof z.ZodEnum) {
      const raw = (def as any).options;
      const values: unknown[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});
      const stringValues = values.filter((v): v is string => typeof v === "string");
      const opts = stringValues.map((v) => ({ value: v, label: v }));

      return renderSelect(opts, Boolean(cfg.multiple));
    }

    if ((def as any)._def?.typeName === "ZodNativeEnum") {
      const enumObj = (def as any)._def.values as Record<
        string,
        string | number
      >;
      const values = Object.values(enumObj).filter(
        (v) => typeof v === "string",
      ) as string[];
      const opts = values.map((v) => ({ value: v, label: v }));

      return renderSelect(opts, Boolean(cfg.multiple));
    }

    // ZodArray support (multi-select when element is enum or string with options)
    if ((def as any)._def?.typeName === "ZodArray") {
      const el = (def as any)._def.type as z.ZodTypeAny;
      // Enum-based multi-select
      if (el instanceof z.ZodEnum) {
        const raw = (el as any).options;
        const values: unknown[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});
        const stringValues = values.filter((v): v is string => typeof v === "string");
        const opts = stringValues.map((v) => ({ value: v, label: v }));
        return renderSelect(opts, true);
      }
      // Native enum-based multi-select
      if ((el as any)._def?.typeName === "ZodNativeEnum") {
        const enumObj = (el as any)._def.values as Record<string, string | number>;
        const values = Object.values(enumObj).filter((v) => typeof v === "string") as string[];
        const opts = values.map((v) => ({ value: v, label: v }));
        return renderSelect(opts, true);
      }
      // String with options in field config
      if ((el as any)._def?.typeName === "ZodString" && (cfg as any).options?.length) {
        return renderSelect((cfg as any).options!, true);
      }
      // fallback: simple comma-separated textarea
      if ((el as any)._def?.typeName === "ZodString") {
        const current = (getValues() as any)[key] as string[] | undefined;
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <textarea
              className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              rows={cfg.rows ?? 5}
              placeholder={cfg.placeholder ?? "Enter values, one per line"}
              value={(current ?? []).join("\n")}
              onChange={(e) => {
                const arr = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                setValue(key as any, arr as any, { shouldValidate: true, shouldDirty: true });
              }}
            />
            {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
          </div>
        );
      }
    }

    if ((def as any)._def?.typeName === "ZodBoolean") {
      // Support rendering boolean as a select dropdown when configured
      if ((cfg as any).widget === "select") {
        const current = (getValues() as any)[key] as boolean | undefined;
        const opts = ((cfg as any).options as Array<{ value: string; label: string }>) ?? [
          { value: "true", label: "True" },
          { value: "false", label: "False" },
        ];
        const value = typeof current === "boolean" ? String(current) : "";
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <select
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              value={value}
              onChange={(e) => {
                const v = e.target.value;
                const boolVal = v === "true" ? true : v === "false" ? false : undefined;
                setValue(key as any, boolVal as any, { shouldValidate: true, shouldDirty: true });
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
        <label key={key} className="flex items-center justify-between gap-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-300">{label}</span>
          <input className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100" type="checkbox" {...register(key as any)} />
        </label>
      );
    }

    if ((def as any)._def?.typeName === "ZodNumber") {
      if (cfg.widget === "slider") {
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <input
              className="w-full accent-zinc-900 dark:accent-zinc-100"
              type="range"
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              {...register(key as any, { valueAsNumber: true })}
            />
            {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
          </div>
        );
      }
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <input
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            type="number"
            {...register(key as any, { valueAsNumber: true })}
          />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    if ((def as any)._def?.typeName === "ZodString") {
      const stringDef = (def as any)._def as {
        description?: string;
        checks?: Array<{ kind: string; regex?: RegExp }>;
      };
      const checks = stringDef.checks ?? [];
      const regexCheck = checks.find((c) => c.kind === "regex" && c.regex);
      const isEmail = checks.some((c) => c.kind === "email");
      const isSensitive =
        stringDef.description?.toLowerCase().includes("sensitive") ||
        stringDef.description?.toLowerCase().includes("password") ||
        (cfg as any).widget === "password";
      const isMultiline =
        stringDef.description?.toLowerCase().includes("multiline") ||
        (cfg as any).widget === "textarea";

      if (isSensitive) {
        const SensitiveInput: React.FC<{ name: string }> = ({ name }) => {
          const [show, setShow] = React.useState(false);
          return (
            <div className="relative">
              <input
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-20 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                type={show ? "text" : "password"}
                {...register(name as any)}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                onClick={() => setShow((s) => !s)}
                type="button"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          );
        };

        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <SensitiveInput name={key} />
            {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
          </div>
        );
      }

      // String select support via field config
      if ((cfg as any).widget === "select" || (cfg as any).options?.length) {
        const opts = (cfg as any).options ?? [];
        return renderSelect(opts, Boolean((cfg as any).multiple));
      }

      if (isMultiline) {
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
            <details className="rounded-md border border-zinc-300 open:bg-white dark:border-zinc-700 dark:open:bg-zinc-900">
              <summary className="cursor-pointer select-none bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {`Edit ${label}`}
              </summary>
              <div className="p-2">
                <textarea
                  className="min-h-24 max-h-[60vh] w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  rows={cfg.rows ?? 5}
                  {...register(key as any)}
                />
              </div>
            </details>
            {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
          </div>
        );
      }

      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <input
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder={cfg.placeholder}
            pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
            title={regexCheck?.regex ? regexCheck.regex.toString() : undefined}
            type={isEmail ? "email" : "text"}
            {...register(key as any)}
          />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    if (def.description === "file-upload") {
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
          <input
            multiple
            type="file"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 file:mr-4 file:rounded file:border-0 file:bg-zinc-200 file:px-2 file:py-1 file:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:file:bg-zinc-700 dark:file:text-zinc-300"
            {...register(key as any)}
          />
          {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col gap-1">
        <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
        <input
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          type="text"
          {...register(key as any)}
        />
        {error && <span className="text-xs text-red-500 dark:text-red-400">{error}</span>}
      </div>
    );
  };

  const keys = Object.keys(shape);

  return (
    <form
      className={className ?? "space-y-3"}
      onSubmit={handleSubmit(onSubmit)}
    >
      {keys.map((key) => {
        const def = shape[key];
        // Support nested object fields by rendering their children with dotted names
        if ((def as any)?._def?.typeName === "ZodObject") {
          const innerShape = (def as any).shape as Record<string, z.ZodTypeAny>;
          return (
            <fieldset key={key} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <legend className="px-1 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{key}</legend>
              <div className="space-y-2">
                {Object.keys(innerShape).map((childKey) => {
                  const childDef = innerShape[childKey];
                  const name = `${key}.${childKey}`;
                  const childError = (formState.errors as any)?.[key]?.[childKey]?.message as string | undefined;

                  // Native enum
                  if ((childDef as any)?._def?.typeName === "ZodNativeEnum") {
                    const enumObj = (childDef as any)._def.values as Record<string, string | number>;
                    const values = Object.values(enumObj).filter((v) => typeof v === "string") as string[];
                    const opts = values.map((v) => ({ value: v, label: v }));
                    return (
                      <div key={name} className="flex flex-col gap-1">
                        <label className="text-sm text-zinc-600 dark:text-zinc-300">{childKey}</label>
                        <select
                          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          defaultValue=""
                          {...register(name as any)}
                        >
                          <option disabled value="">
                            Select {childKey}
                          </option>
                          {opts.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        {childError && (
                          <span className="text-xs text-red-500 dark:text-red-400">{childError}</span>
                        )}
                      </div>
                    );
                  }

                  // Number
                  if ((childDef as any)?._def?.typeName === "ZodNumber") {
                    return (
                      <div key={name} className="flex flex-col gap-1">
                        <label className="text-sm text-zinc-600 dark:text-zinc-300">{childKey}</label>
                        <input
                          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                          type="number"
                          {...register(name as any, { valueAsNumber: true })}
                        />
                        {childError && (
                          <span className="text-xs text-red-500 dark:text-red-400">{childError}</span>
                        )}
                      </div>
                    );
                  }

                  // Boolean
                  if ((childDef as any)?._def?.typeName === "ZodBoolean") {
                    return (
                      <label key={name} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">{childKey}</span>
                        <input className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100" type="checkbox" {...register(name as any)} />
                      </label>
                    );
                  }

                  // String and fallback
                  return (
                    <div key={name} className="flex flex-col gap-3">
                      <label className="text-sm text-zinc-600 dark:text-zinc-300">{childKey}</label>
                      <input
                        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        type="text"
                        {...register(name as any)}
                      />
                      {childError && (
                        <span className="text-xs text-red-500 dark:text-red-400">{childError}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          );
        }

        return renderField(key, def);
      })}
      <button
        className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50"
        disabled={!formState.isValid}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
