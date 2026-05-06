import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"

function req(body: unknown) {
  return new Request("http://localhost/api/admin-dossiers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = { projectId: uuid, type: "permis_construire", status: "en_preparation" }
const DOSSIER = { id: uuid, project_id: uuid, type: "permis_construire", status: "en_preparation" }

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ["select", "eq", "insert", "update", "delete"]
  methods.forEach((m) => (chain[m] = () => chain))
  chain.single = () => Promise.resolve(result)
  return chain
}

function makeServerClient(user: unknown) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
  }
}

function makeAdminClient(tables: Record<string, unknown>) {
  return {
    from: (table: string) => makeChain(tables[table] ?? { data: null, error: null }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
})

describe("POST /api/admin-dossiers", () => {
  it("retourne 429 si rate limit dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValueOnce(false)
    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(429)
  })

  it("retourne 400 si les paramètres sont invalides", async () => {
    const res = await POST(req({ projectId: "not-uuid", type: "permis_construire" }))
    expect(res.status).toBe(400)
  })

  it("retourne 400 si le type est invalide", async () => {
    const res = await POST(req({ projectId: uuid, type: "inconnu" }))
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(401)
  })

  it("retourne 404 si le projet n'appartient pas à l'utilisateur", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({ projects: { data: null, error: null } }) as unknown as ReturnType<
        typeof adminModule.createAdminClient
      >
    )
    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(404)
  })

  it("retourne 201 avec le dossier créé", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        projects: { data: { id: uuid }, error: null },
        admin_dossiers: { data: DOSSIER, error: null },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.dossier).toMatchObject({ type: "permis_construire" })
  })

  it("retourne 500 si l'insertion échoue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({
        projects: { data: { id: uuid }, error: null },
        admin_dossiers: { data: null, error: { message: "DB error" } },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req(VALID_BODY))
    expect(res.status).toBe(500)
  })
})
