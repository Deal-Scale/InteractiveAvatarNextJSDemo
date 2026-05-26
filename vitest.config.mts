import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const sdkSrc = path.resolve(rootDir, "packages/grok-sdk/src");

export default defineConfig({
	resolve: {
		alias: [
			{ find: /^@$/, replacement: path.join(rootDir) },
			{ find: /^@\/(.*)$/, replacement: path.join(rootDir, "$1") },
			{ find: /^grok-sdk$/, replacement: path.join(sdkSrc, "index.ts") },
			{ find: /^grok-sdk\/(.*)$/, replacement: path.join(sdkSrc, "$1") },
		],
	},
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
