import { describe, it, expect, vi, beforeEach } from "vitest"
import { PATCH, DELETE } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"
const DOSSIER = { id: uuid, status: "depose" }

function patchReq(body: unknown) {
  return new Request(`http://localhost/api/admin-dossiers/${uuid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function deleteReq() {
  return new Request(`http://localhost/api/admin-dossiers/${uuid}`, { method: "DELETE" })
}

const params = Promise.resolve({ id: uuid })

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ["select", "eq", "update", "delete"]
  methods.forEach((m) => (chain[m] = () => chain))
  chain.single = () => Promise.resolve(result)
  chain.then = (f?: ((v: unknown) => unknown) | null) => Promise.resolve(result).then(f)
  return chain
}

function makeServerClient(user: unknown) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
  }
}

function makeAdminClient(result: unknown) {
  return { from: () => makeChain(result) }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
})

describe("PATCH /api/admin-dossiers/[id]", () => {
  it("retourne 400 si le corps est invalide", async () => {
    const res = await PATCH(patchReq({ status: "inconnu" }), { params })
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await PATCH(patchReq({ status: "depose" }), { params })
    expect(res.status).toBe(401)
  })

  it("retourne 404 si le dossier est introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({ data: null, error: null }) as unknown as ReturnType<
        typeof adminModule.createAdminClient
      >
    )
    const res = await PATCH(patchReq({ status: "depose" }), { params })
    expect(res.status).toBe(404)
  })

  it("retourne 200 avec le dossier mis à jour", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({ data: DOSSIER, error: null }) as unknown as ReturnType<
        typeof adminModule.createAdminClient
      >
    )
    const res = await PATCH(patchReq({ status: "depose" }), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.dossier.status).toBe("depose")
  })
})

describe("DELETE /api/admin-dossiers/[id]", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await DELETE(deleteReq(), { params })
    expect(res.status).toBe(401)
  })

  it("retourne 200 si la suppression réussit", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdminClient({ error: null }) as unknown as ReturnType<
        typeof adminModule.createAdminClient
      >
    )
    const res = await DELETE(deleteReq(), { params })
    expect(res.status).toBe(200)
  })
})
