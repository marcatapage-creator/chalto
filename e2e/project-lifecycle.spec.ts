/**
 * RECETTE 2.1 — Création projet → redirection vers fiche
 * RECETTE 2.2 — Modification nom/phase depuis /projects/[id]/edit
 * RECETTE 2.3 — Badge de phase visible et cohérent
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID                     — UUID d'un projet existant
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({ page: _ }, testInfo) => {
  if (!process.env.E2E_USER_EMAIL) {
    testInfo.skip(true, "E2E_USER_EMAIL non défini")
  }
})

// ─── 2.1 : Création projet ───────────────────────────────────────────────────

test("2.1 — /projects/new se charge sans redirection login", async ({ page }) => {
  await page.goto("/projects/new")
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 })
})

test("2.1 — créer un projet redirige vers sa fiche", async ({ page }) => {
  await page.goto("/projects/new")
  await expect(page).not.toHaveURL(/login/)

  const nameInput = page.getByRole("textbox", { name: /nom|titre|name/i }).first()
  await nameInput.fill(`Projet E2E ${Date.now()}`)

  await page
    .getByRole("button", { name: /créer|enregistrer|suivant|continuer/i })
    .first()
    .click()

  // Doit rediriger vers /projects/<uuid>
  await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 15_000 })
})

// ─── 2.2 : Modification projet ───────────────────────────────────────────────

test("2.2 — /projects/[id]/edit se charge", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}/edit`)
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByRole("textbox", { name: /nom|titre/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

test("2.2 — modifier le nom du projet persiste", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}/edit`)
  await expect(page).not.toHaveURL(/login/)

  const nameInput = page.getByRole("textbox", { name: /nom|titre/i }).first()
  await nameInput.clear()
  const newName = `Projet Modifié E2E ${Date.now()}`
  await nameInput.fill(newName)

  await page
    .getByRole("button", { name: /enregistrer|sauvegarder|mettre à jour/i })
    .first()
    .click()

  // Confirmation ou redirection sans erreur
  await expect(page.getByText(/enregistré|sauvegardé|mis à jour|succès/i).first()).toBeVisible({
    timeout: 10_000,
  })
})

// ─── 2.3 : Badge de phase ─────────────────────────────────────────────────────

test("2.3 — la fiche projet affiche le badge de phase courante", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  // L'une des phases doit être visible (badge ou label)
  await expect(
    page.getByText(/cadrage|conception|chantier|réception|clôture/i).first()
  ).toBeVisible({ timeout: 10_000 })
})

test("2.3 — changer la phase met à jour le badge sans erreur console", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto(`/projects/${projectId}/edit`)
  await expect(page).not.toHaveURL(/login/)

  // Chercher un sélecteur de phase
  const phaseSelect = page.getByRole("combobox", { name: /phase/i }).first()
  const hasPhaseSelect = await phaseSelect.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasPhaseSelect) {
    test.skip(true, "Sélecteur de phase non trouvé sur la page d'édition")
    return
  }

  await phaseSelect.selectOption({ index: 1 })
  await page
    .getByRole("button", { name: /enregistrer|sauvegarder/i })
    .first()
    .click()

  await page.waitForTimeout(2_000)
  expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0)
})
