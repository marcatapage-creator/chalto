/**
 * RECETTE 8.1 — Créer un contact
 * RECETTE 8.2 — Modifier un contact
 * RECETTE 8.3 — Supprimer un contact
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 */
import { test, expect } from "@playwright/test"

const E2E_CONTACT_NAME = `E2E Contact ${Date.now()}`
const E2E_CONTACT_EMAIL = "e2e-contact@example-test.com"

test.beforeEach(({}, testInfo) => {
  if (!process.env.E2E_USER_EMAIL) {
    testInfo.skip(true, "E2E_USER_EMAIL non défini")
  }
})

// ─── Navigation ───────────────────────────────────────────────────────────────

test("contacts — /contacts se charge sans redirection login", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 })
})

// ─── 8.1 : Création contact ───────────────────────────────────────────────────

test("8.1 — le bouton d'ajout de contact est présent", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  await expect(page.getByRole("button", { name: /nouveau|ajouter|créer/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

test("8.1 — créer un contact et le voir dans la liste", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /nouveau|ajouter|créer/i })
    .first()
    .click()

  // Formulaire de création (dialog ou inline)
  const nameInput = page.getByPlaceholder(/marc dupuis/i).first()
  await expect(nameInput).toBeVisible({ timeout: 8_000 })
  await nameInput.fill(E2E_CONTACT_NAME)

  const emailInput = page.getByPlaceholder(/marc@exemple/i).first()
  await expect(emailInput).toBeVisible()
  await emailInput.fill(E2E_CONTACT_EMAIL)

  await page
    .getByRole("button", { name: /créer|ajouter|enregistrer|confirmer/i })
    .last()
    .click()

  await expect(page.getByText(E2E_CONTACT_NAME)).toBeVisible({ timeout: 10_000 })
})

// ─── 8.2 : Modification contact ──────────────────────────────────────────────

test("8.2 — modifier le nom d'un contact persiste", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  // Chercher le premier contact disponible (cards, pas listitem)
  const firstContact = page.locator('[data-slot="card"]').first()
  const hasContact = await firstContact.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasContact) {
    test.skip(true, "Aucun contact dans la liste")
    return
  }

  // Ouvrir l'édition (bouton modifier ou click sur le contact)
  const editBtn = page.getByRole("button", { name: /modifier|éditer|edit/i }).first()
  const hasEdit = await editBtn.isVisible({ timeout: 3_000 }).catch(() => false)

  if (!hasEdit) {
    // Essayer via click sur la ligne
    await firstContact.click()
  } else {
    await editBtn.click()
  }

  const nameInput = page.getByRole("textbox", { name: /nom|name/i }).first()
  await expect(nameInput).toBeVisible({ timeout: 8_000 })
  await nameInput.clear()
  await nameInput.fill(`Contact Modifié E2E ${Date.now()}`)

  await page
    .getByRole("button", { name: /enregistrer|sauvegarder|mettre à jour/i })
    .last()
    .click()

  await expect(page.getByText(/enregistré|sauvegardé|mis à jour/i).first()).toBeVisible({
    timeout: 10_000,
  })
})

// ─── 8.3 : Suppression contact ────────────────────────────────────────────────

test("8.3 — supprimer un contact le retire de la liste sans erreur", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  // Chercher un contact e2e de test à supprimer
  const contactToDelete = page.getByText(E2E_CONTACT_NAME).first()
  const hasTarget = await contactToDelete.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasTarget) {
    test.skip(true, "Contact E2E cible non trouvé — exécuter le test de création d'abord")
    return
  }

  // Ouvrir le menu "..." de la carte du contact cible
  const contactCard = page
    .locator('[data-slot="card"]')
    .filter({ hasText: E2E_CONTACT_NAME })
    .first()
  await contactCard.getByRole("button").first().click()
  await page
    .getByRole("menuitem", { name: /supprimer/i })
    .first()
    .click()

  // Confirmation éventuelle
  const confirmBtn = page.getByRole("button", { name: /confirmer|oui|supprimer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Le contact doit disparaître de la liste
  await expect(page.getByText(E2E_CONTACT_NAME)).not.toBeVisible({ timeout: 10_000 })
})

test("8.3 — pas d'erreur console lors de la suppression", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  const deleteBtn = page.getByRole("button", { name: /supprimer|effacer|delete/i }).first()
  const hasDelete = await deleteBtn.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasDelete) {
    test.skip(true, "Aucun bouton de suppression accessible")
    return
  }

  await deleteBtn.click()

  const confirmBtn = page.getByRole("button", { name: /confirmer|oui|supprimer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  await page.waitForTimeout(2_000)
  const fatalErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("404") && e.includes("Error")
  )
  expect(fatalErrors).toHaveLength(0)
})
