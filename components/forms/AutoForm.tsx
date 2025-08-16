import type { FieldsConfig } from "./utils";

import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

import { AutoField } from "./AutoField";

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
  const { handleSubmit, formState } = form;
  const shape = schema.shape;
  
  
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
                  const name = `${key}.${childKey}`;
                  const childDef = innerShape[childKey];
                  return (
                    <AutoField
                      key={name}
                      name={name}
                      def={childDef}
                      form={form}
                      fields={fields as any}
                    />
                  );
                })}
              </div>
            </fieldset>
          );
        }

        return (
          <AutoField
            key={key}
            name={key}
            def={def}
            form={form}
            fields={fields as any}
          />
        );
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
