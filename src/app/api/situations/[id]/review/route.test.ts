import { describe, it, expect, vi, beforeEach } from "vitest"
import { PATCH } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))
vi.mock("@/lib/email", () => ({
  sendSituationReviewedEmail: vi.fn().mockResolvedValue(undefined),
}))

const uuid = "123e4567-e89b-12d3-a456-426614174000"
const params = Promise.resolve({ id: uuid })

const SITUATION = {
  id: uuid,
  project_id: "proj-1",
  contributor_id: "contrib-1",
  lot_label: "Gros œuvre",
  percentage: 75,
  status: "en_attente",
}
const PROJECT = { id: "proj-1", name: "Rénovation", user_id: "user-1" }
const CONTRIBUTOR = { id: "contrib-1", name: "Alice", contact_id: null, invite_token: "tok" }

function req(body: unknown) {
  return new Request(`http://localhost/api/situations/${uuid}/review`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function makeChain(results: unknown[]) {
  let callCount = 0
  const chain: Record<string, unknown> = {}
  chain.select = () => chain
  chain.eq = () => chain
  chain.update = () => chain
  chain.single = () => Promise.resolve(results[callCount++] ?? { data: null, error: null })
  return chain
}

function makeAdminClient(tableResults: Record<string, unknown[]>) {
  const calls: Record<string, number> = {}
  return {
    from: (table: string) => {
      calls[table] = (calls[table] ?? 0) + 1
      const results = tableResults[table] ?? [{ data: null, error: null }]
      const idx = (calls[table] ?? 1) - 1
      return makeChain(results.slice(idx))
    },
  }
}

function makeServerClient(user: unknown) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) } }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("PATCH /api/situations/[id]/review", () => {
  it("retourne 429 si rate limit dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValueOnce(false)
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(429)
  })

  it("retourne 400 si action invalide", async () => {
    const res = await PATCH(req({ action: "unknown" }), { params })
    expect(res.status).toBe(400)
  })

  it("retourne 400 si refus sans motif", async () => {
    const res = await PATCH(req({ action: "refuse" }), { params })
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(401)
  })

  it("retourne 404 si situation introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        situations: [{ data: null, error: null }],
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(404)
  })

  it("retourne 403 si le projet n'appartient pas à l'user", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        situations: [{ data: SITUATION, error: null }],
        projects: [{ data: null, error: null }],
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(403)
  })

  it("retourne 409 si la situation n'est pas révisable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        situations: [{ data: { ...SITUATION, status: "validee" }, error: null }],
        projects: [{ data: PROJECT, error: null }],
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(409)
  })

  it("retourne 200 après validation", async () => {
    const updated = { ...SITUATION, status: "validee" }
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        situations: [
          { data: SITUATION, error: null },
          { data: updated, error: null },
        ],
        projects: [{ data: PROJECT, error: null }],
        contributors: [{ data: CONTRIBUTOR, error: null }],
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.situation.status).toBe("validee")
  })

  it("crée une notification quand le prestataire a un contact_id", async () => {
    const updated = { ...SITUATION, status: "validee" }
    const contributorWithContact = { ...CONTRIBUTOR, contact_id: "contact-1" }
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        situations: [
          { data: SITUATION, error: null },
          { data: updated, error: null },
        ],
        projects: [{ data: PROJECT, error: null }],
        contributors: [{ data: contributorWithContact, error: null }],
        contacts: [{ data: { email: null }, error: null }],
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await PATCH(req({ action: "validate" }), { params })
    expect(res.status).toBe(200)
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "situation_reviewed" })
    )
  })
})
