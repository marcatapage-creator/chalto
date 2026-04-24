import { describe, it, expect, vi, beforeEach } from "vitest"
import { DELETE } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as adminModule from "@/lib/supabase/admin"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/supabase/admin")

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

beforeEach(() => vi.clearAllMocks())

describe("DELETE /api/delete-account", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await DELETE()
    expect(res.status).toBe(401)
  })

  it("retourne 500 si la suppression échoue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(
      makeAdmin({ message: "delete failed" })
    )
    const res = await DELETE()
    expect(res.status).toBe(500)
  })

  it("retourne 200 si la suppression réussit", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeServerClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    vi.mocked(adminModule.createAdminClient).mockReturnValue(makeAdmin(null))
    const res = await DELETE()
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})
