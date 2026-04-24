import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as emailBrandModule from "@/lib/email-brand"

vi.mock("@/lib/supabase/server")
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: vi.fn().mockResolvedValue({ id: "resend-id" }) }
  },
}))
vi.mock("@/lib/email-brand", () => ({ buildBrandHeader: vi.fn().mockReturnValue("") }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/send-document-contributor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(selectResult: unknown) {
  function chain(mode: Mode): Record<string, unknown> {
    return {
      select: () => chain(mode),
      eq: () => chain(mode),
      in: () => chain(mode),
      single: () => Promise.resolve(selectResult),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(selectResult).then(f, r),
    }
  }
  return chain("select")
}

function makeClient(tables: Record<string, { data?: unknown }>, user: unknown = { id: "user-1" }) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from: (table: string) => tableChain({ data: tables[table]?.data ?? null, error: null }),
  }
}

const CONTRIBUTORS = [{ name: "Alice", email: "alice@example.com", invite_token: "tok-alice" }]
const PROJECT = { name: "Rénovation" }
const PROFILE = {
  full_name: "Jean Pro",
  company_name: null,
  logo_url: null,
  branding_enabled: false,
}

const validBody = {
  contributorIds: [uuid],
  documentName: "Devis",
  projectId: uuid,
  requestType: "validation",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(emailBrandModule.buildBrandHeader).mockReturnValue("")
})

describe("POST /api/send-document-contributor", () => {
  it("retourne 400 si le corps est invalide", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({}))
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}, null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(401)
  })

  it("retourne 403 si le projet n'appartient pas à l'utilisateur", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contributors: { data: CONTRIBUTORS },
        projects: { data: null },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(403)
  })

  it("retourne 404 si aucun prestataire trouvé", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contributors: { data: [] },
        projects: { data: PROJECT },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(404)
  })

  it("retourne 200 et envoie les emails aux prestataires", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        contributors: { data: CONTRIBUTORS },
        projects: { data: PROJECT },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})
