/**
 * RECETTE 9.3 — Navigation rapide entre projets sans erreur Realtime
 * Requiert : E2E_USER_EMAIL + E2E_USER_PASSWORD (connexion via global-setup)
 */
import { test, expect } from "@playwright/test"

test.beforeEach(({}, testInfo) => {
  if (!process.env.E2E_USER_EMAIL) testInfo.skip(true, "E2E_USER_EMAIL non défini")
})

test("9.3 — navigation rapide entre projets, pas d'erreur Realtime", async ({ page }) => {
  const realtimeErrors: string[] = []

  page.on("console", (msg) => {
    if (msg.type() === "error" && msg.text().includes("postgres_changes")) {
      realtimeErrors.push(msg.text())
    }
  })

  await page.goto("/dashboard")
  await expect(page).toHaveURL(/dashboard/)

  // Trouver et visiter le premier projet disponible (liens vers /projects/<uuid>)
  const projectLinks = page.locator('a[href^="/projects/"]').filter({
    hasNot: page.locator('[href="/projects"]'),
  })
  const count = await projectLinks.count()

  if (count === 0) {
    test.skip(true, "Aucun projet disponible sur ce compte de test")
    return
  }

  const href = await projectLinks.first().getAttribute("href")
  if (!href) return

  // Navigation 1 : dashboard → projet
  await page.goto(href)
  await expect(page).toHaveURL(/projects\//)
  await page.waitForTimeout(800) // laisser Realtime s'abonner

  // Navigation 2 : projet → dashboard
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/dashboard/)

  // Navigation 3 : dashboard → même projet (déclenche le bug si present)
  await page.goto(href)
  await expect(page).toHaveURL(/projects\//)
  await page.waitForTimeout(800)

  expect(realtimeErrors, "Erreurs Realtime détectées lors de la navigation").toHaveLength(0)
})

test("9.3 — le dashboard s'affiche pour un utilisateur connecté", async ({ page }) => {
  if (!process.env.E2E_USER_EMAIL) {
    test.skip(true, "E2E_USER_EMAIL non défini")
    return
  }
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/dashboard/)
  await expect(page.getByRole("heading").first()).toBeVisible()
})
