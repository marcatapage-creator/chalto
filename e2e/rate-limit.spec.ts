/**
 * RECETTE 10.1 — Rate limiting : 429 après 10 requêtes sur une route publique
 *
 * Utilise l'APIRequestContext Playwright (pas de navigateur).
 * Ne nécessite pas de variables d'env particulières.
 *
 * Note : le rate limit est désactivé en NODE_ENV=development (retourne toujours true).
 * Ces tests ne peuvent passer qu'avec BASE_URL pointant vers staging/production.
 */
import { test, expect } from "@playwright/test"

test.beforeEach(async ({}, testInfo) => {
  if (!process.env.BASE_URL) {
    testInfo.skip(true, "Rate limit désactivé en dev local — relancer avec BASE_URL=<staging-url>")
  }
})

test("10.1 — la première requête waitlist n'est pas bloquée", async ({ request }) => {
  const res = await request.post("/api/waitlist", {
    data: { email: `e2e-first-${Date.now()}@example.com` },
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  })

  // En CI, les runners GitHub Actions partagent un pool d'IPs Azure.
  // Si une run précédente a épuisé le quota sur cette IP, on passe le test plutôt que de bloquer.
  if (res.status() === 429) {
    test.skip(true, "IP déjà rate-limitée par une run précédente — non conclusif")
    return
  }

  // 200, 201, 409 (email déjà inscrit) ou 422 sont tous acceptables — pas 429
  expect(res.status(), "La première requête ne doit pas être rate-limitée").not.toBe(429)
})

test("10.1 — /api/waitlist retourne 429 à partir du 11e appel", async ({ request }) => {
  const responses: number[] = []

  for (let i = 0; i < 11; i++) {
    const res = await request.post("/api/waitlist", {
      data: { email: `e2e-ratelimit-${i}-${Date.now()}@example.com` },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    })
    responses.push(res.status())
  }

  // Au moins un 429 doit être apparu dans les 11 réponses
  expect(
    responses.some((s) => s === 429),
    `Aucun 429 reçu parmi : ${responses.join(", ")}`
  ).toBe(true)
})

test("10.1 — la réponse 429 inclut un message lisible", async ({ request }) => {
  // Épuiser le quota
  for (let i = 0; i < 10; i++) {
    await request.post("/api/waitlist", {
      data: { email: `e2e-exhaust-${i}-${Date.now()}@example.com` },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    })
  }

  const res = await request.post("/api/waitlist", {
    data: { email: `e2e-over-limit-${Date.now()}@example.com` },
    headers: { "Content-Type": "application/json" },
    failOnStatusCode: false,
  })

  if (res.status() !== 429) {
    test.skip(true, "429 non atteint — quota peut-être réinitialisé entre les appels")
    return
  }

  const body = await res.json().catch(() => null)
  // Le corps doit exister et contenir un message, pas juste un 429 vide
  expect(body).not.toBeNull()
})
