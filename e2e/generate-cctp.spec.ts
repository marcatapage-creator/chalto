/**
 * RECETTE 6.1 — Génération CCTP via IA
 * RECETTE 6.2 — Document généré apparaît en brouillon
 * RECETTE 6.3 — Pas d'erreur console pendant la génération
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID                     — UUID d'un projet existant
 *
 * Note : la génération réelle (prod) peut prendre jusqu'à 30s.
 * En dev sans ANTHROPIC_API_KEY, le mock est instantané.
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({ page: _ }, testInfo) => {
  if (!process.env.E2E_USER_EMAIL || !process.env.E2E_PROJECT_ID) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

// ─── 6.1 : Point d'entrée ─────────────────────────────────────────────────────

test("6.1 — le bouton 'Générer IA' est accessible sur la fiche projet", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await expect(page.getByRole("button", { name: /générer ia|générer/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

test("6.1 — cliquer sur 'Générer IA' ouvre le dialog de sélection", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()

  await expect(page.getByText("Générer un document")).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText("CCTP")).toBeVisible()
  await expect(page.getByText("Spécifications techniques par lot")).toBeVisible()
})

// ─── 6.1 : Navigation dans le dialog ─────────────────────────────────────────

test("6.1 — cliquer sur CCTP affiche le formulaire de lots", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  // Étape 2 — formulaire lots
  await expect(page.getByText("Lots concernés")).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText("Gros œuvre")).toBeVisible()
  await expect(page.getByRole("button", { name: "Générer" })).toBeDisabled()
})

test("6.1 — sélectionner un lot active le bouton Générer", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  await page.getByRole("button", { name: "Gros œuvre" }).click()
  await expect(page.getByRole("button", { name: "Générer" })).toBeEnabled()
})

// ─── 6.1 & 6.2 : Flux complet ─────────────────────────────────────────────────

test("6.2 — la génération CCTP aboutit et confirme l'ajout en brouillon", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Ouvrir le dialog
  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  // Sélectionner un lot minimum
  await page.getByRole("button", { name: "Gros œuvre" }).click()

  // Soumettre
  await page.getByRole("button", { name: "Générer" }).click()

  // Étape 3 : loader puis confirmation
  await expect(page.getByText(/génération en cours|rédaction/i)).toBeVisible({ timeout: 5_000 })

  // Attendre la confirmation (génération IA peut prendre jusqu'à 30s en prod)
  await expect(page.getByText(/document généré|brouillon/i)).toBeVisible({ timeout: 60_000 })
})

// ─── 6.3 : Pas d'erreur console ───────────────────────────────────────────────

test("6.3 — aucune erreur console fatale pendant la génération", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  await page.getByRole("button", { name: "Gros œuvre" }).click()
  await page.getByRole("button", { name: "Générer" }).click()

  await expect(page.getByText(/document généré|brouillon/i)).toBeVisible({ timeout: 60_000 })

  const fatal = errors.filter(
    (e) => e.includes("Error") && !e.includes("favicon") && !e.includes("404")
  )
  expect(fatal).toHaveLength(0)
})

// ─── 6.2 : Ownership — non authentifié bloqué ────────────────────────────────

test("6.2 — /projects/[id] redirige vers login si non authentifié", async ({ page }) => {
  await page.context().clearCookies()
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).toHaveURL(/login/, { timeout: 10_000 })
})
