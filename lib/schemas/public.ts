import { z } from "zod";

// Public-facing metadata for an Agent
export const PublicAgentSchema = z.object({
	title: z.string().min(1, "Title is required").max(80),
	description: z.string().min(1, "Description is required").max(500),
	avatarImage: z
		.string()
		.url("Avatar image must be a valid URL")
		.describe("Public avatar image URL"),
	isPublic: z
		.boolean()
		.default(false)
		.describe("Whether the agent is publicly listed"),
	monetize: z
		.boolean()
		.default(false)
		.describe("Whether the agent is monetized"),
	rateMultiplier: z
		.number()
		.int()
		.min(1)
		.max(5)
		.default(1)
		.describe("Rate multiplier from 1x to 5x for monetized agents"),
});

export type PublicAgent = z.infer<typeof PublicAgentSchema>;
