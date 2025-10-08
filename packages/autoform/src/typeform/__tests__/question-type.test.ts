import { describe, expect, it } from "vitest";
import { z } from "zod";

import { determineQuestionType } from "../types";
import type { FieldConfig } from "../../utils/utils";

const baseConfig: FieldConfig = {};

describe("determineQuestionType", () => {
	it("prioritizes an explicit question type from the field config", () => {
		const schema = z.string();
		const cfg: FieldConfig = { ...baseConfig, questionType: "legal" };

		expect(determineQuestionType(schema, cfg, "terms")).toBe("legal");
	});

	it("parses typeform: metadata from schema descriptions", () => {
		const schema = z.string().describe("typeform:phone-number");

		expect(determineQuestionType(schema, baseConfig, "phone")).toBe(
			"phoneNumber",
		);
	});

	it("infers email questions from Zod email validators", () => {
		const schema = z.string().email();

		expect(determineQuestionType(schema, baseConfig, "email")).toBe("email");
	});

	it("treats boolean fields as yes/no questions by default", () => {
		const schema = z.boolean();

		expect(determineQuestionType(schema, baseConfig, "subscribed")).toBe(
			"yesNo",
		);
	});

	it("detects NPS style number fields from descriptions", () => {
		const schema = z
			.number()
			.min(0)
			.max(10)
			.describe("nps: How likely are you to recommend us?");

		expect(determineQuestionType(schema, baseConfig, "npsScore")).toBe("nps");
	});

	it("falls back to the generic number question for basic numeric fields", () => {
		const schema = z.number();

		expect(determineQuestionType(schema, baseConfig, "quantity")).toBe(
			"number",
		);
	});
});
