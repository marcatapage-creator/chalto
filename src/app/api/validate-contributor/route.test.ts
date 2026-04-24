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
  return new Request("http://localhost/api/validate-contributor", {
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
  projects: { name: "Rénovation", user_id: "user-1" },
}

const PRO = {
  email: "pro@example.com",
  full_name: "Jean Pro",
  notif_inapp_enabled: true,
  notif_email_approved: true,
  notif_email_rejected: true,
  notif_email_frequency: "instant",
}

const uuid = "123e4567-e89b-12d3-a456-426614174000"
const CONTRIB_NAME = "Alice Prestataire"

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(notificationsModule.createNotification).mockResolvedValue(undefined)
  vi.mocked(emailModule.sendApprovalEmail).mockResolvedValue(undefined as never)
  vi.mocked(emailModule.sendTransmissionAckEmail).mockResolvedValue(undefined as never)
})

describe("POST /api/validate-contributor", () => {
  it("retourne 429 si limite dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(false)
    const res = await POST(
      req({ documentId: uuid, status: "approved", contributorName: CONTRIB_NAME })
    )
    expect(res.status).toBe(429)
  })

  it("retourne 400 si le corps est invalide", async () => {
    const res = await POST(req({ documentId: uuid, status: "approved", contributorName: "" }))
    expect(res.status).toBe(400)
  })

  it("retourne 404 si le document est introuvable", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ documents: { data: null } })
    )
    const res = await POST(
      req({ documentId: uuid, status: "approved", contributorName: CONTRIB_NAME })
    )
    expect(res.status).toBe(404)
  })

  it("flux transmission — retourne 200 et envoie l'email de transmission", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: PRO },
      })
    )
    const res = await POST(
      req({
        documentId: uuid,
        status: "commented",
        contributorName: CONTRIB_NAME,
        requestType: "transmission",
        comment: "RAS",
      })
    )
    expect(res.status).toBe(200)
    expect(emailModule.sendTransmissionAckEmail).toHaveBeenCalledWith(
      expect.objectContaining({ contributorName: CONTRIB_NAME, proEmail: "pro@example.com" })
    )
    expect(emailModule.sendApprovalEmail).not.toHaveBeenCalled()
  })

  it("flux validation approved — retourne 200 et envoie l'email d'approbation", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: PRO },
      })
    )
    const res = await POST(
      req({ documentId: uuid, status: "approved", contributorName: CONTRIB_NAME })
    )
    expect(res.status).toBe(200)
    expect(emailModule.sendApprovalEmail).toHaveBeenCalledWith(
      expect.objectContaining({ status: "approved", clientName: CONTRIB_NAME })
    )
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "document_approved" })
    )
  })

  it("flux validation rejected — crée une notification de refus", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: PRO },
      })
    )
    await POST(req({ documentId: uuid, status: "rejected", contributorName: CONTRIB_NAME }))
    expect(notificationsModule.createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: "document_rejected" })
    )
  })

  it("n'envoie pas l'email si le pro n'a pas d'adresse email", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC },
        validations: {},
        profiles: { data: { ...PRO, email: null } },
      })
    )
    await POST(req({ documentId: uuid, status: "approved", contributorName: CONTRIB_NAME }))
    expect(emailModule.sendApprovalEmail).not.toHaveBeenCalled()
  })

  it("retourne 500 si la mise à jour du document échoue", async () => {
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        documents: { data: DOC, updateError: { message: "update failed" } },
        validations: { insertError: null },
        profiles: { data: PRO },
      })
    )
    const res = await POST(
      req({ documentId: uuid, status: "approved", contributorName: CONTRIB_NAME })
    )
    expect(res.status).toBe(500)
  })
})
