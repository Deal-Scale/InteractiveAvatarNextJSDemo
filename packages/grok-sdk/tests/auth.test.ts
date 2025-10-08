import { describe, expect, it } from "vitest";

import { createApiKeyProvider } from "grok-sdk/auth";

describe("API key provider", () => {
	it("prefers explicit api key", async () => {
		const provider = createApiKeyProvider({ apiKey: "explicit" });
		await expect(provider()).resolves.toBe("explicit");
	});

	it("falls back to environment variable", async () => {
		const provider = createApiKeyProvider({ envVar: "GROK_API_KEY" });
		process.env.GROK_API_KEY = "from-env";
		await expect(provider()).resolves.toBe("from-env");
	});
});
