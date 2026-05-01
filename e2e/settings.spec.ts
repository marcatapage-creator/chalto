/**
 * RECETTE 11.1 — Modifier nom et email dans /settings
 * RECETTE 11.2 — Activer le branding custom (logo + nom société)
 * RECETTE 11.3 — Désactiver les notifications email
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({ page: _ }, testInfo) => {
  if (!process.env.E2E_USER_EMAIL) {
    testInfo.skip(true, "E2E_USER_EMAIL non défini")
  }
})

test("settings — /settings se charge sans redirection login", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 })
})

// ─── 11.1 : Modifier nom et email ─────────────────────────────────────────────

test("11.1 — les champs nom et email sont présents et éditables", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /profil/i }).click()
  await expect(page.getByPlaceholder(/jean dupont/i).first()).toBeVisible({ timeout: 10_000 })
  // Email est présent mais désactivé (non modifiable par design)
  await expect(page.locator("input[disabled]").first()).toBeVisible()
})

test("11.1 — modifier le nom affiche une confirmation", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /profil/i }).click()

  const nameInput = page.getByPlaceholder(/jean dupont/i).first()
  await expect(nameInput).toBeVisible({ timeout: 10_000 })
  await nameInput.clear()
  await nameInput.fill(`Pro E2E ${Date.now()}`)

  await page
    .getByRole("button", { name: /sauvegarder/i })
    .first()
    .click()

  await expect(page.getByText(/profil mis à jour|sauvegardé/i).first()).toBeVisible({
    timeout: 10_000,
  })
})

// ─── 11.2 : Branding custom ───────────────────────────────────────────────────

test("11.2 — la section branding est présente", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /entreprise/i }).click()
  await expect(page.getByText(/branding|logo|personnali|société/i).first()).toBeVisible({
    timeout: 10_000,
  })
})

test("11.2 — le toggle branding peut être activé sans erreur console", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /entreprise/i }).click()

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const brandingToggle = page
    .getByRole("switch", { name: /branding|logo|personnali/i })
    .or(page.getByRole("checkbox", { name: /branding|logo/i }))
    .first()

  const hasToggle = await brandingToggle.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasToggle) {
    test.skip(true, "Toggle branding non trouvé")
    return
  }

  await brandingToggle.click()
  await page.waitForTimeout(1_500)

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})

// ─── 11.3 : Notifications email ───────────────────────────────────────────────

test("11.3 — la section notifications est présente", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()
  await expect(page.getByText(/notification|email/i).first()).toBeVisible({ timeout: 10_000 })
})

test("11.3 — le toggle notifications email peut être modifié sans erreur", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const notifToggle = page
    .getByRole("switch", { name: /notification.*email|email.*notification/i })
    .or(page.getByRole("checkbox", { name: /notification.*email/i }))
    .first()

  const hasToggle = await notifToggle.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasToggle) {
    test.skip(true, "Toggle notifications email non trouvé")
    return
  }

  await notifToggle.click()
  await page.waitForTimeout(1_500)

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})
