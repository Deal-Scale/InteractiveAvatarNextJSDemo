import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: [
      "lib/services/_tests/**/*.test.ts",
      "lib/services/_tests/**/*.test.tsx",
    ],
    setupFiles: [],
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
})
