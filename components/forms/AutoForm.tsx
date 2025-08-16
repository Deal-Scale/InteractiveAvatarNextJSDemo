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
  const { register, handleSubmit, formState } = form;
  const shape = schema.shape;

  const renderField = (key: string, def: z.ZodTypeAny) => {
    const cfg = fields[key] || {};
    const label = cfg.label ?? key;
    const error = (formState.errors as any)[key]?.message as string | undefined;

    if (def instanceof z.ZodEnum) {
      const raw = (def as any).options;
      const values: unknown[] = Array.isArray(raw) ? raw : Object.values(raw ?? {});
      const stringValues = values.filter((v): v is string => typeof v === "string");
      const opts = stringValues.map((v) => ({ value: v, label: v }));

      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{label}</label>
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
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
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      );
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

      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{label}</label>
          <select
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
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
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      );
    }

    if ((def as any)._def?.typeName === "ZodBoolean") {
      return (
        <label key={key} className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">{label}</span>
          <input type="checkbox" {...register(key as any)} />
        </label>
      );
    }

    if ((def as any)._def?.typeName === "ZodNumber") {
      if (cfg.widget === "slider") {
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-300">{label}</label>
            <input
              className="w-full"
              type="range"
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              {...register(key as any, { valueAsNumber: true })}
            />
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        );
      }
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{label}</label>
          <input
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            type="number"
            {...register(key as any, { valueAsNumber: true })}
          />
          {error && <span className="text-xs text-red-400">{error}</span>}
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
                className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 pr-20 text-zinc-100"
                type={show ? "text" : "password"}
                {...register(name as any)}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300 hover:bg-zinc-800"
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
            <label className="text-sm text-zinc-300">{label}</label>
            <SensitiveInput name={key} />
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        );
      }

      if (isMultiline) {
        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="text-sm text-zinc-300">{label}</label>
            <details className="rounded border border-zinc-700 open:bg-zinc-900">
              <summary className="cursor-pointer select-none bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                {`Edit ${label}`}
              </summary>
              <div className="p-2">
                <textarea
                  className="min-h-24 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  rows={5}
                  {...register(key as any)}
                />
              </div>
            </details>
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        );
      }

      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{label}</label>
          <input
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
            pattern={regexCheck?.regex ? regexCheck.regex.source : undefined}
            title={regexCheck?.regex ? regexCheck.regex.toString() : undefined}
            type={isEmail ? "email" : "text"}
            {...register(key as any)}
          />
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      );
    }

    if (def.description === "file-upload") {
      return (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300">{label}</label>
          <input
            multiple
            type="file"
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 file:mr-4 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-zinc-300"
            {...register(key as any)}
          />
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col gap-1">
        <label className="text-sm text-zinc-300">{label}</label>
        <input
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
          type="text"
          {...register(key as any)}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  };

  const keys = Object.keys(shape);

  return (
    <form
      className={className ?? "space-y-3"}
      onSubmit={handleSubmit(onSubmit)}
    >
      {keys.map((key) => renderField(key, shape[key]))}
      <button
        className="rounded bg-zinc-800 px-4 py-2 text-zinc-100 disabled:opacity-50"
        disabled={!formState.isValid}
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
