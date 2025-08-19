import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: [],
		coverage: {
			reporter: ["text", "lcov", "text-summary"],
			reportsDirectory: "./coverage",
			exclude: ["**/*.d.ts", "node_modules/**", "dist/**", ".next/**"],
		},
	},
});
