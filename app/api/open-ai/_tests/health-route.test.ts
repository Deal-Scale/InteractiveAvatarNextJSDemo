import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GET } from "../health/route";

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

describe("openai health route", () => {
	beforeEach(() => {
		delete process.env.OPENAI_API_KEY;
	});

	afterEach(() => {
		if (ORIGINAL_KEY === undefined) {
			delete process.env.OPENAI_API_KEY;
		} else {
			process.env.OPENAI_API_KEY = ORIGINAL_KEY;
		}
	});

	it("returns 500 when API key is missing", async () => {
		const res = await GET();
		expect(res.status).toBe(500);
	});

	it("returns 204 when API key is present", async () => {
		process.env.OPENAI_API_KEY = "test-key";
		const res = await GET();
		expect(res.status).toBe(204);
	});
});
