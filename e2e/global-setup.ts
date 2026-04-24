import { chromium, type FullConfig } from "@playwright/test"
import fs from "fs"
import path from "path"

const AUTH_FILE = path.join(__dirname, ".auth/user.json")

export default async function globalSetup(config: FullConfig) {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    // No credentials — write empty state so authenticated tests skip gracefully
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }))
    return
  }

  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000"
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.getByRole("textbox", { name: /email/i }).fill(email)
  await page.getByRole("textbox", { name: /mot de passe|password/i }).fill(password)
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  await page.waitForURL(/dashboard/, { timeout: 15_000 })

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
}
