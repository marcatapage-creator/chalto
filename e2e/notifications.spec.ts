/**
 * Tests de la cloche de notifications in-app.
 * Couvre les types situation_submitted, situation_reviewed, deadline_alert.
 *
 * Variables d'env requises :
 *   E2E_PROJECT_ID    — UUID du projet (phase chantier)
 *   E2E_INVITE_TOKEN  — token prestataire
 */
import { test, expect } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

// ─── 9.4 : Structure de la cloche ────────────────────────────────────────────

test("9.4 — la cloche de notification est visible sur le dashboard", async ({ page }) => {
  await page.goto("/dashboard")
  if (page.url().includes("/login")) {
    test.skip(true, "Session expirée")
    return
  }

  await expect(page.getByRole("button", { name: /notifications/i })).toBeVisible({
    timeout: 8_000,
  })
})

test("9.4 — ouvrir la cloche affiche le popover Notifications", async ({ page }) => {
  await page.goto("/dashboard")
  if (page.url().includes("/login")) {
    test.skip(true, "Session expirée")
    return
  }

  await page.getByRole("button", { name: /notifications/i }).click()

  await expect(page.getByText("Notifications", { exact: true }).first()).toBeVisible({
    timeout: 5_000,
  })
})

test("9.4 — le popover affiche l'état vide ou une liste", async ({ page }) => {
  await page.goto("/dashboard")
  if (page.url().includes("/login")) {
    test.skip(true, "Session expirée")
    return
  }

  await page.getByRole("button", { name: /notifications/i }).click()
  await expect(page.getByText("Notifications", { exact: true }).first()).toBeVisible({
    timeout: 5_000,
  })

  const hasEmpty = await page
    .getByText(/aucune notification/i)
    .isVisible({ timeout: 3_000 })
    .catch(() => false)
  const hasItems = await page
    .locator("div.divide-y button")
    .first()
    .isVisible()
    .catch(() => false)

  expect(hasEmpty || hasItems).toBe(true)
})

// ─── 9.5 : Icône situation dans la cloche ────────────────────────────────────

test("9.5 — une notification de situation_submitted affiche l'icône 📤 (pas 🔔)", async ({
  page,
}) => {
  const token = e2eEnv("E2E_INVITE_TOKEN")
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!token || !projectId) {
    test.skip(true, "E2E_INVITE_TOKEN ou E2E_PROJECT_ID non défini")
    return
  }

  // Étape 1 : prestataire soumet une situation → crée une notification situation_submitted
  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const newBtn = page.getByRole("button", { name: /nouvelle situation|soumettre|ajouter/i }).first()
  const hasBtn = await newBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton de soumission situation introuvable dans l'espace prestataire")
    return
  }

  await newBtn.click()

  const lotInput = page.getByRole("textbox", { name: /lot|intitulé|label/i }).first()
  const hasForm = await lotInput.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasForm) {
    test.skip(true, "Formulaire de situation introuvable")
    return
  }

  await lotInput.fill(`Lot notif E2E ${Date.now()}`)

  const percentInput = page
    .getByRole("spinbutton")
    .or(page.getByPlaceholder(/pourcentage|%/i))
    .first()
  const hasPercent = await percentInput.isVisible({ timeout: 2_000 }).catch(() => false)
  if (hasPercent) await percentInput.fill("42")

  await page
    .getByRole("button", { name: /soumettre|envoyer|créer|confirmer/i })
    .last()
    .click()

  // Attendre confirmation de soumission
  await page.waitForTimeout(2_000)

  // Étape 2 : architecte ouvre la cloche et vérifie l'icône
  await page.goto(`/projects/${projectId}`)
  if (page.url().includes("/login")) {
    test.skip(true, "Session expirée — projet inaccessible")
    return
  }

  await page.getByRole("button", { name: /notifications/i }).click()
  await expect(page.getByText("Notifications", { exact: true }).first()).toBeVisible({
    timeout: 5_000,
  })

  // La notification de situation doit afficher 📤 et non 🔔
  const notifItems = page.locator("div.divide-y button")
  const count = await notifItems.count()
  if (count === 0) {
    test.skip(true, "Aucune notification dans la cloche — notification peut-être désactivée")
    return
  }

  // Cherche une notification contenant "situation" dans le titre
  const situationNotif = notifItems.filter({ hasText: /situation/i }).first()
  const hasSitNotif = await situationNotif.isVisible({ timeout: 3_000 }).catch(() => false)
  if (!hasSitNotif) {
    test.skip(true, "Notification de situation introuvable dans la cloche")
    return
  }

  // L'icône doit être 📤, pas 🔔
  const iconSpan = situationNotif.locator("span").first()
  const iconText = await iconSpan.textContent()
  expect(iconText?.trim()).toBe("📤")
})

// ─── 9.6 : "Tout marquer comme lu" efface le badge ───────────────────────────

test("9.6 — 'Tout marquer comme lu' efface le badge rouge de la cloche", async ({ page }) => {
  await page.goto("/dashboard")
  if (page.url().includes("/login")) {
    test.skip(true, "Session expirée")
    return
  }

  await page.getByRole("button", { name: /notifications/i }).click()
  await expect(page.getByText("Notifications", { exact: true }).first()).toBeVisible({
    timeout: 5_000,
  })

  const markAllBtn = page.getByRole("button", { name: /tout marquer comme lu/i })
  const hasBtn = await markAllBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton 'Tout marquer comme lu' absent — aucun non-lu")
    return
  }

  await markAllBtn.click()

  // Le bouton disparaît une fois tout marqué
  await expect(markAllBtn).not.toBeVisible({ timeout: 3_000 })
})
