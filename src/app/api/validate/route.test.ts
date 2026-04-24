import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as adminModule from "@/lib/supabase/admin"
import * as emailModule from "@/lib/email"
import * as notificationsModule from "@/lib/notifications"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/email")
vi.mock("@/lib/notifications")
vi.mock("@/lib/rate-limit")

function req(body: unknown) {
  return new Request("http://localhost/api/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(
  selectResult: unknown,
  updateResult: unknown = { error: null },
  insertResult: unknown = { data: null, error: null }
) {
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "update" ? updateResult : mode === "insert" ? insertResult : selectResult
    return {
      select: () => chain(mode),
      eq: () => chain(mode),
      order: () => chain(mode),
      update: () => chain("update"),
      insert: () => chain("insert"),
      single: () => Promise.resolve(value),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(value).then(f, r),
    }
  }
  return chain("select")
}

function makeAdmin(
  tables: Record<
    string,
    { data?: unknown; error?: unknown; updateError?: unknown; insertError?: unknown }
  >
) {
  return {
    from: (table: string) => {
      const t = tables[table] ?? {}
      return tableChain(
        { data: t.data ?? null, error: t.error ?? null },
        { error: t.updateError ?? null },
        { data: null, error: t.insertError ?? null }
      )
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

const DOC = {
  id: "doc-1",
  project_id: "proj-1",
  name: "Devis principal",
  status: "pending",
  projects: {
    name: "Rénovation",
    user_id: "user-1",
    client_name: "Dupont",
    client_email: "client@example.com",
  },
}

const PRO = {
  email: "pro@example.com",
  full_name: "Jean Pro",
  notif_inapp_enabled: true,
  notif_email_approved: true,
  notif_email_rejected: true,
  notif_email_frequency: "instant",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
  vi.mocked(emailModule.sendApprovalEmail).mockResolvedValue(undefined as never)
})

describe("POST /api/validate", () => {
  it("retourne 429 si limite dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(false)
    const res = await POST(req({ token: "tok", status: "approved" }))
    expect(res.status).toBe(429)
  })

  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(req({ token: "", status: "approved" }))
    expect(res.status).toBe(400)
  })

  it("retourne 400 si statut inconnu", async () => {
    const res = await POST(req({ token: "tok", status: "pending" }))
    expect(res.status).toBe(400)
  })

  it("retourne 404 si le token est inconnu", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ documents: { data: null } })
    )
    const res = await POST(req({ token: "invalid", status: "approved" }))
    expect(res.status).toBe(404)
  })

  it("retourne 200 et déclenche notification + email lors d'une approbation", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: PRO },
      })
    )
    const res = await POST(req({ token: "tok", status: "approved" }))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "document_approved" })
    )
    expect(emailModule.sendApprovalEmail).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved", proEmail: "pro@example.com" })
    )
  })

  it("n'envoie pas l'email si notif_email_frequency est 'never'", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: { ...PRO, notif_email_frequency: "never" } },
      })
    )
    await POST(req({ token: "tok", status: "approved" }))
    expect(emailModule.sendApprovalEmail).not.toHaveBeenCalled()
  })

  it("retourne 200 et crée une notification de refus", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: PRO },
      })
    )
    await POST(req({ token: "tok", status: "rejected", comment: "Non conforme" }))
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "document_rejected" })
    )
  })

  it("retourne 500 si l'insertion en base échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: { insertError: { message: "DB error" } },
        profiles: { data: PRO },
      })
    )
    const res = await POST(req({ token: "tok", status: "approved" }))
    expect(res.status).toBe(500)
  })
})
