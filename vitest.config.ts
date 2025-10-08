import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			reporter: ["text", "lcov", "text-summary"],
			reportsDirectory: "./coverage",
			exclude: ["**/*.d.ts", "node_modules/**", "dist/**", ".next/**"],
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
});
