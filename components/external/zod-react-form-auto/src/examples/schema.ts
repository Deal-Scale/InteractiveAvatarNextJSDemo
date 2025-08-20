import { z } from "zod";

export const Role = z.enum(["user", "admin", "moderator"]).describe("select");

export const AppSchema = z
	.object({
		email: z
			.string()
			.email({ message: "Please enter a valid email address" })
			.describe("Email address of the user"),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters" })
			.describe("password"), // will render as SensitiveInput
		bio: z
			.string()
			.max(500, { message: "Bio must be 500 characters or less" })
			.describe("multiline"), // will render as textarea
		age: z
			.number()
			.min(0, { message: "Age cannot be negative" })
			.max(120, { message: "Please enter a realistic age (<= 120)" })
			.describe("Age in years"),
		birthday: z.date().describe("Date of birth (uses Calendar date picker)"),
		termsAccepted: z.boolean().describe("Agree to terms"),
		role: Role, // enum -> select
		favoriteFruit: z.string().describe("select"), // string -> select via fields.options
		apiKey: z
			.string()
			.min(1, { message: "API key is required" })
			.describe("sensitive"), // sensitive string example
		files: z
			.any()
			// Accept images and PDF, require at least 1 and at most 5
			// The component reads accept/min/max from this description
			.describe("file-upload:accept=image/*,application/pdf;min=1;max=5"),
		tags: z.array(z.string()).default([]).describe("multiline"), // array of string -> textarea lines
		favoriteColors: z
			.array(z.enum(["red", "green", "blue"])) // array of enum -> multiselect
			.default([]),
	})
	.describe("Example application form");

export type AppValues = z.infer<typeof AppSchema>;
