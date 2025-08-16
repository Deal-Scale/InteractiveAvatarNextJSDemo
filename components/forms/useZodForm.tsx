import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function useZodForm<
  TFieldValues extends FieldValues,
  TSchema extends z.ZodType<TFieldValues, any, any>,
>(
  schema: TSchema,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(
      schema as unknown as z.ZodType<TFieldValues, any, any>,
    ),
    mode: "onChange",
    criteriaMode: "firstError",
    ...options,
  });
}
