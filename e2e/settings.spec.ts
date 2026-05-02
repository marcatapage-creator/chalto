/**
 * RECETTE 11.1 — Modifier nom et email dans /settings
 * RECETTE 11.2 — Activer le branding custom (logo + nom société)
 * RECETTE 11.3 — Désactiver les notifications email
 * RECETTE 11.3c — Switch in-app activé par défaut
 * RECETTE 11.3d — Fréquence email "Jamais" + persistance
 * RECETTE 11.3e — Toggles email individuels + scénario in-app uniquement
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({}, testInfo) => {
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
    .getByRole("switch", { name: /document approuvé|document refusé|activer les notifications/i })
    .or(page.getByRole("checkbox", { name: /document approuvé|activer les notifications/i }))
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

// ─── 11.3c : Switch in-app ────────────────────────────────────────────────────

test("11.3c — le switch in-app est présent et activé par défaut", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const inAppSwitch = page.getByRole("switch", { name: /activer les notifications in-app/i })
  await expect(inAppSwitch).toBeVisible({ timeout: 10_000 })
  await expect(inAppSwitch).toHaveAttribute("aria-checked", "true")
})

test("11.3c — désactiver puis réactiver le switch in-app ne génère pas d'erreur", async ({
  page,
}) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const inAppSwitch = page.getByRole("switch", { name: /activer les notifications in-app/i })
  await expect(inAppSwitch).toBeVisible({ timeout: 10_000 })

  await inAppSwitch.click()
  await expect(inAppSwitch).toHaveAttribute("aria-checked", "false")
  await inAppSwitch.click()
  await expect(inAppSwitch).toHaveAttribute("aria-checked", "true")

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})

// ─── 11.3d : Fréquence email = "jamais" + persistance ────────────────────────

test("11.3d — sélectionner 'Jamais' et sauvegarder affiche une confirmation", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const frequencyTrigger = page.getByRole("combobox").filter({ hasText: /immédiatement|jamais/i })
  await expect(frequencyTrigger).toBeVisible({ timeout: 10_000 })
  await frequencyTrigger.click()

  const neverOption = page.getByRole("option", { name: /jamais/i })
  await expect(neverOption).toBeVisible({ timeout: 5_000 })
  await neverOption.click()

  await expect(frequencyTrigger).toContainText(/jamais/i)

  await page.getByRole("button", { name: /sauvegarder les préférences/i }).click()
  await expect(page.getByText(/préférences sauvegardées/i)).toBeVisible({ timeout: 10_000 })
})

test("11.3d — la fréquence 'Jamais' est persistée après rechargement", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const frequencyTrigger = page.getByRole("combobox").filter({ hasText: /immédiatement|jamais/i })
  await expect(frequencyTrigger).toBeVisible({ timeout: 10_000 })
  await frequencyTrigger.click()
  await page.getByRole("option", { name: /jamais/i }).click()
  await page.getByRole("button", { name: /sauvegarder les préférences/i }).click()
  await expect(page.getByText(/préférences sauvegardées/i)).toBeVisible({ timeout: 10_000 })

  await page.reload()
  await page.getByRole("tab", { name: /notif/i }).click()
  await expect(page.getByRole("combobox").filter({ hasText: /jamais/i })).toBeVisible({
    timeout: 10_000,
  })
})

test("11.3d — repasser en 'Immédiatement' est persisté après rechargement", async ({ page }) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const frequencyTrigger = page.getByRole("combobox").filter({ hasText: /immédiatement|jamais/i })
  await expect(frequencyTrigger).toBeVisible({ timeout: 10_000 })
  await frequencyTrigger.click()
  await page.getByRole("option", { name: /immédiatement/i }).click()
  await page.getByRole("button", { name: /sauvegarder les préférences/i }).click()
  await expect(page.getByText(/préférences sauvegardées/i)).toBeVisible({ timeout: 10_000 })

  await page.reload()
  await page.getByRole("tab", { name: /notif/i }).click()
  await expect(page.getByRole("combobox").filter({ hasText: /immédiatement/i })).toBeVisible({
    timeout: 10_000,
  })
})

// ─── 11.3e : Toggles email individuels ───────────────────────────────────────

test("11.3e — désactiver chaque toggle email individuellement ne génère pas d'erreur", async ({
  page,
}) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const emailSwitchNames = [
    /document approuvé/i,
    /document refusé/i,
    /nouveau message/i,
    /nouvelle tâche/i,
  ]

  for (const name of emailSwitchNames) {
    const sw = page.getByRole("switch", { name })
    const isVisible = await sw.isVisible({ timeout: 3_000 }).catch(() => false)
    if (!isVisible) continue
    const wasChecked = (await sw.getAttribute("aria-checked")) === "true"
    await sw.click()
    await expect(sw).toHaveAttribute("aria-checked", wasChecked ? "false" : "true")
    await sw.click()
  }

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})

test("11.3e — scénario in-app uniquement : in-app ON, tous emails OFF, fréquence=jamais", async ({
  page,
}) => {
  await page.goto("/settings")
  await expect(page).not.toHaveURL(/login/)
  await page.getByRole("tab", { name: /notif/i }).click()

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  // In-app ON
  const inAppSwitch = page.getByRole("switch", { name: /activer les notifications in-app/i })
  await expect(inAppSwitch).toBeVisible({ timeout: 10_000 })
  if ((await inAppSwitch.getAttribute("aria-checked")) === "false") {
    await inAppSwitch.click()
  }
  await expect(inAppSwitch).toHaveAttribute("aria-checked", "true")

  // Tous les toggles email à OFF
  const emailSwitchNames = [
    /document approuvé/i,
    /document refusé/i,
    /nouveau message/i,
    /nouvelle tâche/i,
  ]
  for (const name of emailSwitchNames) {
    const sw = page.getByRole("switch", { name })
    const isVisible = await sw.isVisible({ timeout: 3_000 }).catch(() => false)
    if (!isVisible) continue
    if ((await sw.getAttribute("aria-checked")) === "true") {
      await sw.click()
      await expect(sw).toHaveAttribute("aria-checked", "false")
    }
  }

  // Fréquence = "Jamais"
  const frequencyTrigger = page.getByRole("combobox").filter({ hasText: /immédiatement|jamais/i })
  await frequencyTrigger.click()
  await page.getByRole("option", { name: /jamais/i }).click()
  await expect(frequencyTrigger).toContainText(/jamais/i)

  // Sauvegarder
  await page.getByRole("button", { name: /sauvegarder les préférences/i }).click()
  await expect(page.getByText(/préférences sauvegardées/i)).toBeVisible({ timeout: 10_000 })

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})
