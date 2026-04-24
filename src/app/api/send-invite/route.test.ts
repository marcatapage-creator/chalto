import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as emailBrandModule from "@/lib/email-brand"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ id: "resend-id" }) }
  },
}))
vi.mock("@/lib/email-brand", () => ({
  buildBrandHeader: vi.fn().mockReturnValue(""),
}))
vi.mock("@/lib/rate-limit")

function req(body: unknown) {
  return new Request("http://localhost/api/send-invite", {
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

const CONTACT = {
  id: "contact-1",
  name: "Alice",
  email: "alice@example.com",
  user_id: "user-1",
  profession_id: null,
}
const PROJECT = { id: "proj-1", name: "Rénovation", user_id: "user-1" }
const PRO_PROFILE = {
  full_name: "Jean Pro",
  email: "pro@example.com",
  company_name: null,
  logo_url: null,
  branding_enabled: false,
}
const CONTRIBUTOR = {
  id: "contrib-1",
  invite_token: "abc-token",
  project_id: "proj-1",
  contact_id: "contact-1",
}

function makeClient(
  tables: Record<string, { data?: unknown; insertData?: unknown }>,
  user: unknown = { id: "user-1" }
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: (table: string) => {
      const t = tables[table] ?? {}
      return tableChain(
        { data: t.data ?? null },
        { error: null },
        { data: t.insertData ?? null, error: null }
      )
    },
  }
}

const uuid = "123e4567-e89b-12d3-a456-426614174000"

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(emailBrandModule.buildBrandHeader).mockReturnValue("")
})

describe("POST /api/send-invite", () => {
  it("retourne 400 si les paramètres sont invalides", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: "not-a-uuid", projectId: uuid }))
    expect(res.status).toBe(400)
  })

  it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}, null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(401)
  })

  it("retourne 404 si le contact est introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({ contacts: { data: null } }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(404)
  })

  it("retourne 400 si le contact n'a pas d'email", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contacts: { data: { ...CONTACT, email: null } },
        projects: { data: PROJECT },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(400)
  })

  it("retourne 404 si le projet est introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contacts: { data: CONTACT },
        projects: { data: null },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(404)
  })

  it("retourne 200 et crée un nouveau contributor avec token d'invitation", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contacts: { data: CONTACT },
        projects: { data: PROJECT },
        profiles: { data: PRO_PROFILE },
        contributors: { data: null, insertData: CONTRIBUTOR },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.inviteUrl).toContain(CONTRIBUTOR.invite_token)
  })

  it("retourne 200 et réutilise un contributor existant avec token", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contacts: { data: CONTACT },
        projects: { data: PROJECT },
        profiles: { data: PRO_PROFILE },
        contributors: { data: CONTRIBUTOR },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contactId: uuid, projectId: uuid }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.inviteUrl).toContain(CONTRIBUTOR.invite_token)
  })
})
