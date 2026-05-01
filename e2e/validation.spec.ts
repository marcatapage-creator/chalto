/**
 * RECETTE 4.2 — Approbation client + notification Realtime côté pro
 * RECETTE 4.3 — Refus avec commentaire
 * RECETTE 4.4 — Token invalide → page d'erreur dédiée
 *
 * Variables d'env requises :
 *   E2E_VALIDATION_TOKEN — validation_token d'un document en statut "sent"
 *                          (compte de test dédié, ne pas utiliser un vrai doc client)
 */
import { test, expect } from "@playwright/test"

// ─── Sans token valide (toujours exécuté) ────────────────────────────────────

test("4.4 — token invalide affiche 'Lien invalide ou expiré'", async ({ page }) => {
  await page.goto("/validate/token-inexistant-e2e-test")
  await expect(page.getByText(/invalide|expiré|introuvable/i)).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
})

test("4.4 — le lien retour vers l'accueil est présent", async ({ page }) => {
  await page.goto("/validate/token-inexistant-e2e-test")
  await expect(page.getByRole("link", { name: /accueil|retour/i })).toBeVisible({ timeout: 8_000 })
})

// ─── Avec token valide ────────────────────────────────────────────────────────

test("4.2 — la page de validation charge le document", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  await expect(page.getByRole("button", { name: /approuver/i })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: /refuser/i })).toBeVisible()
})

test("4.2 — le client peut approuver le document", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  await page.getByRole("button", { name: /approuver/i }).click()
  // Confirmation visuelle après approbation
  await expect(page.getByText(/approuvé|merci|confirmé/i)).toBeVisible({ timeout: 10_000 })
})

test("4.3 — le client peut refuser avec un commentaire", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN_REFUSE ?? process.env.E2E_VALIDATION_TOKEN
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN non défini")
    return
  }

  await page.goto(`/validate/${token}`)
  // Remplir le commentaire AVANT de cliquer Refuser (le bouton appelle l'API directement)
  const textarea = page.getByRole("textbox")
  if (await textarea.isVisible()) {
    await textarea.fill("Des ajustements sont nécessaires sur ce document.")
  }
  await page.getByRole("button", { name: /refuser/i }).click()
  await expect(page.getByText(/refusé|pris en compte/i)).toBeVisible({ timeout: 10_000 })
})
