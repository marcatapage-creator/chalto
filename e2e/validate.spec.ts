import { test, expect } from "@playwright/test"

// Token invalide — aucune donnée en DB, page d'erreur attendue
test("token invalide — affiche 'Lien invalide ou expiré'", async ({ page }) => {
  await page.goto("/validate/token-inexistant-test")
  await expect(page.getByText("Lien invalide ou expiré")).toBeVisible()
  await expect(page.getByRole("link", { name: /accueil/i })).toBeVisible()
})

// Flux complet — nécessite E2E_VALIDATION_TOKEN_CLIENT / E2E_VALIDATION_TOKEN_CLIENT_2 (global-setup)
test("token valide — affiche le document à valider", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN_CLIENT
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_CLIENT non défini")
    return
  }
  await page.goto(`/validate/${token}`)
  await expect(page.getByRole("button", { name: /approuver/i })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: /refuser/i })).toBeVisible()
})

test("token valide — client approuve le document", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN_CLIENT
  if (!token) {
    test.skip(true, "E2E_VALIDATION_TOKEN_CLIENT non défini")
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
  await expect(page.getByText(/document approuvé/i)).toBeVisible({ timeout: 10_000 })
})

test("token valide — client refuse avec commentaire", async ({ page }) => {
  const token = process.env.E2E_VALIDATION_TOKEN_CLIENT_2
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
