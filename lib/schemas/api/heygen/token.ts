import { z } from "zod";

// Our Next.js route `/api/get-access-token` returns the raw token string body
export const AccessTokenStringSchema = z.string().min(1);

// Upstream Heygen `v1/streaming.create_token` typical JSON shape
export const HeygenCreateTokenResponseSchema = z.object({
	code: z.number().optional(),
	message: z.string().optional(),
	data: z.object({ token: z.string() }),
});

export type AccessTokenString = z.infer<typeof AccessTokenStringSchema>;
export type HeygenCreateTokenResponse = z.infer<
	typeof HeygenCreateTokenResponseSchema
>;
