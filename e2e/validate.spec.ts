import { test, expect } from "@playwright/test"

// Token invalide — aucune donnée en DB, page d'erreur attendue
test("token invalide — affiche 'Lien invalide ou expiré'", async ({ page }) => {
  await page.goto("/validate/token-inexistant-test")
  await expect(page.getByText("Lien invalide ou expiré")).toBeVisible()
  await expect(page.getByRole("link", { name: /accueil/i })).toBeVisible()
})

// Flux complet — nécessite un token valide en DB (staging ou compte test)
test.skip("token valide — affiche le document à valider", async ({ page }) => {
  // Prérequis : créer un document avec validation_token = "test-token-e2e" en DB de test
  await page.goto("/validate/test-token-e2e")
  await expect(page.getByRole("heading", { name: /valider/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /approuver/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /refuser/i })).toBeVisible()
})

test.skip("token valide — client approuve le document", async ({ page }) => {
  await page.goto("/validate/test-token-e2e")
  await page.getByRole("button", { name: /approuver/i }).click()
  await expect(page.getByText(/approuvé|confirmé/i)).toBeVisible()
})

test.skip("token valide — client laisse un commentaire", async ({ page }) => {
  await page.goto("/validate/test-token-e2e")
  await page.getByRole("button", { name: /commenter|laisser un message/i }).click()
  await page.getByRole("textbox").fill("Quelques ajustements nécessaires")
  await page.getByRole("button", { name: /envoyer/i }).click()
  await expect(page.getByText(/message envoyé|reçu/i)).toBeVisible()
})
