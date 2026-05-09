/**
 * Correctifs panneau document
 *
 * 1. Wording "Commenté par" — affiche le nom du client (pas "le prestataire")
 *    quand contributor_id = null (validation client).
 *
 * 2. Version Realtime : le client lit une transmission → le pro voit
 *    "Commenté par [client]" sans "le prestataire" dans le banner.
 *
 * Variables d'env requises :
 *   E2E_PROJECT_ID                          — UUID du projet de test
 *   E2E_VALIDATION_TOKEN_TRANSMISSION_CLIENT — token d'un doc transmission audience=client
 */
import { test, expect } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

// Viewport desktop pour que le panneau latéral soit visible
test.use({ viewport: { width: 1440, height: 900 } })

test.beforeEach(({}, testInfo) => {
  if (!e2eEnv("E2E_PROJECT_ID")) {
    testInfo.skip(true, "E2E_PROJECT_ID non défini")
  }
})

// ─── Wording statique (doc déjà commenté par le client, seedé en DB) ─────────

test("wording — panneau affiche le nom du client, pas 'le prestataire', sur un doc commenté par le client", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText(/client commenté/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasDoc) {
    test.skip(true, "Document 'client commenté' non trouvé — seed manquant ou non visible")
    return
  }

  await docItem.click()

  // Le banner "Commenté par" doit être visible
  await expect(page.getByText(/Commenté par/i).first()).toBeVisible({ timeout: 8_000 })

  // "le prestataire" ne doit pas apparaître dans le banner
  const prestText = page.getByText(/Commenté par le prestataire/i)
  const hasPrest = await prestText.isVisible({ timeout: 2_000 }).catch(() => false)
  expect(
    hasPrest,
    "'Commenté par le prestataire' ne doit pas apparaître pour une validation client"
  ).toBe(false)
})

test("wording — panneau affiche 'Client Test E2E' (nom du client) sur un doc commenté par le client", async ({
  page,
}) => {
  await page.goto(`/projects/${e2eEnv("E2E_PROJECT_ID")}`)
  await expect(page).not.toHaveURL(/login/)

  const docItem = page.getByText(/client commenté/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasDoc) {
    test.skip(true, "Document 'client commenté' non trouvé — seed manquant ou non visible")
    return
  }

  await docItem.click()

  // Le nom du client doit apparaître dans le banner
  await expect(page.getByText(/Client Test E2E/i).first()).toBeVisible({ timeout: 8_000 })
})

// ─── Wording Realtime (dual context) ─────────────────────────────────────────

test("wording — client lit une transmission → le pro voit 'Commenté par [client]', pas 'le prestataire'", async ({
  browser,
}) => {
  test.setTimeout(60_000)
  const token = e2eEnv("E2E_VALIDATION_TOKEN_TRANSMISSION_CLIENT")
  const projectId = e2eEnv("E2E_PROJECT_ID")
  if (!token || !projectId || !e2eEnv("E2E_USER_EMAIL")) {
    test.skip(
      true,
      "Variables manquantes : E2E_VALIDATION_TOKEN_TRANSMISSION_CLIENT ou E2E_PROJECT_ID"
    )
    return
  }

  const proCtx = await browser.newContext({
    storageState: "e2e/.auth/user.json",
    viewport: { width: 1440, height: 900 },
  })
  const clientCtx = await browser.newContext()

  try {
    const proPage = await proCtx.newPage()
    const clientPage = await clientCtx.newPage()

    // Le pro ouvre la fiche projet et laisse Realtime s'abonner
    await proPage.goto(`/projects/${projectId}`)
    await expect(proPage).not.toHaveURL(/login/)
    await proPage.waitForTimeout(2_000)

    // Le client lit le document "pour information"
    await clientPage.goto(`/validate/${token}`)
    const readBtn = clientPage
      .getByRole("button", { name: /j'ai bien reçu|reçu ce document|j'ai vu/i })
      .first()
    const hasBtn = await readBtn.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!hasBtn) {
      test.skip(true, "Bouton de lecture non disponible (document déjà lu ou mauvais request_type)")
      return
    }
    await readBtn.click()
    await expect(clientPage.getByText(/reçu|confirmé|enregistré|pris en compte/i)).toBeVisible({
      timeout: 10_000,
    })

    // Le pro voit "Commenté par" apparaître (Realtime ou rechargement automatique)
    await expect(proPage.getByText(/Commenté par/i).first()).toBeVisible({ timeout: 20_000 })

    // "le prestataire" ne doit pas apparaître
    const prestBanner = proPage.getByText(/Commenté par le prestataire/i)
    const hasPrest = await prestBanner.isVisible({ timeout: 1_000 }).catch(() => false)
    expect(
      hasPrest,
      "'Commenté par le prestataire' ne doit pas apparaître pour une validation client"
    ).toBe(false)
  } finally {
    await proCtx.close()
    await clientCtx.close()
  }
})
