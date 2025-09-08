import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: [],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "text-summary"],
			reportsDirectory: "./coverage",
			exclude: ["**/*.d.ts", "node_modules/**", "dist/**", ".next/**"],
			all: true,
			include: ["**/*.{ts,tsx}"],
		},
	},
});
