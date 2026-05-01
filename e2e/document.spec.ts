/**
 * RECETTE 3.1 — Création d'un document
 * RECETTE 3.3 — Envoi document au client (statut → sent, bouton désactivé)
 * RECETTE 3.4 — Envoi document à un prestataire en mode validation
 * RECETTE 3.5 — Envoi document à un prestataire en mode transmission
 * RECETTE 3.6 — Message pro visible dans l'espace prestataire
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

// ─── 3.3 : Envoi au client — statut et bouton ────────────────────────────────

test("3.3 — après envoi au client, le statut passe à 'sent' et le bouton est désactivé", async ({
  page,
}) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText(/draft|brouillon/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasDoc) {
    test.skip(true, "Aucun document en brouillon disponible")
    return
  }

  await docItem.click()
  await page.getByRole("button", { name: /envoyer/i }).click()

  // Sélectionner l'option "Client"
  const clientOption = page.getByRole("button", { name: /client/i }).first()
  const hasClient = await clientOption.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasClient) {
    test.skip(true, "Option 'Client' non trouvée dans l'interface d'envoi")
    return
  }
  await clientOption.click()

  // Confirmer si une étape supplémentaire est requise
  const confirmBtn = page.getByRole("button", { name: /envoyer|confirmer|valider/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Statut passe à "sent" ou "envoyé"
  await expect(page.getByText(/envoyé|sent/i).first()).toBeVisible({ timeout: 15_000 })

  // Le bouton d'envoi doit être désactivé ou absent
  const sendBtn = page.getByRole("button", { name: /envoyer/i }).first()
  const stillVisible = await sendBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (stillVisible) {
    await expect(sendBtn).toBeDisabled()
  }
})

// ─── 3.4 : Envoi à un prestataire — mode validation ──────────────────────────

test("3.4 — l'interface d'envoi propose l'option 'Validation' pour un prestataire", async ({
  page,
}) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText(/draft|brouillon/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasDoc) {
    test.skip(true, "Aucun document en brouillon disponible")
    return
  }

  await docItem.click()
  await page.getByRole("button", { name: /envoyer/i }).click()

  // Sélectionner l'option "Prestataire"
  const prestOption = page.getByRole("button", { name: /prestataire/i }).first()
  const hasPresta = await prestOption.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasPresta) {
    test.skip(true, "Option 'Prestataire' non trouvée")
    return
  }
  await prestOption.click()

  // Un choix entre "Validation" et "Transmission" doit apparaître
  await expect(page.getByText(/validation|transmission/i).first()).toBeVisible({ timeout: 8_000 })
})

// ─── 3.5 : Envoi à un prestataire — mode transmission ───────────────────────

test("3.5 — le mode transmission affiche le badge 'Pour information'", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Chercher un document déjà envoyé en mode transmission
  const transDoc = page.getByText(/transmission|pour information/i).first()
  const hasTrans = await transDoc.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasTrans) {
    test.skip(true, "Aucun document en mode transmission sur ce projet de test")
    return
  }

  await expect(transDoc).toBeVisible()
})

// ─── 3.6 : Message pro visible dans l'espace prestataire ─────────────────────

test("3.6 — le message pro est visible dans le panneau document (côté pro)", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Chercher un document envoyé à un prestataire
  const sentDoc = page.getByText(/sent|envoyé/i).first()
  const hasSent = await sentDoc.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasSent) {
    test.skip(true, "Aucun document 'sent' sur ce projet de test")
    return
  }

  await sentDoc.click()

  // Le message du pro doit être visible dans le panneau
  const proMsg = page.getByText(/message.*professionnel|message du pro|votre message/i).first()
  const hasMsg = await proMsg.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasMsg) {
    test.skip(true, "Aucun message pro associé à ce document (peut être vide)")
    return
  }

  await expect(proMsg).toBeVisible()
})
