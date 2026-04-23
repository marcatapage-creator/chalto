import { test, expect } from "@playwright/test"

// Token invalide — Next.js notFound() → 404
test("token invalide — affiche une page 404", async ({ page }) => {
  const response = await page.goto("/invite/token-inexistant-test")
  expect(response?.status()).toBe(404)
})

// Flux complet — nécessite un contributor avec invite_token = "test-invite-e2e" en DB de test
test.skip("token valide — affiche l'espace prestataire", async ({ page }) => {
  await page.goto("/invite/test-invite-e2e")
  await expect(page.getByText(/tâches|projet/i)).toBeVisible()
})

test.skip("token valide — prestataire met à jour le statut d'une tâche", async ({ page }) => {
  await page.goto("/invite/test-invite-e2e")
  // Marquer la première tâche comme terminée
  await page
    .getByRole("button", { name: /terminé|fait/i })
    .first()
    .click()
  await expect(page.getByText(/mis à jour|terminé/i)).toBeVisible()
})

test.skip("token valide — prestataire consulte un document transmis", async ({ page }) => {
  await page.goto("/invite/test-invite-e2e")
  await expect(page.getByText(/documents/i)).toBeVisible()
})
