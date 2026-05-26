export interface JsonSchemaDefinition {
	readonly type: string;
	readonly [key: string]: unknown;
}

export interface JsonSchemaWrapper {
	readonly kind: "json-schema";
	readonly definition: JsonSchemaDefinition;
}

export interface ZodSchemaWrapper<TSchema> {
	readonly kind: "zod";
	readonly schema: TSchema;
}

export interface ValibotSchemaWrapper<TSchema> {
	readonly kind: "valibot";
	readonly schema: TSchema;
}

export function jsonSchema(
	definition: JsonSchemaDefinition,
): JsonSchemaWrapper {
	return { kind: "json-schema", definition };
}

export function zodSchema<TSchema>(schema: TSchema): ZodSchemaWrapper<TSchema> {
	return { kind: "zod", schema };
}

export function valibotSchema<TSchema>(
	schema: TSchema,
): ValibotSchemaWrapper<TSchema> {
	return { kind: "valibot", schema };
}
