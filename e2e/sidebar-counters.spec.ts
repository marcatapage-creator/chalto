/**
 * Compteurs "Projets" et "Annuaire" dans le sidebar — exactitude après mutation
 *
 * Vérifie que les badges numériques du sidebar reflètent correctement le nombre
 * réel de projets et contacts après création et suppression.
 *
 * Stratégie : après chaque mutation, on force un rechargement de page pour
 * déclencher le useEffect du sidebar (qui fetch les counts côté client).
 * On ne teste pas le Realtime ici — c'est déjà couvert par realtime.spec.ts
 * via un setup dual-context. Ce fichier teste que le count est juste.
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 */
import { test, expect, type Page } from "@playwright/test"

// Le sidebar n'est visible qu'à partir de xl (≥ 1280px)
test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(({}, testInfo) => {
  if (!process.env.E2E_USER_EMAIL) {
    testInfo.skip(true, "E2E_USER_EMAIL non défini")
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lit la valeur du badge d'un item de navigation. Retourne null si non trouvé. */
async function getNavCount(page: Page, label: RegExp): Promise<number | null> {
  const link = page.getByRole("link", { name: label }).first()
  const visible = await link.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!visible) return null
  const text = await link
    .locator("span")
    .last()
    .innerText()
    .catch(() => "")
  const n = parseInt(text.trim(), 10)
  return isNaN(n) ? 0 : n
}

/**
 * Lit le count après que le sidebar a chargé ses vraies valeurs depuis Supabase.
 * Le layout SSR initialise toujours à 0 — networkidle attend la fin du useEffect fetch.
 */
async function getStableNavCount(page: Page, label: RegExp): Promise<number | null> {
  await page.waitForLoadState("networkidle")
  return getNavCount(page, label)
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJETS
// ══════════════════════════════════════════════════════════════════════════════

const E2E_PROJECT_NAME = `E2E Sidebar Projet ${Date.now()}`

test("sidebar — créer un projet incrémente le compteur Projets", async ({ page }) => {
  // Baseline
  await page.goto("/projects")
  await expect(page).not.toHaveURL(/login/)
  const initialCount = await getStableNavCount(page, /projets/i)
  if (initialCount === null) {
    test.skip(true, "Badge 'Projets' non visible (viewport < xl ou layout différent)")
    return
  }

  // Créer le projet
  await page.goto("/projects/new")
  await expect(page).not.toHaveURL(/login/)
  const nameInput = page.getByRole("textbox", { name: /nom|titre|name/i }).first()
  await expect(nameInput).toBeVisible({ timeout: 10_000 })
  await nameInput.fill(E2E_PROJECT_NAME)
  await page
    .getByRole("button", { name: /créer|enregistrer|suivant|continuer/i })
    .first()
    .click()
  await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 15_000 })

  // Revenir sur /projects pour déclencher le re-fetch du sidebar
  await page.goto("/projects")
  const newCount = await getStableNavCount(page, /projets/i)
  expect(newCount).toBe(initialCount + 1)
})

test("sidebar — supprimer un projet décrémente le compteur Projets", async ({ page }) => {
  await page.goto("/projects")
  await expect(page).not.toHaveURL(/login/)

  // Chercher le projet E2E créé précédemment
  const projectCard = page.locator('[data-slot="card"], article, li').filter({
    hasText: E2E_PROJECT_NAME,
  })
  const hasTarget = await projectCard
    .first()
    .isVisible({ timeout: 8_000 })
    .catch(() => false)
  if (!hasTarget) {
    test.skip(true, "Projet E2E cible non trouvé — exécuter le test de création d'abord")
    return
  }

  const initialCount = await getStableNavCount(page, /projets/i)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Compteur Projets non lisible ou déjà à 0")
    return
  }

  // Supprimer le projet
  await projectCard.first().getByRole("button").first().click()
  const deleteItem = page
    .getByRole("menuitem", { name: /supprimer/i })
    .or(page.getByRole("button", { name: /supprimer/i }))
    .first()
  await expect(deleteItem).toBeVisible({ timeout: 5_000 })
  await deleteItem.click()
  const confirmBtn = page.getByRole("button", { name: /confirmer|oui|supprimer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Attendre que le projet disparaisse de la liste, puis recharger pour un count frais
  await expect(page.getByText(E2E_PROJECT_NAME)).not.toBeVisible({ timeout: 8_000 })
  await page.goto("/projects")
  const newCount = await getStableNavCount(page, /projets/i)
  expect(newCount).toBe(initialCount - 1)
})

// ══════════════════════════════════════════════════════════════════════════════
// ANNUAIRE (CONTACTS)
// ══════════════════════════════════════════════════════════════════════════════

const E2E_CONTACT_NAME = `E2E Sidebar Contact ${Date.now()}`
const E2E_CONTACT_EMAIL = `e2e-sidebar-${Date.now()}@example-test.com`

test("sidebar — créer un contact incrémente le compteur Annuaire", async ({ page }) => {
  // Baseline
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)
  const initialCount = await getStableNavCount(page, /annuaire/i)
  if (initialCount === null) {
    test.skip(true, "Badge 'Annuaire' non visible (viewport < xl ou layout différent)")
    return
  }

  // Créer le contact via dialog
  await page
    .getByRole("button", { name: /nouveau|ajouter|créer/i })
    .first()
    .click()
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

  // Recharger la page pour déclencher le re-fetch du sidebar
  await page.goto("/contacts")
  const newCount = await getStableNavCount(page, /annuaire/i)
  expect(newCount).toBe(initialCount + 1)
})

test("sidebar — supprimer un contact décrémente le compteur Annuaire", async ({ page }) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  const contactTarget = page.getByText(E2E_CONTACT_NAME).first()
  const hasTarget = await contactTarget.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasTarget) {
    test.skip(true, "Contact E2E cible non trouvé — exécuter le test de création d'abord")
    return
  }

  const initialCount = await getStableNavCount(page, /annuaire/i)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Compteur Annuaire non lisible ou déjà à 0")
    return
  }

  // Supprimer le contact
  const contactCard = page
    .locator('[data-slot="card"]')
    .filter({ hasText: E2E_CONTACT_NAME })
    .first()
  await contactCard.getByRole("button").first().click()
  await page
    .getByRole("menuitem", { name: /supprimer/i })
    .first()
    .click()
  const confirmBtn = page.getByRole("button", { name: /confirmer|oui|supprimer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Attendre que le contact disparaisse, puis recharger pour un count frais
  await expect(page.getByText(E2E_CONTACT_NAME)).not.toBeVisible({ timeout: 8_000 })
  await page.goto("/contacts")
  const newCount = await getStableNavCount(page, /annuaire/i)
  expect(newCount).toBe(initialCount - 1)
})
