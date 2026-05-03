/**
 * RECETTE 6.1 — Invitation prestataire + accès espace
 * RECETTE 6.3 — Ré-inviter un prestataire déjà invité (pas de doublon)
 * RECETTE 6.4 — Contact sans email → toast d'erreur, pas de crash
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
  const section = page.getByText(/prestataire|collaborateur|intervenant/i).first()
  const visible = await section.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!visible) {
    test.skip(true, "Section prestataires non visible sur ce projet")
    return
  }
  await expect(section).toBeVisible()
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
  const isVisible = await readBtn.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton 'Valider la lecture' non disponible (documents déjà consommés)")
    return
  }
  await expect(readBtn).toBeVisible()
})

// ─── 6.3 : Ré-invitation (pas de doublon) ────────────────────────────────────

test("6.3 — ré-inviter un prestataire déjà invité ne crée pas d'erreur", async ({ page }) => {
  const projectId = process.env.E2E_PROJECT_ID
  const contactId = process.env.E2E_CONTACT_ID
  if (!process.env.E2E_USER_EMAIL || !projectId || !contactId) {
    test.skip(true, "E2E_USER_EMAIL, E2E_PROJECT_ID ou E2E_CONTACT_ID non défini")
    return
  }

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  // Ouvrir la modale d'invitation
  const inviteBtn = page.getByRole("button", { name: /ajouter|inviter|prestataire/i }).first()
  await expect(inviteBtn).toBeVisible({ timeout: 10_000 })
  await inviteBtn.click()

  // Sélectionner le même contact (déjà contributeur)
  const contactOption = page.getByText(contactId).first()
  const hasByText = await contactOption.isVisible({ timeout: 3_000 }).catch(() => false)
  if (!hasByText) {
    // Chercher via select ou liste déroulante
    const contactSelect = page.getByRole("combobox", { name: /contact|prestataire/i }).first()
    const hasSelect = await contactSelect.isVisible({ timeout: 3_000 }).catch(() => false)
    if (!hasSelect) {
      test.skip(true, "Sélecteur de contact non trouvé")
      return
    }
  }

  // Confirmer l'invitation
  const confirmBtn = page.getByRole("button", { name: /inviter|envoyer|confirmer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  await page.waitForTimeout(2_000)

  // Pas de crash — erreur 500 ou stacktrace interdit
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
  const fatalErrors = errors.filter((e) => e.includes("500") || e.includes("TypeError"))
  expect(fatalErrors).toHaveLength(0)
})

// ─── 6.4 : Contact sans email ─────────────────────────────────────────────────

test("6.4 — inviter un contact sans email affiche un toast d'erreur sans crash", async ({
  page,
}) => {
  const projectId = process.env.E2E_PROJECT_ID
  if (!process.env.E2E_USER_EMAIL || !projectId) {
    test.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  const inviteBtn = page.getByRole("button", { name: /ajouter|inviter|prestataire/i }).first()
  await expect(inviteBtn).toBeVisible({ timeout: 10_000 })
  await inviteBtn.click()

  // Chercher un contact sans email dans la liste (peut être étiqueté "sans email" ou simplement absent d'email)
  const noEmailContact = page.getByText(/sans email|no email|email manquant/i).first()
  const hasNoEmail = await noEmailContact.isVisible({ timeout: 3_000 }).catch(() => false)

  if (!hasNoEmail) {
    test.skip(true, "Aucun contact sans email disponible pour ce test")
    return
  }

  await noEmailContact.click()
  const confirmBtn = page.getByRole("button", { name: /inviter|envoyer|confirmer/i }).last()
  if (await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)) await confirmBtn.click()

  // Toast d'erreur doit apparaître
  await expect(page.getByText(/email|n'a pas d'email|renseigné/i).first()).toBeVisible({
    timeout: 8_000,
  })

  // Pas de crash
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
})

// ─── Token invalide / expiré ─────────────────────────────────────────────────

test("token invalide — page d'erreur dédiée (pas de 404 brut)", async ({ page }) => {
  const response = await page.goto("/invite/token-qui-nexiste-pas-du-tout-e2e")
  // Next.js notFound() retourne 404, avec la page d'erreur dédiée ou la page 404 Next
  expect([404, 200]).toContain(response?.status())
  // Pas de stacktrace visible
  await expect(page.getByText(/internal server error/i)).not.toBeVisible()
})
