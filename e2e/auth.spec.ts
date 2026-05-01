import { test, expect } from "@playwright/test"
import path from "path"

const AUTH_FILE = path.join(__dirname, ".auth/user.json")

// Ces tests vérifient le comportement sans session — session vide obligatoire
test.describe("sans authentification", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("login — le formulaire s'affiche correctement", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /continuer avec email/i }).click()
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible()
    await expect(page.getByRole("textbox", { name: /mot de passe|password/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /connexion|se connecter/i })).toBeVisible()
  })

  test("login — email invalide affiche une erreur", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /continuer avec email/i }).click()
    await page.getByRole("textbox", { name: /email/i }).fill("pasunemail")
    await page.getByRole("button", { name: /connexion|se connecter/i }).click()
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

  test("1.1 — /register se charge et affiche le formulaire", async ({ page }) => {
    await page.goto("/register")
    await expect(page).not.toHaveURL(/login/)
    await page.getByRole("button", { name: /continuer avec email/i }).click()
    await expect(page.getByRole("textbox", { name: /email/i }).first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test("1.1 — email invalide bloqué côté client sur /register", async ({ page }) => {
    await page.goto("/register")
    await page.getByRole("button", { name: /continuer avec email/i }).click()
    const emailInput = page.getByRole("textbox", { name: /email/i }).first()
    await expect(emailInput).toBeVisible({ timeout: 10_000 })
    await emailInput.fill("pasunemail")
    await page.getByRole("button", { name: /créer mon compte/i }).click()
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(validity).toBe(false)
  })
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

// ─── 1.2 : Déconnexion / reconnexion ─────────────────────────────────────────

test("1.2 — le bouton de déconnexion est accessible depuis le dashboard", async ({ page }) => {
  if (!process.env.E2E_USER_EMAIL) {
    test.skip(true, "E2E_USER_EMAIL non défini")
    return
  }

  await page.goto("/dashboard")
  await expect(page).not.toHaveURL(/login/)

  // Le bouton logout peut être dans un menu utilisateur
  const logoutBtn = page.getByRole("button", { name: /déconnexion|se déconnecter|logout/i }).first()
  const hasLogout = await logoutBtn.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasLogout) {
    // Chercher dans un menu déroulant (avatar ou initiales)
    const userMenu = page.getByRole("button", { name: /compte|profil|menu utilisateur/i }).first()
    const hasMenu = await userMenu.isVisible({ timeout: 3_000 }).catch(() => false)
    if (hasMenu) await userMenu.click()
  }

  await expect(
    page.getByRole("button", { name: /déconnexion|se déconnecter|logout/i }).first()
  ).toBeVisible({ timeout: 8_000 })
})

test("1.2 — se déconnecter puis se reconnecter restaure la session", async ({ page }) => {
  if (!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD) {
    test.skip(true, "E2E_USER_EMAIL ou E2E_USER_PASSWORD non défini")
    return
  }

  await page.goto("/dashboard")
  await expect(page).not.toHaveURL(/login/)

  // Ouvrir le menu utilisateur si nécessaire
  const userMenu = page.getByRole("button", { name: /compte|profil|menu utilisateur/i }).first()
  const hasMenu = await userMenu.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasMenu) await userMenu.click()

  await page
    .getByRole("button", { name: /déconnexion|se déconnecter|logout/i })
    .first()
    .click()
  await expect(page).toHaveURL(/login/, { timeout: 10_000 })

  // Reconnexion
  await page.getByRole("button", { name: /continuer avec email/i }).click()
  await page.getByRole("textbox", { name: /email/i }).fill(process.env.E2E_USER_EMAIL)
  await page
    .getByRole("textbox", { name: /mot de passe|password/i })
    .fill(process.env.E2E_USER_PASSWORD)
  await page.getByRole("button", { name: /connexion|se connecter/i }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })

  // Rafraîchit l'auth file pour que les tests suivants aient une session valide
  await page.context().storageState({ path: AUTH_FILE })
})
