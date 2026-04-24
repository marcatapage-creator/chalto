import { describe, it, expect, vi, beforeEach } from "vitest"

const mockLimit = vi.hoisted(() => vi.fn().mockResolvedValue({ success: true }))

vi.mock("@upstash/redis", () => ({
  Redis: class {
    get = vi.fn()
    set = vi.fn()
    eval = vi.fn()
  },
}))

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn().mockReturnValue({})
    limit = mockLimit
  },
}))

import { checkRateLimit } from "../rate-limit"

function makeRequest(ip?: string): Request {
  const headers = new Headers()
  if (ip) headers.set("x-forwarded-for", ip)
  return new Request("http://localhost/api/test", { headers })
}

beforeEach(() => {
  mockLimit.mockClear()
  mockLimit.mockResolvedValue({ success: true })
})

describe("checkRateLimit", () => {
  it("retourne true si la limite n'est pas atteinte", async () => {
    const result = await checkRateLimit(makeRequest("1.2.3.4"))
    expect(result).toBe(true)
  })

  it("retourne false si la limite est dépassée", async () => {
    mockLimit.mockResolvedValueOnce({ success: false })
    const result = await checkRateLimit(makeRequest("1.2.3.4"))
    expect(result).toBe(false)
  })

  it("utilise l'IP du header x-forwarded-for", async () => {
    await checkRateLimit(makeRequest("5.6.7.8"))
    expect(mockLimit).toHaveBeenCalledWith("5.6.7.8")
  })

  it("utilise 'anonymous' si aucun header IP n'est présent", async () => {
    await checkRateLimit(makeRequest())
    expect(mockLimit).toHaveBeenCalledWith("anonymous")
  })
})
