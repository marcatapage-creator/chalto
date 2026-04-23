import { test, expect } from "@playwright/test"

test("login — le formulaire s'affiche correctement", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible()
  await expect(page.getByRole("textbox", { name: /mot de passe|password/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /connexion|se connecter/i })).toBeVisible()
})

test("login — email invalide affiche une erreur", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("textbox", { name: /email/i }).fill("pasunemail")
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  // Validation HTML5 native ou message d'erreur
  const emailInput = page.getByRole("textbox", { name: /email/i })
  const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
  expect(validity).toBe(false)
})

test("dashboard — redirige vers login si non authentifié", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/login/)
})

test("projects — redirige vers login si non authentifié", async ({ page }) => {
  await page.goto("/projects/fake-id")
  await expect(page).toHaveURL(/login/)
})

// Flux complet — nécessite des credentials de test
test.skip("login — connexion avec un compte de test", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("textbox", { name: /email/i }).fill(process.env.TEST_USER_EMAIL ?? "")
  await page
    .getByRole("textbox", { name: /mot de passe|password/i })
    .fill(process.env.TEST_USER_PASSWORD ?? "")
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  await expect(page).toHaveURL(/dashboard/)
})
