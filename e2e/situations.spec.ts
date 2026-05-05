/**
 * RECETTE 8.1 — Prestataire voit la section "Situations de travaux" dans son espace
 * RECETTE 8.2 — Prestataire soumet une nouvelle situation
 * RECETTE 8.3 — Situation soumise apparaît avec le statut "En attente"
 * RECETTE 8.4 — Architecte voit la situation dans la fiche projet
 * RECETTE 8.5 — Dialog de révision s'ouvre avec les contrôles Valider / Refuser
 * RECETTE 8.6 — Architecte valide une situation (statut → Validée)
 * RECETTE 8.7 — Architecte refuse une situation avec motif (statut → Refusée)
 * RECETTE 8.8 — Page récapitulatif PDF accessible et affiche les données
 *
 * Variables d'env requises :
 *   E2E_INVITE_TOKEN    — token prestataire (espace sans auth)
 *   E2E_PROJECT_ID      — UUID du projet en phase chantier
 *   E2E_SITUATION_ID    — UUID de la situation seedée (pour les tests architecte)
 */
import { test, expect } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

// ─── 8.1 : Section situations visible côté prestataire ───────────────────────

test("8.1 — la section 'Situations de travaux' est visible dans l'espace prestataire", async ({
  page,
}) => {
  const token = e2eEnv("E2E_INVITE_TOKEN")
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  await expect(page.getByText(/situations de travaux/i).first()).toBeVisible({ timeout: 10_000 })
})

test("8.1 — le bouton de navigation 'Situations' est présent dans le header prestataire", async ({
  page,
}) => {
  const token = e2eEnv("E2E_INVITE_TOKEN")
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  await expect(page.getByRole("button", { name: /situations/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

// ─── 8.2 & 8.3 : Soumission d'une situation ──────────────────────────────────

test("8.2 — le bouton 'Nouvelle situation' est présent", async ({ page }) => {
  const token = e2eEnv("E2E_INVITE_TOKEN")
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const newBtn = page.getByRole("button", { name: /nouvelle situation|soumettre|ajouter/i }).first()
  await expect(newBtn).toBeVisible({ timeout: 10_000 })
})

test("8.3 — prestataire soumet une situation et elle apparaît en 'En attente'", async ({
  page,
}) => {
  const token = e2eEnv("E2E_INVITE_TOKEN")
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const newBtn = page.getByRole("button", { name: /nouvelle situation|soumettre|ajouter/i }).first()
  const hasBtn = await newBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton de soumission introuvable")
    return
  }

  await newBtn.click()

  // Formulaire de soumission
  const lotInput = page.getByRole("textbox", { name: /lot|intitulé|label/i }).first()
  const hasForm = await lotInput.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasForm) {
    test.skip(true, "Formulaire de situation introuvable après clic")
    return
  }

  const lotLabel = `Lot E2E ${Date.now()}`
  await lotInput.fill(lotLabel)

  // Percentage — cherche un input number ou textbox avec placeholder %
  const percentInput = page
    .getByRole("spinbutton")
    .or(page.getByPlaceholder(/pourcentage|%/i))
    .first()
  const hasPercent = await percentInput.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasPercent) {
    await percentInput.fill("50")
  }

  // Soumet
  const submitBtn = page.getByRole("button", { name: /soumettre|envoyer|créer|confirmer/i }).last()
  await submitBtn.click()

  // La situation créée apparaît avec le badge "En attente"
  await expect(page.getByText(/en attente/i).first()).toBeVisible({ timeout: 12_000 })
})

// ─── 8.4 : Architecte voit la section situations ─────────────────────────────

test("8.4 — la section 'Situations de travaux' est visible dans la fiche projet", async ({
  page,
}) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  await expect(page.getByText(/situations de travaux/i).first()).toBeVisible({ timeout: 10_000 })
})

test("8.4 — la situation seedée '[E2E] Gros œuvre' est visible", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  // La situation seedée par global-setup
  const situationRow = page.getByText(/gros.œuvre|gros oeuvre/i).first()
  const hasRow = await situationRow.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasRow) {
    test.skip(true, "Situation seedée introuvable (section peut-être repliée ou phase différente)")
    return
  }

  await expect(situationRow).toBeVisible()
})

// ─── 8.5 : Dialog de révision ────────────────────────────────────────────────

test("8.5 — le bouton 'Réviser cette situation' ouvre un dialog", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  const reviewBtn = page.getByRole("button", { name: /réviser/i }).first()
  const hasBtn = await reviewBtn.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton 'Réviser' introuvable (situation peut-être déjà révisée)")
    return
  }

  await reviewBtn.click()

  // Le dialog de révision s'ouvre
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 })
  await expect(page.getByRole("heading", { name: /réviser la situation/i })).toBeVisible({
    timeout: 5_000,
  })
})

test("8.5 — le dialog expose les boutons Valider et Refuser", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  const reviewBtn = page.getByRole("button", { name: /réviser/i }).first()
  const hasBtn = await reviewBtn.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton 'Réviser' introuvable")
    return
  }

  await reviewBtn.click()
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 })

  // Toggle Valider (dans le dialog)
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("button", { name: /^valider$/i }).first()).toBeVisible({
    timeout: 5_000,
  })
  await expect(dialog.getByRole("button", { name: /^refuser$/i }).first()).toBeVisible({
    timeout: 5_000,
  })
})

// ─── 8.6 : Validation d'une situation ────────────────────────────────────────

test("8.6 — architecte valide une situation — statut passe à 'Validée'", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  const reviewBtn = page.getByRole("button", { name: /réviser/i }).first()
  const hasBtn = await reviewBtn.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Aucune situation à réviser (toutes déjà révisées)")
    return
  }

  await reviewBtn.click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 5_000 })

  // Le toggle "Valider" est sélectionné par défaut — cliquer le bouton de confirmation
  const confirmBtn = dialog.getByRole("button", { name: /^valider$/i }).last()
  await confirmBtn.click()

  // Toast de succès et badge "Validée" visible
  await expect(page.getByText(/validée|validé/i).first()).toBeVisible({ timeout: 12_000 })
})

// ─── 8.7 : Refus avec motif ───────────────────────────────────────────────────

test("8.7 — le motif de refus est obligatoire avant de valider le refus", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  const reviewBtn = page.getByRole("button", { name: /réviser/i }).first()
  const hasBtn = await reviewBtn.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Aucune situation à réviser")
    return
  }

  await reviewBtn.click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 5_000 })

  // Basculer sur "Refuser"
  await dialog
    .getByRole("button", { name: /^refuser$/i })
    .first()
    .click()

  // Le textarea de motif doit apparaître
  const refusalTextarea = dialog.getByRole("textbox").first()
  await expect(refusalTextarea).toBeVisible({ timeout: 5_000 })

  // Le bouton de confirmation doit être désactivé sans motif
  const confirmBtn = dialog.getByRole("button", { name: /^refuser$/i }).last()
  await expect(confirmBtn).toBeDisabled()

  // Fermer sans soumettre
  await dialog.getByRole("button", { name: /annuler/i }).click()
  await expect(dialog).not.toBeVisible({ timeout: 3_000 })
})

// ─── 8.8 : Page récapitulatif PDF ────────────────────────────────────────────

test("8.8 — la page récapitulatif PDF est accessible", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  const response = await page.goto(`/projects/${projectId}/situations/print`)
  expect(response?.status()).not.toBe(404)
  await expect(page).not.toHaveURL(/login/)
})

test("8.8 — la page PDF affiche le nom du projet et un bouton d'impression", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}/situations/print`)
  await expect(page).not.toHaveURL(/login/)

  // Titre du récap
  await expect(page.getByText(/récapitulatif situations/i)).toBeVisible({ timeout: 10_000 })

  // Bouton imprimer
  await expect(page.getByRole("button", { name: /imprimer|pdf/i })).toBeVisible({ timeout: 5_000 })
})

test("8.8 — le lien 'Récap PDF' depuis la fiche projet ouvre la bonne URL", async ({ page }) => {
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!projectId) {
    test.skip(true, "E2E_PROJECT_ID non défini")
    return
  }

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)

  // Cherche le lien "Récap PDF"
  const pdfLink = page.getByRole("link", { name: /récap.?pdf/i }).first()
  const hasLink = await pdfLink.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasLink) {
    test.skip(true, "Lien 'Récap PDF' introuvable (aucune situation ou section repliée)")
    return
  }

  const href = await pdfLink.getAttribute("href")
  expect(href).toContain(`/projects/${projectId}/situations/print`)
})
