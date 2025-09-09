import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./lib/services/_tests/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "text-summary"],
			include: ["**/*.{ts,tsx}"],
		},
	},
});
