import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as emailModule from "@/lib/email"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/email")
vi.mock("@/lib/rate-limit")
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/send-validation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

type Mode = "select" | "update" | "insert"

function tableChain(selectResult: unknown, updateResult: unknown = { error: null }) {
  function chain(mode: Mode): Record<string, unknown> {
    const value = mode === "update" ? updateResult : selectResult
    return {
      select: () => chain(mode),
      eq: () => chain(mode),
      order: () => chain(mode),
      inner: () => chain(mode),
      update: () => chain("update"),
      insert: () => chain("insert"),
      single: () => Promise.resolve(value),
      then: (f?: ((v: unknown) => unknown) | null, r?: ((e: unknown) => unknown) | null) =>
        Promise.resolve(value).then(f, r),
    }
  }
  return chain("select")
}

function makeClient(
  tables: Record<string, { data?: unknown; updateError?: unknown }>,
  user: unknown = { id: "user-1" }
) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: (table: string) => {
      const t = tables[table] ?? {}
      return tableChain({ data: t.data ?? null, error: null }, { error: t.updateError ?? null })
    },
  }
}

const DOCUMENT = {
  id: "doc-1",
  name: "Devis",
  project_id: "proj-1",
  validation_token: "val-tok",
  status: "draft",
  projects: {
    name: "Rénovation",
    client_email: "client@example.com",
    client_name: "Dupont",
    user_id: "user-1",
  },
}

const PROFILE = {
  full_name: "Jean Pro",
  email: "pro@example.com",
  logo_url: null,
  company_name: null,
  branding_enabled: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(emailModule.sendValidationEmail).mockResolvedValue({ error: null } as never)
})

describe("POST /api/send-validation", () => {
  it("retourne 400 si le corps est invalide", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({}))
    expect(res.status).toBe(400)
  })

  it("retourne 401 si l'utilisateur n'est pas authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({}, null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ documentId: uuid }))
    expect(res.status).toBe(401)
  })

  it("retourne 404 si le document est introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({ documents: { data: null } }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    const res = await POST(req({ documentId: uuid }))
    expect(res.status).toBe(404)
  })

  it("retourne 403 si le document appartient à un autre utilisateur", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        documents: {
          data: { ...DOCUMENT, projects: { ...DOCUMENT.projects, user_id: "other-user" } },
        },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ documentId: uuid }))
    expect(res.status).toBe(403)
  })

  it("retourne 400 si le projet n'a pas d'email client", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        documents: {
          data: { ...DOCUMENT, projects: { ...DOCUMENT.projects, client_email: null } },
        },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ documentId: uuid }))
    expect(res.status).toBe(400)
  })

  it("retourne 200 et envoie l'email de validation", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({
        documents: { data: DOCUMENT },
        profiles: { data: PROFILE },
      }) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ documentId: uuid }))
    expect(res.status).toBe(200)
    expect(emailModule.sendValidationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ clientEmail: "client@example.com" })
    )
  })
})
