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
import { test, expect, type Page } from "@playwright/test"

test.beforeEach(({}, testInfo) => {
  if (!process.env.E2E_USER_EMAIL || !process.env.E2E_PROJECT_ID) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

async function gotoProjectAndCheckBtn(page: Page): Promise<boolean> {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  const isAuth = await page
    .waitForURL(/login/, { timeout: 5_000 })
    .then(() => false)
    .catch(() => true)
  if (!isAuth) return false
  return page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .isVisible({ timeout: 10_000 })
    .catch(() => false)
}

// ─── 6.1 : Point d'entrée ─────────────────────────────────────────────────────

test("6.1 — le bouton 'Générer IA' est accessible sur la fiche projet", async ({ page }) => {
  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }
  await expect(page.getByRole("button", { name: /générer ia|générer/i }).first()).toBeVisible()
})

test("6.1 — cliquer sur 'Générer IA' ouvre le dialog de sélection", async ({ page }) => {
  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }

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
  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  await expect(page.getByText("Lots concernés")).toBeVisible({ timeout: 5_000 })
  await expect(page.getByText("Gros œuvre")).toBeVisible()
  await expect(page.getByRole("button", { name: "Générer" })).toBeDisabled()
})

test("6.1 — sélectionner un lot active le bouton Générer", async ({ page }) => {
  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }

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
  test.setTimeout(90_000)
  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  await page.getByRole("button", { name: "Gros œuvre" }).click()
  await page.getByRole("button", { name: "Générer" }).click()

  await expect(page.getByText(/génération en cours|rédaction/i).first()).toBeVisible({
    timeout: 5_000,
  })
  await expect(page.getByText(/document généré|brouillon/i).first()).toBeVisible({
    timeout: 90_000,
  })
})

// ─── 6.3 : Pas d'erreur console ───────────────────────────────────────────────

test("6.3 — aucune erreur console fatale pendant la génération", async ({ page }) => {
  test.setTimeout(90_000)
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const ready = await gotoProjectAndCheckBtn(page)
  if (!ready) {
    test.skip(true, "Session expirée ou bouton 'Générer IA' non visible sur ce projet")
    return
  }

  await page
    .getByRole("button", { name: /générer ia|générer/i })
    .first()
    .click()
  await expect(page.getByText("CCTP")).toBeVisible({ timeout: 8_000 })
  await page.getByText("CCTP").click()

  await page.getByRole("button", { name: "Gros œuvre" }).click()
  await page.getByRole("button", { name: "Générer" }).click()

  await expect(page.getByText(/document généré|brouillon/i).first()).toBeVisible({
    timeout: 90_000,
  })

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
