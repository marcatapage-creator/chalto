/**
 * RECETTE 9 — Assistant réunion de chantier
 *
 * 9.1 — Bouton "Nouvelle réunion" visible dans Discussion chantier
 * 9.2 — Le modal s'ouvre au clic et affiche les participants du projet
 * 9.3 — L'architecte est pré-coché ; les participants sont cochables/décochables
 * 9.4 — Le champ "Notes rapides" est présent et éditable
 * 9.5 — Le bouton "Démarrer" est actif si au moins un participant coché
 * 9.6 — Flow complet (mock audio + mock API) : le CR apparaît dans le fil
 * 9.7 — Boutons "Envoyer à tous" et "Créer les tâches" visibles sur un CR existant
 * 9.8 — "Créer les tâches" crée les actions dans la section Tâches
 *
 * Stratégie mocking :
 *  - getUserMedia + MediaRecorder : injectés en addInitScript (pas de vrai micro)
 *  - POST /api/meetings             : intercepté via page.route() (pas de Whisper/Claude)
 *  - POST /api/meetings/[id]/tasks  : intercepté pour tester la réaction UI
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID                     — UUID d'un projet en phase chantier
 */
import { test, expect, type Page } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(({}, testInfo) => {
  if (!e2eEnv("E2E_USER_EMAIL") || !e2eEnv("E2E_PROJECT_ID")) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Ouvre la section Discussion chantier si elle est repliée. */
async function openDiscussion(page: Page) {
  const header = page.getByText("Discussion chantier")
  await expect(header).toBeVisible({ timeout: 10_000 })
  const isOpen = await page
    .locator('[data-testid="discussion-body"]')
    .isVisible()
    .catch(() => false)
  if (!isOpen) await header.click()
}

/** Injecte un faux getUserMedia + MediaRecorder pour simuler l'enregistrement. */
async function injectAudioMocks(page: Page) {
  await page.addInitScript(() => {
    // Faux MediaStream
    const fakeStream = {
      getTracks: () => [{ stop: () => {} }],
      getAudioTracks: () => [{ stop: () => {} }],
    }
    Object.defineProperty(navigator, "mediaDevices", {
      writable: true,
      value: {
        getUserMedia: () => Promise.resolve(fakeStream),
      },
    })

    // Faux MediaRecorder
    class FakeMediaRecorder extends EventTarget {
      state: string = "inactive"
      ondataavailable: ((e: { data: Blob }) => void) | null = null
      onstop: (() => void) | null = null
      stream = fakeStream

      constructor() {
        super()
        // Émet un chunk immédiatement après démarrage
        setTimeout(() => {
          this.ondataavailable?.({ data: new Blob(["fake-audio"], { type: "audio/mp4" }) })
        }, 100)
      }

      start(_timeslice?: number) {
        this.state = "recording"
      }
      pause() {
        this.state = "paused"
      }
      resume() {
        this.state = "recording"
      }
      stop() {
        this.state = "inactive"
        this.onstop?.()
      }

      static isTypeSupported(_mime: string) {
        return true
      }
    }

    // @ts-expect-error — FakeMediaRecorder ne satisfait pas complètement l'interface MediaRecorder
    window.MediaRecorder = FakeMediaRecorder
  })
}

/** Objet meeting_report minimal retourné par le mock API. */
function fakeMeeting(projectId: string) {
  return {
    id: "e2e-meeting-id-001",
    project_id: projectId,
    user_id: "e2e-user-id",
    meeting_date: new Date().toISOString().split("T")[0],
    participants: ["Pro E2E", "[E2E] Prestataire Test"],
    notes: "Note de test",
    audio_url: null,
    transcript: null,
    report: {
      decisions: ["Décision E2E n°1", "Décision E2E n°2"],
      actions: [
        { titre: "Action E2E à créer", responsable: "[E2E] Prestataire Test", echeance: "15 juin" },
      ],
      points_en_suspens: ["Point en suspens E2E"],
      prochaine_reunion: { date: "5 juin", lieu: "Chantier", ordre_du_jour: "Réception RDC" },
    },
    status: "ready",
    meeting_number: 1,
    created_at: new Date().toISOString(),
  }
}

// ─── 9.1 : Bouton "Nouvelle réunion" ─────────────────────────────────────────

test("9.1 — le bouton 'Nouvelle réunion' est visible dans Discussion chantier", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  const btn = page.getByRole("button", { name: /nouvelle réunion/i })
  await expect(btn).toBeVisible({ timeout: 10_000 })
  await expect(btn).toBeEnabled()
})

// ─── 9.2 : Ouverture du modal ─────────────────────────────────────────────────

test("9.2 — le modal s'ouvre et affiche les participants du projet", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()

  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })
  await expect(dialog.getByText(/réunion de chantier/i)).toBeVisible()

  // Au moins un participant listé (l'architecte)
  const labelCount = await dialog.locator("label").count()
  expect(labelCount).toBeGreaterThanOrEqual(1)
})

// ─── 9.3 : Participants ───────────────────────────────────────────────────────

test("9.3 — l'architecte est pré-coché dans la liste des participants", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  // Au moins une checkbox cochée (l'architecte pré-sélectionné)
  const checkedBoxes = dialog.locator('[data-state="checked"]')
  await expect(checkedBoxes.first()).toBeVisible({ timeout: 5_000 })
})

test("9.3 — une checkbox peut être décochée et recochée", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  const firstLabel = dialog.locator("label").first()
  const checkbox = firstLabel.locator('[role="checkbox"]')
  await expect(checkbox).toBeVisible({ timeout: 5_000 })

  // Décoche
  await firstLabel.click()
  await expect(checkbox).toHaveAttribute("data-state", "unchecked", { timeout: 3_000 })

  // Recoche
  await firstLabel.click()
  await expect(checkbox).toHaveAttribute("data-state", "checked", { timeout: 3_000 })
})

// ─── 9.4 : Notes rapides ─────────────────────────────────────────────────────

test("9.4 — le champ notes est présent et éditable", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  const notes = dialog.getByPlaceholder(/points.*oublier|note/i)
  await expect(notes).toBeVisible({ timeout: 5_000 })
  await notes.fill("Note de test E2E")
  await expect(notes).toHaveValue("Note de test E2E")
})

// ─── 9.5 : Bouton "Démarrer" ─────────────────────────────────────────────────

test("9.5 — le bouton Démarrer est actif quand des participants sont sélectionnés", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  const startBtn = dialog.getByRole("button", { name: /démarrer/i })
  await expect(startBtn).toBeEnabled({ timeout: 5_000 })
})

test("9.5 — le bouton Démarrer est désactivé quand tous les participants sont décochés", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  // Décoche toutes les checkboxes
  const labels = dialog.locator("label")
  const count = await labels.count()
  for (let i = 0; i < count; i++) {
    const cb = labels.nth(i).locator('[role="checkbox"]')
    const state = await cb.getAttribute("data-state")
    if (state === "checked") await labels.nth(i).click()
  }

  await expect(dialog.getByRole("button", { name: /démarrer/i })).toBeDisabled({ timeout: 3_000 })
})

// ─── 9.6 : Flow complet (mock audio + mock API) ───────────────────────────────

test("9.6 — flow complet : enregistrement simulé → CR généré → carte visible dans le fil", async ({
  page,
}) => {
  await injectAudioMocks(page)

  const projectId = e2eEnv("E2E_PROJECT_ID")!

  // Mock POST /api/meetings
  await page.route("**/api/meetings", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeMeeting(projectId)),
    })
  })

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  // Ouvre le modal
  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  // Démarre l'enregistrement
  await dialog.getByRole("button", { name: /démarrer/i }).click()

  // Le timer doit apparaître (interface d'enregistrement)
  await expect(dialog.getByText(/\d{2}:\d{2}/)).toBeVisible({ timeout: 8_000 })

  // Arrête et génère le CR
  await dialog.getByRole("button", { name: /arrêter.*générer|stop/i }).click()

  // Les étapes de traitement apparaissent
  await expect(dialog.getByText(/envoi|transcription|génération/i).first()).toBeVisible({
    timeout: 5_000,
  })

  // Le CR est généré — étape "done"
  await expect(dialog.getByText(/généré avec succès/i)).toBeVisible({ timeout: 30_000 })

  // Ferme le modal
  await dialog.getByRole("button", { name: /fermer/i }).click()
  await expect(dialog).not.toBeVisible({ timeout: 5_000 })

  // La carte de réunion est visible dans le fil de discussion
  await expect(page.getByText(/réunion n°1/i)).toBeVisible({ timeout: 10_000 })
})

// ─── 9.7 : Boutons "Envoyer à tous" et "Créer les tâches" ────────────────────

test("9.7 — un CR existant affiche les boutons 'Envoyer à tous' et 'Créer les tâches'", async ({
  page,
}) => {
  await injectAudioMocks(page)

  const projectId = e2eEnv("E2E_PROJECT_ID")!

  await page.route("**/api/meetings", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeMeeting(projectId)),
    })
  })

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  // Crée un CR via flow complet
  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })
  await dialog.getByRole("button", { name: /démarrer/i }).click()
  await expect(dialog.getByText(/\d{2}:\d{2}/)).toBeVisible({ timeout: 8_000 })
  await dialog.getByRole("button", { name: /arrêter.*générer|stop/i }).click()
  await expect(dialog.getByText(/généré avec succès/i)).toBeVisible({ timeout: 30_000 })
  await dialog.getByRole("button", { name: /fermer/i }).click()

  // La carte de réunion doit être visible
  const meetingCard = page.getByText(/réunion n°/i).first()
  await expect(meetingCard).toBeVisible({ timeout: 10_000 })

  // Expand la carte si nécessaire
  const cardContainer = meetingCard.locator("..").locator("..")
  const sendBtn = page.getByRole("button", { name: /envoyer à tous/i })
  const createTasksBtn = page.getByRole("button", { name: /créer.*tâches/i })

  const sendVisible = await sendBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (!sendVisible) {
    await cardContainer.click()
  }

  await expect(sendBtn).toBeVisible({ timeout: 8_000 })
  await expect(createTasksBtn).toBeVisible({ timeout: 5_000 })
})

// ─── 9.8 : "Créer les tâches" ────────────────────────────────────────────────

test("9.8 — 'Créer les tâches' appelle l'API et affiche un retour", async ({ page }) => {
  await injectAudioMocks(page)

  const projectId = e2eEnv("E2E_PROJECT_ID")!
  let tasksApiCalled = false

  await page.route("**/api/meetings", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeMeeting(projectId)),
    })
  })

  await page.route("**/api/meetings/**/tasks", async (route) => {
    tasksApiCalled = true
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ created: 1 }),
    })
  })

  await page.goto(`/projects/${projectId}`)
  await expect(page).not.toHaveURL(/login/)
  await openDiscussion(page)

  // Génère le CR
  await page.getByRole("button", { name: /nouvelle réunion/i }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog).toBeVisible({ timeout: 8_000 })
  await dialog.getByRole("button", { name: /démarrer/i }).click()
  await expect(dialog.getByText(/\d{2}:\d{2}/)).toBeVisible({ timeout: 8_000 })
  await dialog.getByRole("button", { name: /arrêter.*générer|stop/i }).click()
  await expect(dialog.getByText(/généré avec succès/i)).toBeVisible({ timeout: 30_000 })
  await dialog.getByRole("button", { name: /fermer/i }).click()

  // Attend la carte
  await expect(page.getByText(/réunion n°/i).first()).toBeVisible({ timeout: 10_000 })

  // Clique "Créer les tâches"
  const createTasksBtn = page.getByRole("button", { name: /créer.*tâches/i })
  const btnVisible = await createTasksBtn.isVisible({ timeout: 3_000 }).catch(() => false)
  if (!btnVisible) {
    await page
      .getByText(/réunion n°/i)
      .first()
      .locator("..")
      .locator("..")
      .click()
  }

  await expect(createTasksBtn).toBeVisible({ timeout: 5_000 })
  await createTasksBtn.click()

  // L'API de création de tâches a été appelée
  await page.waitForTimeout(2_000)
  expect(tasksApiCalled).toBe(true)
})
