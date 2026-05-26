import { describe, expect, it } from "vitest";

import {
	jsonSchema,
	zodSchema,
	valibotSchema,
} from "@/app/api/grok/sdk/schema";
import { z } from "zod";

// mimic valibot minimal stub
class MockValibotSchema<T> {
	readonly shape: T;
	constructor(shape: T) {
		this.shape = shape;
	}
}

describe("schema adapters", () => {
	it("wraps json schema definitions", () => {
		const schema = jsonSchema({ type: "object" });
		expect(schema.definition.type).toBe("object");
	});

	it("wraps zod schemas", () => {
		const schema = zodSchema(z.object({ value: z.string() }));
		expect(schema.schema.safeParse({ value: "ok" }).success).toBe(true);
	});

	it("wraps valibot-like schemas", () => {
		const schema = valibotSchema(new MockValibotSchema({}));
		expect(schema.schema).toBeInstanceOf(MockValibotSchema);
	});
});
