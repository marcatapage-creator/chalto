import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/app/api/**/route.ts", "src/lib/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "src/lib/supabase/**",
        "src/types/**",
        "src/lib/analytics.ts",
        "src/lib/haptics.ts",
        "src/lib/demo-project.ts",
        "src/app/api/generate-document/**",
      ],
      thresholds: {
        lines: 72,
        statements: 72,
        branches: 65,
        functions: 60,
      },
    },
  },
})
