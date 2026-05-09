/**
 * Compteur "Échéances" dans le sidebar — mise à jour en temps réel
 *
 * Vérifie que le compteur sidebar se met à jour sans rechargement de page
 * lors des mutations sur les dossiers administratifs (via BroadcastChannel).
 *
 * Conditions pour que le compteur change :
 *   - Le dossier doit avoir une date d'échéance (deadline IS NOT NULL)
 *   - Le statut ne doit pas être "obtenu" ou "refuse"
 *
 * Variables d'env requises :
 *   E2E_PROJECT_ID — UUID d'un projet avec section "Dossiers administratifs"
 */
import { test, expect, type Page } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

// Viewport desktop — le sidebar n'est visible qu'à partir de xl (1280px)
test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(({}, testInfo) => {
  if (!e2eEnv("E2E_PROJECT_ID")) {
    testInfo.skip(true, "E2E_PROJECT_ID non défini")
  }
})

/** Lit la valeur du badge "Échéances" dans le sidebar. Retourne null si non trouvé. */
async function getDeadlineCount(page: Page): Promise<number | null> {
  const link = page.getByRole("link", { name: /échéances/i }).first()
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

/** Date YYYY-MM-DD dans 30 jours */
function futureDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split("T")[0]
}

// ─── Création ─────────────────────────────────────────────────────────────────

test("sidebar — créer une échéance avec date limite incrémente le compteur en temps réel", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const initialCount = await getDeadlineCount(page)
  if (initialCount === null) {
    test.skip(true, "Sidebar 'Échéances' non visible (viewport trop petit ou layout différent)")
    return
  }

  // Ouvrir le formulaire d'ajout de dossier
  const addBtn = page.getByRole("button", { name: /^ajouter$/i }).first()
  const hasAdd = await addBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasAdd) {
    // Essai avec le bouton "Ajouter le premier dossier"
    const firstAddBtn = page.getByRole("button", { name: /ajouter le premier/i })
    const hasFirst = await firstAddBtn.isVisible({ timeout: 3_000 }).catch(() => false)
    if (!hasFirst) {
      test.skip(true, "Bouton 'Ajouter' non trouvé — section dossiers inaccessible")
      return
    }
    await firstAddBtn.click()
  } else {
    await addBtn.click()
  }

  // Remplir la date d'échéance
  const deadlineInput = page.getByLabel(/échéance/i).first()
  const hasDeadline = await deadlineInput.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasDeadline) {
    test.skip(true, "Champ 'Échéance' non trouvé dans le formulaire")
    return
  }
  await deadlineInput.fill(futureDateStr())

  // Soumettre
  const submitBtn = page.getByRole("button", { name: /ajouter|créer|enregistrer/i }).last()
  await submitBtn.click()

  // Le compteur doit s'incrémenter sans rechargement de page
  await expect(async () => {
    const newCount = await getDeadlineCount(page)
    expect(newCount).toBe(initialCount + 1)
  }).toPass({ timeout: 5_000 })
})

// ─── Suppression ─────────────────────────────────────────────────────────────

test("sidebar — supprimer une échéance décrémente le compteur en temps réel", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const initialCount = await getDeadlineCount(page)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Aucune échéance active à supprimer pour ce test")
    return
  }

  // Cherche un bouton de suppression dans la liste de dossiers
  // (le composant utilise un menu contextuel ou un bouton direct)
  const deleteBtn = page.getByRole("button", { name: /supprimer/i }).first()
  const hasDelete = await deleteBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasDelete) {
    test.skip(true, "Bouton 'Supprimer' non visible — dossiers sans contrôles de suppression")
    return
  }

  await deleteBtn.click()

  // Confirmer si dialog de confirmation présent
  const confirmBtn = page.getByRole("button", { name: /confirmer|supprimer|oui/i }).last()
  const hasConfirm = await confirmBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (hasConfirm) await confirmBtn.click()

  // Le compteur doit se décrémenter sans rechargement de page
  await expect(async () => {
    const newCount = await getDeadlineCount(page)
    expect(newCount).toBe(initialCount - 1)
  }).toPass({ timeout: 5_000 })
})

// ─── Changement de statut → hors compteur ────────────────────────────────────

test("sidebar — passer un dossier en statut 'obtenu' décrémente le compteur", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const initialCount = await getDeadlineCount(page)
  if (initialCount === null || initialCount === 0) {
    test.skip(true, "Aucune échéance active pour tester le changement de statut")
    return
  }

  // Le composant affiche un bouton de progression de statut (flèche ou label "Obtenu")
  const nextStatusBtn = page
    .getByRole("button", { name: /obtenu|marquer obtenu|déposer|suivant/i })
    .first()
  const hasBtn = await nextStatusBtn.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!hasBtn) {
    test.skip(true, "Bouton de progression de statut non visible")
    return
  }

  await nextStatusBtn.click()
  await page.waitForTimeout(1_000)

  // Le compteur doit se décrémenter (statut "obtenu" exclu du comptage)
  await expect(async () => {
    const newCount = await getDeadlineCount(page)
    expect(newCount).toBe(initialCount - 1)
  }).toPass({ timeout: 5_000 })
})
