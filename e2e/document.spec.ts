/**
 * RECETTE 3.3 — Envoi document au client depuis la fiche projet
 * RECETTE 3.1 — Création d'un document
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID    — UUID d'un projet existant
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({ page: _ }, testInfo) => {
  if (!process.env.E2E_USER_EMAIL || !process.env.E2E_PROJECT_ID) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

test("3.1 — la liste des documents s'affiche sur la fiche projet", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByText(/document/i).first()).toBeVisible({ timeout: 10_000 })
})

test("3.3 — le bouton 'Envoyer' est présent sur un document en brouillon", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Ouvrir le premier document visible
  const docItem = page.getByText(/draft|brouillon/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasDoc) {
    test.skip(true, "Aucun document en brouillon sur ce projet de test")
    return
  }

  await docItem.click()
  // Le panneau document doit s'ouvrir avec le bouton d'envoi
  await expect(page.getByRole("button", { name: /envoyer/i })).toBeVisible({ timeout: 8_000 })
})

test("3.3 — l'interface d'envoi propose les options 'Client' et 'Prestataire'", async ({
  page,
}) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText(/draft|brouillon/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasDoc) {
    test.skip(true, "Aucun document en brouillon sur ce projet de test")
    return
  }

  await docItem.click()
  await page.getByRole("button", { name: /envoyer/i }).click()
  // Menu ou dialog avec les options de destinataire
  await expect(page.getByText(/client|prestataire/i).first()).toBeVisible({ timeout: 8_000 })
})
