/**
 * Compteurs "Projets" et "Annuaire" dans le sidebar — mise à jour en temps réel
 *
 * Vérifie que les badges numériques du sidebar se mettent à jour sans rechargement
 * de page lors des mutations sur les projets et les contacts (via Supabase Realtime).
 *
 * Architecture :
 *   - Projets/Contacts → Realtime postgres_changes (INSERT/DELETE) via useRealtimeChannel
 *   - Le sidebar (layout persiste) doit refléter le changement sans router.refresh()
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

// ══════════════════════════════════════════════════════════════════════════════
// PROJETS
// ══════════════════════════════════════════════════════════════════════════════

const E2E_PROJECT_NAME = `E2E Sidebar Projet ${Date.now()}`

test("sidebar — créer un projet incrémente le compteur Projets en temps réel", async ({ page }) => {
  await page.goto("/projects")
  await expect(page).not.toHaveURL(/login/)

  const initialCount = await getNavCount(page, /projets/i)
  if (initialCount === null) {
    test.skip(true, "Badge 'Projets' non visible (viewport < xl ou layout différent)")
    return
  }

  // Naviguer vers le formulaire de création
  await page.goto("/projects/new")
  await expect(page).not.toHaveURL(/login/)

  const nameInput = page.getByRole("textbox", { name: /nom|titre|name/i }).first()
  await expect(nameInput).toBeVisible({ timeout: 10_000 })
  await nameInput.fill(E2E_PROJECT_NAME)

  await page
    .getByRole("button", { name: /créer|enregistrer|suivant|continuer/i })
    .first()
    .click()

  // Attend la redirection vers la fiche projet (la création a réussi)
  await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+$/, { timeout: 15_000 })

  // Le Realtime INSERT doit incrémenter le badge sans rechargement
  await expect(async () => {
    const newCount = await getNavCount(page, /projets/i)
    expect(newCount).toBe(initialCount + 1)
  }).toPass({ timeout: 8_000 })
})

test("sidebar — supprimer un projet décrémente le compteur Projets en temps réel", async ({
  page,
}) => {
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

  const initialCount = await getNavCount(page, /projets/i)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Compteur Projets non lisible ou déjà à 0")
    return
  }

  // Ouvrir le menu contextuel de la carte projet
  const menuBtn = projectCard.first().getByRole("button").first()
  await menuBtn.click()

  const deleteItem = page
    .getByRole("menuitem", { name: /supprimer/i })
    .or(page.getByRole("button", { name: /supprimer/i }))
    .first()
  await expect(deleteItem).toBeVisible({ timeout: 5_000 })
  await deleteItem.click()

  // Confirmer si dialog de confirmation présent
  const confirmBtn = page.getByRole("button", { name: /confirmer|oui|supprimer/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Le Realtime DELETE doit décrémenter le badge sans rechargement
  await expect(async () => {
    const newCount = await getNavCount(page, /projets/i)
    expect(newCount).toBe(initialCount - 1)
  }).toPass({ timeout: 8_000 })
})

// ══════════════════════════════════════════════════════════════════════════════
// ANNUAIRE (CONTACTS)
// ══════════════════════════════════════════════════════════════════════════════

const E2E_CONTACT_NAME = `E2E Sidebar Contact ${Date.now()}`
const E2E_CONTACT_EMAIL = `e2e-sidebar-${Date.now()}@example-test.com`

test("sidebar — créer un contact incrémente le compteur Annuaire en temps réel", async ({
  page,
}) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  const initialCount = await getNavCount(page, /annuaire/i)
  if (initialCount === null) {
    test.skip(true, "Badge 'Annuaire' non visible (viewport < xl ou layout différent)")
    return
  }

  // Ouvrir le formulaire de création
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

  // Le contact doit apparaître dans la liste
  await expect(page.getByText(E2E_CONTACT_NAME)).toBeVisible({ timeout: 10_000 })

  // Le Realtime INSERT doit incrémenter le badge sans rechargement
  await expect(async () => {
    const newCount = await getNavCount(page, /annuaire/i)
    expect(newCount).toBe(initialCount + 1)
  }).toPass({ timeout: 8_000 })
})

test("sidebar — supprimer un contact décrémente le compteur Annuaire en temps réel", async ({
  page,
}) => {
  await page.goto("/contacts")
  await expect(page).not.toHaveURL(/login/)

  const contactTarget = page.getByText(E2E_CONTACT_NAME).first()
  const hasTarget = await contactTarget.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasTarget) {
    test.skip(true, "Contact E2E cible non trouvé — exécuter le test de création d'abord")
    return
  }

  const initialCount = await getNavCount(page, /annuaire/i)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Compteur Annuaire non lisible ou déjà à 0")
    return
  }

  // Ouvrir le menu contextuel de la carte contact
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

  // Le Realtime DELETE doit décrémenter le badge sans rechargement
  await expect(async () => {
    const newCount = await getNavCount(page, /annuaire/i)
    expect(newCount).toBe(initialCount - 1)
  }).toPass({ timeout: 8_000 })
})
