import { useForm, UseFormProps, UseFormReturn, FieldValues } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function useZodForm<
  TFieldValues extends FieldValues,
>(
  schema: z.ZodType<TFieldValues, any, any>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    criteriaMode: "firstError",
    ...options,
  });
}