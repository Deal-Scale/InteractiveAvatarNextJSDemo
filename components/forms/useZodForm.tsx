import {
	useForm,
	UseFormProps,
	UseFormReturn,
	FieldValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormValues<TSchema extends z.ZodTypeAny> =
	z.infer<TSchema> extends FieldValues ? z.infer<TSchema> : FieldValues;

// Ensure the form type follows the provided Zod schema when it is object-shaped
// while staying compatible with react-hook-form's FieldValues constraint.
export function useZodForm<TSchema extends z.ZodTypeAny>(
	schema: TSchema,
	options?: Omit<UseFormProps<FormValues<TSchema>>, "resolver">,
): UseFormReturn<FormValues<TSchema>> {
	return useForm<FormValues<TSchema>>({
		resolver: zodResolver(
			schema as unknown as z.ZodType<FieldValues, any, any>,
		) as any,
		mode: "onChange",
		criteriaMode: "firstError",
		...(options as any),
	});
}
