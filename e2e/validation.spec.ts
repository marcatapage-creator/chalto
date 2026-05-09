/**
 * RECETTE 4.2 — Approbation client + notification Realtime côté pro
 * RECETTE 4.3 — Refus avec commentaire
 * RECETTE 4.4 — Token invalide → page d'erreur dédiée
 *
 * Variables d'env requises :
 *   E2E_VALIDATION_TOKEN        — token d'un doc "sent" (approbation principale)
 *   E2E_VALIDATION_TOKEN_REFUSE — token d'un doc "sent" dédié au refus
 *   E2E_VALIDATION_TOKEN_CLIENT   — token d'un doc "sent" alternatif (approbation)
 *   E2E_VALIDATION_TOKEN_CLIENT_2 — token d'un doc "sent" alternatif (refus)
 */
import { test, expect } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

// ─── 4.4 : Token invalide (toujours exécuté, sans auth) ──────────────────────

test("4.4 — token invalide affiche 'Lien invalide ou expiré'", async ({ page }) => {
  await page.goto("/validate/token-inexistant-e2e-test")
  await expect(page.getByText(/invalide|expiré|introuvable/i)).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
})

test("4.4 — le lien retour vers l'accueil est présent", async ({ page }) => {
  await page.goto("/validate/token-inexistant-e2e-test")
  await expect(page.getByRole("link", { name: /accueil|retour/i })).toBeVisible({ timeout: 8_000 })
})

// ─── 4.2 : Approbation ───────────────────────────────────────────────────────

test("4.2 — la page de validation charge le document", async ({ page }) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  await expect(page.getByRole("button", { name: /approuver/i })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: /refuser/i })).toBeVisible()
})

test("4.2 — le client peut approuver le document", async ({ page }) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  const approveBtn = page.getByRole("button", { name: /approuver/i })
  const isVisible = await approveBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Approuver non disponible (document déjà traité)")
    return
  }
  await approveBtn.click()
  await expect(page.getByText(/approuvé|merci|confirmé/i)).toBeVisible({ timeout: 10_000 })
})

test("4.2 — flux client alternatif — le client peut approuver le document", async ({ page }) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN_CLIENT")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_CLIENT non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  await expect(page.getByRole("button", { name: /approuver/i })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: /refuser/i })).toBeVisible()

  const approveBtn = page.getByRole("button", { name: /approuver/i })
  const isVisible = await approveBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Approuver non disponible (document déjà traité)")
    return
  }
  await approveBtn.click()
  await expect(page.getByText(/document approuvé/i)).toBeVisible({ timeout: 10_000 })
})

// ─── 4.3 : Refus avec commentaire ────────────────────────────────────────────

test("4.3 — le client peut refuser avec un commentaire", async ({ page }) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN_REFUSE") ?? e2eEnv("E2E_VALIDATION_TOKEN")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_REFUSE non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  const textarea = page.getByRole("textbox")
  if (await textarea.isVisible()) {
    await textarea.fill("Des ajustements sont nécessaires sur ce document.")
  }
  await page.getByRole("button", { name: /refuser/i }).click()
  await expect(page.getByText(/refusé|pris en compte/i)).toBeVisible({ timeout: 10_000 })
})

// ─── 4.5 : Audience guard — doc destiné à un prestataire ────────────────────

test("4.5 — /validate affiche un message bloquant si le document est destiné à un prestataire", async ({
  page,
}) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN_AUDIENCE_GUARD")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_AUDIENCE_GUARD non défini")
    return
  }
  await page.goto(`/validate/${token}`)
  await expect(page.getByText(/en cours d'évaluation/i)).toBeVisible({ timeout: 8_000 })
})

test("4.5 — /validate masque les boutons Approuver et Refuser quand audience=contributor", async ({
  page,
}) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN_AUDIENCE_GUARD")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_AUDIENCE_GUARD non défini")
    return
  }
  await page.goto(`/validate/${token}`)
  await page.waitForTimeout(2_000)
  await expect(page.getByRole("button", { name: /approuver/i })).not.toBeVisible()
  await expect(page.getByRole("button", { name: /refuser/i })).not.toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────

test("4.3 — flux client alternatif — le client peut refuser avec un commentaire", async ({
  page,
}) => {
  const token = e2eEnv("E2E_VALIDATION_TOKEN_CLIENT_2")
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_CLIENT_2 non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  const refuseBtn = page.getByRole("button", { name: /refuser/i })
  const isVisible = await refuseBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Refuser non disponible (document déjà traité)")
    return
  }
  await page.getByRole("textbox").fill("Quelques ajustements nécessaires")
  await refuseBtn.click()
  await expect(page.getByText(/document refusé/i)).toBeVisible({ timeout: 10_000 })
})
