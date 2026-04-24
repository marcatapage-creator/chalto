import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as emailModule from "@/lib/email"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/email")

function req(body: unknown) {
  return new Request("http://localhost/api/send-welcome", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function makeClient(user: unknown = { id: "user-1", email: "pro@example.com" }) {
  return { auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) } }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(emailModule.sendWelcomeEmail).mockResolvedValue(undefined as never)
})

describe("POST /api/send-welcome", () => {
  it("retourne 401 si non authentifié", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ fullName: "Alice" }))
    expect(res.status).toBe(401)
  })

  it("retourne 200 et envoie l'email de bienvenue", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient() as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ fullName: "Alice" }))
    expect(res.status).toBe(200)
    expect(emailModule.sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: "Alice" })
    )
  })
})
