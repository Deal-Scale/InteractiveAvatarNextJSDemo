import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Ensure the form type strictly follows the provided Zod schema and
// remains compatible with react-hook-form's FieldValues constraint.
export function useZodForm<
  TSchema extends z.ZodTypeAny,
  TValues extends FieldValues = z.infer<TSchema>,
>(
  schema: TSchema,
  options?: Omit<UseFormProps<TValues>, "resolver">,
): UseFormReturn<TValues> {
  return useForm<TValues>({
    // Casts keep resolver generic-friendly while preserving runtime behavior
    resolver: zodResolver(schema as unknown as z.ZodTypeAny) as any,
    mode: "onChange",
    criteriaMode: "firstError",
    ...options,
  });
}
