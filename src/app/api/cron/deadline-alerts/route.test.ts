import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")
vi.mock("@/lib/email", () => ({ sendDeadlineAlertEmail: vi.fn().mockResolvedValue(undefined) }))

function req(secret?: string) {
  const headers: Record<string, string> = {}
  if (secret) headers["Authorization"] = `Bearer ${secret}`
  return new Request("http://localhost/api/cron/deadline-alerts", { headers })
}

function makeAdmin(dossiers: unknown[] | null, dbError = false) {
  const queryChain: Record<string, unknown> = {}
  queryChain.select = () => queryChain
  queryChain.not = () => queryChain
  queryChain.update = () => queryChain
  queryChain.eq = () => queryChain
  queryChain.then = (f?: ((v: unknown) => unknown) | null) =>
    Promise.resolve({ data: dossiers, error: dbError ? { message: "err" } : null }).then(f)

  return { from: () => queryChain }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
  delete process.env.CRON_SECRET
})

describe("GET /api/cron/deadline-alerts", () => {
  it("retourne 401 si CRON_SECRET invalide", async () => {
    process.env.CRON_SECRET = "secret123"
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin([]) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await GET(req("mauvais-secret"))
    expect(res.status).toBe(401)
  })

  it("passe sans Authorization si CRON_SECRET absent", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin([]) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await GET(req())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.alertsSent).toBe(0)
  })

  it("retourne 500 si erreur DB", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin(null, true) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await GET(req())
    expect(res.status).toBe(500)
  })

  it("envoie une alerte pour un dossier à J-7 non notifié", async () => {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 6)
    const dossier = {
      id: "dos-1",
      user_id: "user-1",
      type: "permis_construire",
      label: null,
      deadline: deadline.toISOString().split("T")[0],
      notified_thresholds: [],
      project: { id: "proj-1", name: "Rénovation" },
      profile: { email: "arc@example.com", full_name: "Jean" },
    }
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin([dossier]) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await GET(req())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.alertsSent).toBeGreaterThan(0)
  })

  it("ne renvoie pas d'alerte pour un seuil déjà notifié", async () => {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 6)
    const dossier = {
      id: "dos-1",
      user_id: "user-1",
      type: "permis_construire",
      label: null,
      deadline: deadline.toISOString().split("T")[0],
      notified_thresholds: [7, 15, 30],
      project: { id: "proj-1", name: "Rénovation" },
      profile: { email: "arc@example.com", full_name: "Jean" },
    }
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin([dossier]) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await GET(req())
    const body = await res.json()
    expect(body.alertsSent).toBe(0)
  })
})
