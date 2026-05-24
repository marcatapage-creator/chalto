import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as notificationsModule from "@/lib/notifications"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/notifications")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))
vi.mock("@/lib/email", () => ({
  sendSituationSubmittedEmail: vi.fn().mockResolvedValue(undefined),
}))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(fields: Record<string, string>) {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v))
  return new Request("http://localhost/api/situations", { method: "POST", body: fd })
}

const VALID_FIELDS = {
  contributorToken: "tok-abc",
  projectId: uuid,
  lotLabel: "Gros œuvre",
  percentage: "75",
}

const CONTRIBUTOR = { id: "contrib-1", name: "Alice", contact_id: null, invite_expires_at: null }
const PROJECT = { id: uuid, name: "Rénovation", user_id: "user-1" }
const SITUATION = { id: uuid, project_id: uuid, lot_label: "Gros œuvre", percentage: 75 }

function makeChain(result: unknown, insertResult?: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ["select", "eq", "insert"]
  methods.forEach((m) => {
    chain[m] = () =>
      m === "insert" && insertResult !== undefined ? insertChain(insertResult) : chain
  })
  chain.single = () => Promise.resolve(result)
  chain.maybeSingle = () => Promise.resolve(result)
  return chain
}

function insertChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = () => chain
  chain.single = () => Promise.resolve(result)
  return chain
}

function makeAdmin(
  tables: Record<string, { selectResult?: unknown; insertResult?: unknown }>,
  storageError = false
) {
  return {
    from: (table: string) => {
      const t = tables[table] ?? {}
      return makeChain(t.selectResult ?? { data: null, error: null }, t.insertResult)
    },
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: storageError ? { message: "err" } : null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://example.com/file" } }),
      }),
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
})

describe("POST /api/situations", () => {
  it("retourne 429 si rate limit dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValueOnce(false)
    const res = await POST(req(VALID_FIELDS))
    expect(res.status).toBe(429)
  })

  it("retourne 400 si les paramètres sont invalides", async () => {
    const res = await POST(req({ ...VALID_FIELDS, percentage: "150" }))
    expect(res.status).toBe(400)
  })

  it("retourne 400 si lotLabel manque", async () => {
    const res = await POST(req({ ...VALID_FIELDS, lotLabel: "" }))
    expect(res.status).toBe(400)
  })

  it("retourne 403 si le token est invalide", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { selectResult: { data: null, error: null } },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_FIELDS))
    expect(res.status).toBe(403)
  })

  it("retourne 410 si le lien est expiré", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: {
          selectResult: {
            data: { ...CONTRIBUTOR, invite_expires_at: "2020-01-01T00:00:00Z" },
            error: null,
          },
        },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_FIELDS))
    expect(res.status).toBe(410)
  })

  it("retourne 201 avec la situation créée", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { selectResult: { data: CONTRIBUTOR, error: null } },
        projects: { selectResult: { data: PROJECT, error: null } },
        situations: { insertResult: { data: SITUATION, error: null } },
        profiles: { selectResult: { data: { full_name: "Jean", email: null }, error: null } },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_FIELDS))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.situation.lot_label).toBe("Gros œuvre")
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "situation_submitted" })
    )
  })

  it("retourne 500 si l'insertion échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        contributors: { selectResult: { data: CONTRIBUTOR, error: null } },
        projects: { selectResult: { data: PROJECT, error: null } },
        situations: { insertResult: { data: null, error: { message: "DB error" } } },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_FIELDS))
    expect(res.status).toBe(500)
  })
})
