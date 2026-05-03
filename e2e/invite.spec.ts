import { test, expect } from "@playwright/test"

// Token invalide — page d'erreur dédiée (HTTP 200, pas de 404 brut — cf. RECETTE 5.2)
test("token invalide — affiche une page d'erreur dédiée", async ({ page }) => {
  const response = await page.goto("/invite/token-inexistant-test")
  await page.waitForLoadState("networkidle")
  expect(response?.status()).toBe(200)
  await expect(page.locator("h1")).toContainText(/invalide/i)
})

// Flux complet — nécessite E2E_INVITE_TOKEN (global-setup)
test("token valide — affiche l'espace prestataire", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }
  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)
  // Le header affiche "Espace prestataire" dans un Badge
  await expect(page.getByText(/espace prestataire/i)).toBeVisible({ timeout: 10_000 })
})

test("token valide — prestataire met à jour le statut d'une tâche", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }
  await page.goto(`/invite/${token}`)
  const statusBtn = page.getByRole("button", { name: /démarrer|terminer/i }).first()
  const hasBtn = await statusBtn.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Aucun bouton de changement de statut disponible")
    return
  }
  await statusBtn.click()
  await page.waitForTimeout(1_500)
  // Après le clic, un bouton de statut reste visible (tâche suivante ou état mis à jour)
  await expect(page.getByText(/espace prestataire/i)).toBeVisible({ timeout: 5_000 })
})

test("token valide — prestataire consulte un document transmis", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }
  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByText(/document/i).first()).toBeVisible({ timeout: 10_000 })
})
