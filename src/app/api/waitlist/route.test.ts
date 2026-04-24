import { describe, it, expect, vi, beforeEach } from "vitest"
import { POST } from "./route"
import * as serverModule from "@/lib/supabase/server"
import * as emailModule from "@/lib/email"
import * as rateLimitModule from "@/lib/rate-limit"

vi.mock("@/lib/supabase/server")
vi.mock("@/lib/email")
vi.mock("@/lib/rate-limit")

function req(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function makeClient(insertError: unknown = null) {
  return {
    from: () => ({
      insert: () => Promise.resolve({ error: insertError }),
    }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(true)
  vi.mocked(emailModule.sendWaitlistConfirmationEmail).mockResolvedValue(undefined as never)
})

describe("POST /api/waitlist", () => {
  it("retourne 429 si limite dépassée", async () => {
    vi.mocked(rateLimitModule.checkRateLimit).mockResolvedValue(false)
    const res = await POST(req({ email: "a@b.com" }))
    expect(res.status).toBe(429)
  })

  it("retourne 400 si email invalide", async () => {
    const res = await POST(req({ email: "pas-un-email" }))
    expect(res.status).toBe(400)
  })

  it("retourne 409 si email déjà inscrit", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({ code: "23505" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    const res = await POST(req({ email: "a@b.com" }))
    expect(res.status).toBe(409)
    expect((await res.json()).error).toBe("already_registered")
  })

  it("retourne 500 si erreur DB autre", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient({ code: "99999", message: "DB error" }) as unknown as Awaited<
        ReturnType<typeof serverModule.createClient>
      >
    )
    const res = await POST(req({ email: "a@b.com" }))
    expect(res.status).toBe(500)
  })

  it("retourne 200 et envoie l'email de confirmation", async () => {
    vi.mocked(serverModule.createClient).mockResolvedValue(
      makeClient(null) as unknown as Awaited<ReturnType<typeof serverModule.createClient>>
    )
    const res = await POST(req({ email: "a@b.com", name: "Alice", profession: "Architecte" }))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})
