/**
 * Tests des règles de gestion documentaire (RG)
 *
 * RG-L1 — Un doc approuvé ne peut pas être re-soumis au client (API → 409)
 * RG-L5 — Un prestataire non associé à un document ne peut pas le valider (API → 403)
 * RG-L6 — Un doc approuvé partagé aux prestataires est forcé en mode "transmission"
 *
 * Variables d'env requises :
 *   E2E_DOC_APPROVED_FOR_SEND_ID — UUID d'un doc approuvé (L1)
 *   E2E_INVITE_TOKEN             — token prestataire valide (L5)
 *   E2E_DOC_SENT_CLIENT_ID       — UUID d'un doc "sent" NON associé au prestataire (L5)
 *   E2E_PROJECT_ID               — UUID du projet de test (L6)
 *   E2E_DOC_APPROVED_FOR_SEND_ID — UUID du doc approuvé pour test UI L6
 */
import { test, expect, type Page } from "@playwright/test"
import { e2eEnv } from "./helpers/env"

test.use({ viewport: { width: 1440, height: 900 } })

async function gotoOrSkip(page: Page, url: string): Promise<boolean> {
  try {
    await page.goto(url)
    return true
  } catch (e: unknown) {
    const msg = String(e)
    if (msg.includes("ERR_CONNECTION_REFUSED") || msg.includes("ERR_ABORTED")) {
      test.skip(true, "Serveur temporairement indisponible")
      return false
    }
    throw e
  }
}

// ─── RG-L1 : Re-soumission d'un doc approuvé → 409 ───────────────────────────

test("RG-L1 — API retourne 409 si le doc est déjà approuvé (send-validation)", async ({ page }) => {
  const docId = e2eEnv("E2E_DOC_APPROVED_FOR_SEND_ID")
  if (!docId) {
    test.skip(true, "E2E_DOC_APPROVED_FOR_SEND_ID non défini")
    return
  }
  const res = await page.request.post("/api/send-validation", {
    data: { documentId: docId },
  })
  expect(res.status()).toBe(409)
  const body = await res.json()
  expect(body.error).toMatch(/approuvé/i)
})

// ─── RG-L5 : Prestataire non associé au document → 403 ───────────────────────

test("RG-L5 — API retourne 403 si le prestataire n'est pas associé au document", async ({
  page,
}) => {
  const contributorToken = e2eEnv("E2E_INVITE_TOKEN")
  const documentId = e2eEnv("E2E_DOC_SENT_CLIENT_ID")
  if (!contributorToken || !documentId) {
    test.skip(true, "E2E_INVITE_TOKEN ou E2E_DOC_SENT_CLIENT_ID non défini")
    return
  }
  const res = await page.request.post("/api/validate-contributor", {
    data: {
      documentId,
      contributorToken,
      status: "approved",
      contributorName: "Prestataire Test E2E",
    },
  })
  // Le doc client n'est pas dans document_contributors pour ce prestataire
  expect(res.status()).toBe(403)
})

// ─── RG-L6 : Doc approuvé → seule l'option "transmission" disponible ─────────

test("RG-L6 — UI : doc approuvé en chantier → sélecteur requestType figé sur 'Pour information'", async ({
  page,
}) => {
  if (!(await gotoOrSkip(page, `/projects/${e2eEnv("E2E_PROJECT_ID")}`))) return
  await expect(page).not.toHaveURL(/login/)

  // Cherche le doc approuvé seedé
  const docItem = page.getByText(/approuvé v2.*test envoi presta/i).first()
  const hasDoc = await docItem.isVisible({ timeout: 10_000 }).catch(() => false)
  if (!hasDoc) {
    test.skip(true, "Document approuvé v2 de test non trouvé — seed manquant")
    return
  }

  await docItem.click()

  const shareBtn = page.getByRole("button", { name: /partager/i }).first()
  const hasShareBtn = await shareBtn.isVisible({ timeout: 5_000 }).catch(() => false)
  if (!hasShareBtn) {
    test.skip(true, "Bouton 'Partager' introuvable — doc déjà envoyé")
    return
  }
  await shareBtn.click()

  // Le formulaire doit afficher uniquement "Pour information" (transmission forcée)
  await expect(page.getByText(/pour information/i).first()).toBeVisible({ timeout: 5_000 })

  // "Pour validation" ne doit pas être disponible pour un doc approuvé
  const validationOption = page.getByRole("radio", { name: /pour validation/i })
  const hasValidation = await validationOption.isVisible({ timeout: 2_000 }).catch(() => false)
  expect(
    hasValidation,
    "L'option 'Pour validation' ne doit pas apparaître pour un doc approuvé"
  ).toBe(false)
})
