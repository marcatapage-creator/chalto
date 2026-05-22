import { describe, it, expect, vi, beforeEach } from "vitest"
import { DELETE } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")
vi.mock("@/lib/rate-limit")

function makeServerClient(user: unknown = { id: "user-1" }) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) } }
}

function makeAdmin(deleteError: unknown = null) {
  return {
    auth: {
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: deleteError }),
      },
    },
  } as unknown as ReturnType<typeof adminModule.createAdminClient>
}

function req() {
  return new Request("http://localhost/api/delete-account", { method: "DELETE" })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
})

describe("DELETE /api/delete-account", () => {
  it("retourne 429 si limite dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(false)
    const res = await DELETE(req())
    expect(res.status).toBe(429)
  })

  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await DELETE(req())
    expect(res.status).toBe(401)
  })

  it("retourne 500 si la suppression échoue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ message: "delete failed" })
    )
    const res = await DELETE(req())
    expect(res.status).toBe(500)
  })

  it("retourne 200 si la suppression réussit", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin(null))
    const res = await DELETE(req())
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})
