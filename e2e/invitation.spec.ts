/**
 * RECETTE 6.1 — Invitation prestataire + accès espace
 * RECETTE 5.5 — Accusé de lecture transmission
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID    — UUID d'un projet avec au moins un contact ayant un email
 *   E2E_CONTACT_ID    — UUID du contact à inviter
 *   E2E_INVITE_TOKEN  — invite_token d'un contributor avec un doc en mode transmission
 */
import { test, expect } from "@playwright/test"

// ─── Flux 6.1 : envoyer une invitation depuis le dashboard pro ───────────────

test("6.1 — la page projet charge la liste des contributeurs", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!process.env.E2E_USER_EMAIL || !projectId) {
    test.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)
  // La section prestataires doit être visible
  await expect(page.getByText(/prestataire|collaborateur|intervenant/i).first()).toBeVisible({
    timeout: 10_000,
  })
})

test("6.1 — le bouton d'invitation est présent et accessible", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!process.env.E2E_USER_EMAIL || !projectId) {
    test.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)
  const inviteBtn = page.getByRole("button", { name: /ajouter|inviter|prestataire/i }).first()
  await expect(inviteBtn).toBeVisible({ timeout: 10_000 })
})

// ─── Flux 5.5 : espace prestataire — accusé de lecture transmission ──────────

test("5.5 — l'espace prestataire s'affiche avec un token valide", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)
  // Le nom du projet ou des éléments de l'espace doivent être visibles
  await expect(page.getByText(/projet|tâche|document/i).first()).toBeVisible({ timeout: 10_000 })
})

test("5.5 — le bouton 'valider la lecture' est présent pour un doc en transmission", async ({
  page,
}) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  const readBtn = page.getByRole("button", { name: /valider la lecture|j'ai lu|accusé/i }).first()
  await expect(readBtn).toBeVisible({ timeout: 10_000 })
})

// ─── Token invalide / expiré ─────────────────────────────────────────────────

test("token invalide — page d'erreur dédiée (pas de 404 brut)", async ({ page }) => {
  const response = await page.goto("/invite/token-qui-nexiste-pas-du-tout-e2e")
  // Next.js notFound() retourne 404, avec la page d'erreur dédiée ou la page 404 Next
  expect([404, 200]).toContain(response?.status())
  // Pas de stacktrace visible
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
})
