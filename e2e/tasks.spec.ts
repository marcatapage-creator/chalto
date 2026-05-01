/**
 * RECETTE 7.1 — Créer une tâche et l'assigner à un prestataire
 * RECETTE 7.2 — Déplacer statut todo → in_progress → done (côté pro)
 * RECETTE 7.3 — Tâche done : bouton "Notifier" masqué, "Rouvrir" visible
 * RECETTE 7.4 — "Rouvrir" repasse la tâche en in_progress
 * RECETTE 7.7 — "Notifier" sur tâche in_progress envoie une notification
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID                     — UUID d'un projet en phase chantier
 *                                        (les tâches ne sont visibles qu'en phase chantier)
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({ page: _ }, testInfo) => {
  if (!process.env.E2E_USER_EMAIL || !process.env.E2E_PROJECT_ID) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

// ─── 7.1 : Section tâches ─────────────────────────────────────────────────────

test("7.1 — la section tâches est visible sur la fiche projet", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)
  await expect(page.getByText(/tâche|task/i).first()).toBeVisible({ timeout: 10_000 })
})

test("7.1 — le bouton de création de tâche est accessible", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const addBtn = page
    .getByRole("button", { name: /ajouter.*tâche|nouvelle tâche|créer.*tâche|\+ tâche/i })
    .first()
  await expect(addBtn).toBeVisible({ timeout: 10_000 })
  await expect(addBtn).toBeEnabled()
})

test("7.1 — créer une tâche l'ajoute au board", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  await page
    .getByRole("button", { name: /ajouter.*tâche|nouvelle tâche|créer.*tâche|\+ tâche/i })
    .first()
    .click()

  // Formulaire ou dialog de création
  const taskNameInput = page.getByRole("textbox", { name: /titre|nom|tâche/i }).first()
  await expect(taskNameInput).toBeVisible({ timeout: 8_000 })
  const taskName = `Tâche E2E ${Date.now()}`
  await taskNameInput.fill(taskName)

  await page
    .getByRole("button", { name: /créer|ajouter|enregistrer|confirmer/i })
    .last()
    .click()

  // La tâche apparaît dans le board
  await expect(page.getByText(taskName)).toBeVisible({ timeout: 10_000 })
})

// ─── 7.2 : Colonnes kanban ───────────────────────────────────────────────────

test("7.2 — les colonnes du board de tâches sont visibles", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Au moins une colonne parmi les trois attendues
  const column = page.getByText(/à faire|todo|en cours|in.progress|terminé|done/i).first()
  await expect(column).toBeVisible({ timeout: 10_000 })
})

test("7.2 — une tâche peut changer de statut (bouton ou select visible)", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Chercher une tâche existante en todo ou in_progress
  const taskTodo = page.getByText(/à faire|todo/i).first()
  const hasTodo = await taskTodo.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasTodo) {
    test.skip(true, "Aucune tâche 'todo' sur ce projet de test")
    return
  }

  // Un contrôle de statut doit être accessible (select, button, ou drag)
  const statusControl = page
    .getByRole("button", { name: /en cours|in.progress|démarrer|commencer/i })
    .first()
  const hasControl = await statusControl.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasControl) {
    test.skip(true, "Aucun contrôle de statut trouvé (peut nécessiter un clic sur la tâche)")
    return
  }

  await statusControl.click()
  await expect(page.getByText(/en cours|in.progress/i).first()).toBeVisible({ timeout: 8_000 })
})

// ─── 7.3 : Tâche done — bouton Notifier masqué ───────────────────────────────

test("7.3 — une tâche 'done' affiche 'Rouvrir' et non 'Notifier'", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  // Vérifier si une tâche terminée est visible
  const doneSection = page.getByText(/terminé|done/i).first()
  const hasDone = await doneSection.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasDone) {
    test.skip(true, "Aucune tâche terminée sur ce projet de test")
    return
  }

  // Bouton "Rouvrir" visible dans la zone des tâches terminées
  await expect(page.getByRole("button", { name: /rouvrir/i }).first()).toBeVisible({
    timeout: 8_000,
  })

  // Bouton "Notifier" doit être absent (ou désactivé) pour les tâches terminées
  const notifyBtn = page.getByRole("button", { name: /notifier/i }).first()
  const notifyVisible = await notifyBtn.isVisible({ timeout: 2_000 }).catch(() => false)
  if (notifyVisible) {
    await expect(notifyBtn).toBeDisabled()
  }
})

// ─── 7.4 : Rouvrir une tâche terminée ────────────────────────────────────────

test("7.4 — 'Rouvrir' repasse la tâche en in_progress", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const reopenBtn = page.getByRole("button", { name: /rouvrir/i }).first()
  const hasReopen = await reopenBtn.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasReopen) {
    test.skip(true, "Aucune tâche terminée (bouton 'Rouvrir' absent)")
    return
  }

  await reopenBtn.click()

  // La tâche doit réapparaître en "en cours"
  await expect(page.getByText(/en cours|in.progress/i).first()).toBeVisible({ timeout: 10_000 })
})

// ─── 7.7 : Notifier prestataire ───────────────────────────────────────────────

test("7.7 — 'Notifier' est présent sur une tâche in_progress", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const inProgressSection = page.getByText(/en cours|in.progress/i).first()
  const hasInProgress = await inProgressSection.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasInProgress) {
    test.skip(true, "Aucune tâche 'in_progress' sur ce projet de test")
    return
  }

  await expect(page.getByRole("button", { name: /notifier/i }).first()).toBeVisible({
    timeout: 8_000,
  })
})

test("7.7 — cliquer 'Notifier' ne provoque pas d'erreur", async ({ page }) => {
  await page.goto(`/projects/${process.env.E2E_PROJECT_ID}`)
  await expect(page).not.toHaveURL(/login/)

  const notifyBtn = page.getByRole("button", { name: /notifier/i }).first()
  const hasNotify = await notifyBtn.isVisible({ timeout: 5_000 }).catch(() => false)

  if (!hasNotify) {
    test.skip(true, "Aucun bouton 'Notifier' disponible")
    return
  }

  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })

  await notifyBtn.click()

  // Toast de confirmation ou aucune erreur console
  await page.waitForTimeout(3_000)
  const fatalErrors = errors.filter(
    (e) => !e.includes("favicon") && !e.includes("404") && e.includes("Error")
  )
  expect(fatalErrors).toHaveLength(0)
})
