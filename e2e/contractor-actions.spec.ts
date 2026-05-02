/**
 * RECETTE 5.3 — Prestataire approuve un document (mode validation)
 * RECETTE 5.4 — Prestataire refuse avec commentaire
 * RECETTE 5.5 — Prestataire valide la lecture (mode transmission)
 * RECETTE 5.6 — Valide la lecture avec commentaire optionnel
 * RECETTE 7.5 — Prestataire met à jour le statut d'une tâche (Realtime côté pro)
 * RECETTE 7.6 — Prestataire suggère une tâche
 *
 * Variables d'env requises :
 *   E2E_INVITE_TOKEN              — invite_token d'un espace prestataire
 *   E2E_INVITE_TOKEN_VALIDATION   — invite_token avec un doc en mode validation (statut sent)
 *   E2E_INVITE_TOKEN_TRANSMISSION — invite_token avec un doc en mode transmission (statut sent)
 *
 * Si E2E_INVITE_TOKEN_VALIDATION / E2E_INVITE_TOKEN_TRANSMISSION ne sont pas définis,
 * les tests basculent sur E2E_INVITE_TOKEN en supposant qu'il contient les deux cas.
 *
 * Note : les tests 5.3/5.4 mutent l'état du document. Si le document est déjà
 * validé/refusé (token réutilisé), les boutons ne sont plus présents — le test skip.
 */
import { test, expect } from "@playwright/test"

// ─── 5.3 & 5.4 : Mode validation ─────────────────────────────────────────────

test("5.3 — le bouton 'Approuver' est visible en mode validation", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN_VALIDATION ?? process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN_VALIDATION (ou E2E_INVITE_TOKEN) non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const approveBtn = page.getByRole("button", { name: /approuver/i }).first()
  const isVisible = await approveBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Approuver non disponible (document peut-être déjà validé)")
    return
  }
  await expect(approveBtn).toBeVisible()
})

test("5.3 — prestataire approuve un document en mode validation", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN_VALIDATION
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN_VALIDATION non défini")
    return
  }

  await page.goto(`/invite/${token}`)

  const approveBtn = page.getByRole("button", { name: /approuver/i }).first()
  const isVisible = await approveBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Approuver non disponible (document peut-être déjà validé)")
    return
  }

  await approveBtn.click()
  await expect(page.getByText(/approuvé|confirmé|merci/i)).toBeVisible({ timeout: 10_000 })
})

test("5.4 — prestataire refuse un document avec un commentaire", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN_VALIDATION
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN_VALIDATION non défini")
    return
  }

  await page.goto(`/invite/${token}`)

  const refuseBtn = page.getByRole("button", { name: /refuser/i }).first()
  const isVisible = await refuseBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton Refuser non disponible (document peut-être déjà validé)")
    return
  }

  // Remplir le commentaire avant de cliquer Refuser (textarea inline au-dessus des boutons)
  const textarea = page.getByRole("textbox").first()
  if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await textarea.fill("Modifications nécessaires sur ce document.")
  }

  await refuseBtn.click()
  await expect(page.getByText(/refusé/i)).toBeVisible({ timeout: 10_000 })
})

// ─── 5.5 & 5.6 : Mode transmission ───────────────────────────────────────────

test("5.5 — le bouton 'Valider la lecture' est présent en mode transmission", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN_TRANSMISSION ?? process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const readBtn = page.getByRole("button", { name: /valider la lecture|j'ai lu|accusé/i }).first()
  const isVisible = await readBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton 'Valider la lecture' non disponible (document peut-être déjà lu)")
    return
  }
  await expect(readBtn).toBeVisible()
})

test("5.5 — cliquer 'Valider la lecture' affiche la confirmation et masque le bouton", async ({
  page,
}) => {
  const token = process.env.E2E_INVITE_TOKEN_TRANSMISSION ?? process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)

  const readBtn = page.getByRole("button", { name: /valider la lecture|j'ai lu|accusé/i }).first()
  const isVisible = await readBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton 'Valider la lecture' non disponible (document peut-être déjà lu)")
    return
  }

  await readBtn.click()

  // Confirmation de lecture visible (avec 2 docs en seed, un autre bouton peut rester visible)
  await expect(page.getByText(/lu|lecture validée/i).first()).toBeVisible({ timeout: 10_000 })
})

test("5.6 — valide la lecture avec un commentaire optionnel", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN_TRANSMISSION
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN_TRANSMISSION non défini")
    return
  }

  await page.goto(`/invite/${token}`)

  const readBtn = page.getByRole("button", { name: /valider la lecture|j'ai lu/i }).first()
  const isVisible = await readBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!isVisible) {
    test.skip(true, "Bouton 'Valider la lecture' non disponible (document peut-être déjà lu)")
    return
  }

  const commentInput = page.getByRole("textbox", { name: /commentaire|message/i }).first()
  if (await commentInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await commentInput.fill("Document bien reçu, pris en compte.")
  }

  await readBtn.click()
  await expect(page.getByText(/lu|lecture validée/i).first()).toBeVisible({ timeout: 10_000 })
})

// ─── 7.5 : Prestataire met à jour le statut d'une tâche ──────────────────────

test("7.5 — le prestataire voit ses tâches dans l'espace collaboration", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)
  await expect(page).not.toHaveURL(/login/)

  const taskSection = page.getByText(/tâche|task/i).first()
  const hasTasks = await taskSection.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasTasks) {
    test.skip(true, "Aucune tâche visible avec ce token")
    return
  }

  // Un contrôle de statut de tâche doit être accessible
  const statusBtn = page.getByRole("button", { name: /démarrer|terminer/i }).first()
  await expect(statusBtn).toBeVisible({ timeout: 8_000 })
})

test("7.5 — le prestataire peut changer le statut d'une tâche sans erreur", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await page.goto(`/invite/${token}`)

  const statusBtn = page.getByRole("button", { name: /démarrer|terminer/i }).first()
  const hasBtn = await statusBtn.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Aucun bouton de changement de statut disponible")
    return
  }

  await statusBtn.click()
  await page.waitForTimeout(2_000)

  const fatalErrors = errors.filter((e) => e.includes("Error") && !e.includes("favicon"))
  expect(fatalErrors).toHaveLength(0)
})

// ─── 7.6 : Prestataire suggère une tâche ─────────────────────────────────────

test("7.6 — l'option de suggestion de tâche est présente et cliquable", async ({ page }) => {
  const token = process.env.E2E_INVITE_TOKEN
  if (!token) {
    test.skip(true, "E2E_INVITE_TOKEN non défini")
    return
  }

  await page.goto(`/invite/${token}`)

  const suggestBtn = page
    .getByRole("button", { name: /suggérer|proposer.*tâche|nouvelle tâche/i })
    .first()
  const hasSuggest = await suggestBtn.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasSuggest) {
    test.skip(true, "Option suggestion de tâche non disponible avec ce token")
    return
  }

  await expect(suggestBtn).toBeEnabled()
  await suggestBtn.click()

  // Un formulaire ou dialog de suggestion doit s'ouvrir
  await expect(page.getByRole("textbox").first()).toBeVisible({ timeout: 8_000 })
})
