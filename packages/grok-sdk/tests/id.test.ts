import { describe, expect, it } from "vitest";

import { createIdGenerator, generateId } from "grok-sdk/id";

describe("id utilities", () => {
	it("generates unique ids with prefix", () => {
		const id = generateId("test");
		expect(id.startsWith("test_")).toBe(true);
	});

	it("creates generator function", () => {
		const generator = createIdGenerator({ prefix: "session" });
		const ids = new Set([generator(), generator(), generator()]);
		expect(ids.size).toBe(3);
		for (const value of ids) {
			expect(value.startsWith("session_")).toBe(true);
		}
	});
});
