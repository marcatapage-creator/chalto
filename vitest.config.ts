import path from "path"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "src/__mocks__/server-only.ts"),
    },
  },
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
        "src/lib/create-demo-project.ts",
        "src/lib/dropbox.ts",
        "src/lib/cached-queries.ts",
        "src/lib/profession-config.ts",
        "src/lib/email-brand.ts",
        "src/lib/fetch-timeout.ts",
        "src/lib/doc-status.ts",
        "src/app/api/generate-document/**",
        "src/app/api/auth/**",
        "src/app/api/dropbox/**",
        "src/app/api/stripe/**",
        "src/app/api/meetings/**",
        "src/app/api/remind-validation/**",
        "src/app/api/send-to-contributors/**",
        "src/app/api/cron/document-reminders/**",
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
