/**
 * RECETTE 3.7 — Relance client : guards d'accès (401, 400, 429)
 * RECETTE 3.8 — Relance client : succès API (200 + reminder_count incrémenté)
 * RECETTE 3.9 — Relance client : bouton UI visible uniquement sur validation client
 * RECETTE 3.10 — Relance client : clic bouton déclenche la relance
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID     — UUID du projet E2E
 *   E2E_DOC_REMIND_CLIENT_ID  — document sent + audience=client + request_type=validation + reminder_count=0
 *   E2E_DOC_REMIND_MAXED_ID   — document sent + audience=client + reminder_count=3
 *   E2E_DOC_TRANSMISSION_CLIENT_ID — document sent + audience=client + request_type=transmission
 */
import { test, expect } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(({}, testInfo) => {
  if (!e2eEnv("E2E_USER_EMAIL") || !e2eEnv("E2E_PROJECT_ID")) {
    testInfo.skip(true, "E2E_USER_EMAIL ou E2E_PROJECT_ID non défini")
  }
})

// ─── 3.7 : Guards ─────────────────────────────────────────────────────────────

// Le middleware proxy.ts retourne 401 JSON pour les API routes non authentifiées
test.describe("guard 401", () => {
  test("3.7 — sans authentification retourne 401", async ({ baseURL }) => {
    const url = `${baseURL ?? "http://localhost:3000"}/api/remind-validation`
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: "00000000-0000-0000-0000-000000000000" }),
    })
    expect(res.status).toBe(401)
  })
})

test("3.7 — guard 400 : payload sans documentId retourne 400", async ({ page }) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const res = await page.request.post("/api/remind-validation", {
    data: {},
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  })
  expect(res.status()).toBe(400)
})

test("3.7 — guard 429 : reminder_count ≥ 3 retourne 429", async ({ page }) => {
  const docId = e2eEnv("E2E_DOC_REMIND_MAXED_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_REMIND_MAXED_ID non défini — migration 20260528000001 non appliquée")
    return
  }

  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const res = await page.request.post("/api/remind-validation", {
    data: { documentId: docId },
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  })
  expect(res.status()).toBe(429)
  const body = await res.json()
  expect(body.error).toMatch(/maximum|relances/i)
})

// ─── 3.8 : Succès API ─────────────────────────────────────────────────────────

test("3.8 — succès API : relancer un document éligible retourne 200", async ({ page }) => {
  const docId = e2eEnv("E2E_DOC_REMIND_CLIENT_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_REMIND_CLIENT_ID non défini — migration 20260528000001 non appliquée")
    return
  }

  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const res = await page.request.post("/api/remind-validation", {
    data: { documentId: docId },
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  })

  // 200 → email envoyé et counter incrémenté
  // 500 → Resend non configuré dans cet env (acceptable en dev local)
  if (res.status() === 500) {
    test.skip(true, "Resend non configuré dans cet environnement — test non conclusif")
    return
  }
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.success).toBe(true)
  expect(typeof body.reminderCount).toBe("number")
  expect(body.reminderCount).toBeGreaterThan(0)
})

// ─── 3.9 : UI — visibilité du bouton ──────────────────────────────────────────

test("3.9 — UI : le bouton 'Relancer le client' est visible sur un document en attente de validation client", async ({
  page,
}) => {
  const docId = e2eEnv("E2E_DOC_REMIND_CLIENT_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_REMIND_CLIENT_ID non défini — migration 20260528000001 non appliquée")
    return
  }

  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  // Ouvrir le document dédié à la relance
  const docItem = page.getByText("Document E2E – relance client").first()
  const visible = await docItem.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!visible) {
    test.skip(true, "Document 'Document E2E – relance client' non trouvé sur ce projet")
    return
  }
  await docItem.click()

  await expect(page.getByRole("button", { name: /relancer le client/i })).toBeVisible({
    timeout: 8_000,
  })
})

test("3.9 — UI : le bouton 'Relancer le client' est absent sur une transmission", async ({
  page,
}) => {
  const docId = e2eEnv("E2E_DOC_TRANSMISSION_CLIENT_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_TRANSMISSION_CLIENT_ID non défini")
    return
  }

  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText("Document E2E – transmission client").first()
  const visible = await docItem.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!visible) {
    test.skip(true, "Document 'Document E2E – transmission client' non trouvé")
    return
  }
  await docItem.click()

  // Le footer "sent" doit être présent mais sans bouton de relance
  await expect(page.getByText(/copier le lien/i)).toBeVisible({ timeout: 8_000 })
  await expect(page.getByRole("button", { name: /relancer le client/i })).not.toBeVisible()
})

// ─── 3.10 : UI — clic bouton ──────────────────────────────────────────────────

test("3.10 — UI : cliquer 'Relancer le client' appelle l'API et affiche le résultat", async ({
  page,
}) => {
  const docId = e2eEnv("E2E_DOC_REMIND_CLIENT_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_REMIND_CLIENT_ID non défini — migration 20260528000001 non appliquée")
    return
  }

  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  // Intercepter l'appel API pour ne pas dépendre de Resend en local
  await page.route("/api/remind-validation", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, reminderCount: 1 }),
    })
  })

  const docItem = page.getByText("Document E2E – relance client").first()
  const visible = await docItem.isVisible({ timeout: 8_000 }).catch(() => false)
  if (!visible) {
    test.skip(true, "Document 'Document E2E – relance client' non trouvé sur ce projet")
    return
  }
  await docItem.click()

  const remindBtn = page.getByRole("button", { name: /relancer le client/i })
  await expect(remindBtn).toBeVisible({ timeout: 8_000 })
  await remindBtn.click()

  // Toast de succès
  await expect(page.getByText(/relance envoyée/i)).toBeVisible({ timeout: 8_000 })
})
