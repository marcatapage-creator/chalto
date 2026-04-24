import { describe, it, expect, vi, afterEach } from "vitest"
import { fetchWithTimeout } from "../fetch-timeout"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("fetchWithTimeout", () => {
  it("retourne la réponse si la requête aboutit avant le timeout", async () => {
    const mockResponse = new Response(JSON.stringify({ ok: true }), { status: 200 })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse))

    const res = await fetchWithTimeout("http://example.com/api", {}, 5000)
    expect(res.status).toBe(200)
  })

  it("passe les options de la requête à fetch", async () => {
    const spy = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal("fetch", spy)

    await fetchWithTimeout("http://example.com/api", { method: "POST" }, 5000)

    expect(spy).toHaveBeenCalledWith(
      "http://example.com/api",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("ajoute un AbortSignal à la requête", async () => {
    const spy = vi.fn().mockResolvedValue(new Response())
    vi.stubGlobal("fetch", spy)

    await fetchWithTimeout("http://example.com/api", {}, 5000)

    const callArgs = spy.mock.calls[0][1] as RequestInit
    expect(callArgs.signal).toBeDefined()
  })

  it("lève une erreur si la requête dépasse le timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        (_url: unknown, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            ;(init.signal as AbortSignal).addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError"))
            )
          })
      )
    )

    await expect(fetchWithTimeout("http://example.com/api", {}, 1)).rejects.toThrow()
  })
})
