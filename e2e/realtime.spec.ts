/**
 * RECETTE 9.1 — Validation client déclenche une mise à jour Realtime sur la fiche pro
 * RECETTE 9.2 — Mise à jour tâche prestataire reflétée en Realtime côté pro
 *
 * Ces tests ouvrent DEUX contextes browser simultanément pour simuler deux utilisateurs.
 *   - Contexte pro  : authentifié via storageState (e2e/.auth/user.json)
 *   - Contexte tiers : public (client ou prestataire, aucun cookie d'auth)
 *
 * Variables d'env requises :
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — compte pro (global-setup)
 *   E2E_PROJECT_ID                     — UUID du projet ouvert côté pro
 *   E2E_VALIDATION_TOKEN               — validation_token d'un doc en statut "sent"
 *   E2E_INVITE_TOKEN                   — invite_token avec une tâche assignée
 *
 * Attention : E2E_VALIDATION_TOKEN est consommé par ce test (statut → approved).
 * Prévoir un doc dédié aux tests E2E ou réinitialiser le statut après chaque run.
 */
import { test, expect } from "@playwright/test"
import fs from "fs"
import path from "path"

// Lit seed.json si disponible — les process.env du globalSetup ne se propagent pas
// aux workers Playwright. seed.json est écrit sur le filesystem et accessible à tous.
function readSeed(): Record<string, string> {
  try {
    const p = path.join(__dirname, ".auth/seed.json")
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"))
  } catch {}
  return {}
}
const seed = readSeed()

function env(key: string): string | undefined {
  return process.env[key] || seed[key] || undefined
}

// ─── 9.1 : Validation client → update Realtime pro ───────────────────────────

test("9.1 — approbation client met à jour le statut du document sans rechargement côté pro", async ({
  browser,
}) => {
  const token = env("E2E_VALIDATION_TOKEN_REALTIME") ?? env("E2E_VALIDATION_TOKEN")
  const projectId = env("E2E_PROJECT_ID")
  if (!token || !projectId || !env("E2E_USER_EMAIL")) {
    test.skip(
      true,
      "Variables manquantes : E2E_VALIDATION_TOKEN_REALTIME, E2E_PROJECT_ID ou E2E_USER_EMAIL"
    )
    return
  }

  // Contexte pro — authentifié
  const proCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" })
  // Contexte client — public, pas d'auth
  const clientCtx = await browser.newContext()

  try {
    const proPage = await proCtx.newPage()
    const clientPage = await clientCtx.newPage()

    // Le pro ouvre la fiche projet et laisse Realtime s'abonner
    await proPage.goto(`/projects/${projectId}`)
    await expect(proPage).not.toHaveURL(/login/)
    await proPage.waitForTimeout(2_000)

    // Le client approuve le document
    await clientPage.goto(`/validate/${token}`)
    await clientPage.getByRole("button", { name: /approuver/i }).click()
    await expect(clientPage.getByText(/approuvé|merci|confirmé/i)).toBeVisible({
      timeout: 10_000,
    })

    // Le pro voit le statut "approuvé" apparaître SANS recharger la page
    await expect(proPage.getByText(/approuvé/i).first()).toBeVisible({ timeout: 20_000 })
  } finally {
    await proCtx.close()
    await clientCtx.close()
  }
})

test("9.1 — refus client avec commentaire met à jour le statut Realtime côté pro", async ({
  browser,
}) => {
  test.setTimeout(60_000)
  const token = env("E2E_VALIDATION_TOKEN_REALTIME_REFUSE") ?? env("E2E_VALIDATION_TOKEN")
  const projectId = env("E2E_PROJECT_ID")
  if (!token || !projectId || !env("E2E_USER_EMAIL")) {
    test.skip(true, "Variables manquantes pour le test Realtime refus")
    return
  }

  const proCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" })
  const clientCtx = await browser.newContext()

  try {
    const proPage = await proCtx.newPage()
    const clientPage = await clientCtx.newPage()

    await proPage.goto(`/projects/${projectId}`)
    await expect(proPage).not.toHaveURL(/login/)
    await proPage.waitForTimeout(2_000)

    await clientPage.goto(`/validate/${token}`)
    // Remplir le commentaire AVANT de cliquer Refuser (le bouton appelle l'API directement)
    const textarea = clientPage.getByRole("textbox").first()
    if (await textarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await textarea.fill("Modifications requises — test E2E Realtime")
    }
    await clientPage.getByRole("button", { name: /refuser/i }).click()
    await expect(clientPage.getByText(/refusé|pris en compte/i)).toBeVisible({ timeout: 10_000 })

    // Le pro voit le statut "refusé" sans rechargement
    await expect(proPage.getByText(/refusé/i).first()).toBeVisible({ timeout: 20_000 })
  } finally {
    await proCtx.close()
    await clientCtx.close()
  }
})

// ─── 9.2 : Prestataire update tâche → Realtime pro ───────────────────────────

test("9.2 — mise à jour tâche prestataire reflétée en temps réel sur la fiche pro", async ({
  browser,
}) => {
  const inviteToken = env("E2E_INVITE_TOKEN")
  const projectId = env("E2E_PROJECT_ID")
  if (!inviteToken || !projectId || !env("E2E_USER_EMAIL")) {
    test.skip(true, "Variables manquantes : E2E_INVITE_TOKEN, E2E_PROJECT_ID ou E2E_USER_EMAIL")
    return
  }

  const proCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" })
  const contractorCtx = await browser.newContext()

  try {
    const proPage = await proCtx.newPage()
    const contractorPage = await contractorCtx.newPage()

    // Le pro ouvre la fiche projet
    await proPage.goto(`/projects/${projectId}`)
    await expect(proPage).not.toHaveURL(/login/)
    await proPage.waitForTimeout(2_000)

    // Le prestataire marque une tâche comme terminée
    await contractorPage.goto(`/invite/${inviteToken}`)
    const taskBtn = contractorPage
      .getByRole("button", { name: /terminé|fait|marquer comme terminé/i })
      .first()

    const hasTask = await taskBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasTask) {
      test.skip(true, "Aucune tâche disponible dans l'espace prestataire")
      return
    }

    await taskBtn.click()
    await expect(contractorPage.getByText(/mis à jour|terminé|sauvegardé/i)).toBeVisible({
      timeout: 10_000,
    })

    // Le pro voit la tâche passer dans la colonne "terminé" sans rechargement
    await expect(proPage.getByText(/terminé|done/i).first()).toBeVisible({ timeout: 20_000 })
  } finally {
    await proCtx.close()
    await contractorCtx.close()
  }
})

// ─── Erreurs console Realtime ─────────────────────────────────────────────────

test("9.1 — aucune erreur console postgres_changes lors de la validation client", async ({
  browser,
}) => {
  const token = env("E2E_VALIDATION_TOKEN_REALTIME_CONSOLE") ?? env("E2E_VALIDATION_TOKEN")
  const projectId = env("E2E_PROJECT_ID")
  if (!token || !projectId || !env("E2E_USER_EMAIL")) {
    test.skip(true, "Variables manquantes pour la vérification console Realtime")
    return
  }

  const realtimeErrors: string[] = []
  const proCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" })
  const clientCtx = await browser.newContext()

  try {
    const proPage = await proCtx.newPage()
    const clientPage = await clientCtx.newPage()

    proPage.on("console", (msg) => {
      if (msg.type() === "error" && msg.text().includes("postgres_changes")) {
        realtimeErrors.push(msg.text())
      }
    })

    await proPage.goto(`/projects/${projectId}`)
    await proPage.waitForTimeout(2_000)

    await clientPage.goto(`/validate/${token}`)
    await clientPage.getByRole("button", { name: /approuver/i }).click()

    await proPage.waitForTimeout(5_000)

    expect(realtimeErrors, "Erreurs Realtime détectées côté pro").toHaveLength(0)
  } finally {
    await proCtx.close()
    await clientCtx.close()
  }
})
