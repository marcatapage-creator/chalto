import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    trace: "on-first-retry",
  },
  projects: [
    // Tests sans authentification
    {
      name: "public",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testMatch: /\.(public|auth|invite|validate)\.spec\.ts/,
    },
    // Tests nécessitant un utilisateur connecté
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        storageState: "e2e/.auth/user.json",
      },
      testMatch: /\.(authenticated|navigation|document|invitation|validation)\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
