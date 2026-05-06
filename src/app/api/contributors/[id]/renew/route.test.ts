import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn().mockResolvedValue(true) }))

const uuid = "123e4567-e89b-12d3-a456-426614174000"
const projId = "223e4567-e89b-12d3-a456-426614174000"
const params = Promise.resolve({ id: uuid })

function req(body: unknown) {
  return new Request(`http://localhost/api/contributors/${uuid}/renew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function makeChain(result: unknown) {
  const c: Record<string, unknown> = {}
  ;["select", "eq", "update"].forEach((m) => (c[m] = () => c))
  c.single = () => Promise.resolve(result)
  return c
}

function makeAdmin(tables: Record<string, unknown>) {
  return { from: (t: string) => makeChain(tables[t] ?? { data: null, error: null }) }
}

function makeServerClient(user: unknown) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) } }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
})

describe("POST /api/contributors/[id]/renew", () => {
  it("retourne 429 si rate limit dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValueOnce(false)
    const res = await POST(req({ contributorId: uuid, projectId: projId }), { params })
    expect(res.status).toBe(429)
  })

  it("retourne 400 si les IDs ne correspondent pas", async () => {
    const res = await POST(req({ contributorId: projId, projectId: projId }), { params })
    expect(res.status).toBe(400)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ contributorId: uuid, projectId: projId }), { params })
    expect(res.status).toBe(401)
  })

  it("retourne 404 si projet introuvable", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ projects: { data: null, error: null } }) as unknown as ReturnType<
        typeof adminModule.createAdminClient
      >
    )
    const res = await POST(req({ contributorId: uuid, projectId: projId }), { params })
    expect(res.status).toBe(404)
  })

  it("retourne 200 avec le nouveau token", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient({ id: "user-1" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({
        projects: { data: { id: projId }, error: null },
        contributors: {
          data: { id: uuid, invite_token: "new-token", invite_expires_at: "2027-01-01" },
          error: null,
        },
      }) as unknown as ReturnType<typeof adminModule.createAdminClient>
    )
    const res = await POST(req({ contributorId: uuid, projectId: projId }), { params })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.contributor.invite_token).toBe("new-token")
  })
})
