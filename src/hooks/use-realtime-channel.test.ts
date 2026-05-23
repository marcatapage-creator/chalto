// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook } from "@testing-library/react"
import { useRealtimeChannel } from "./use-realtime-channel"

function makeChannel() {
  let onSubscribe: ((status: string, err?: Error) => void) | null = null
  const channel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockImplementation((cb: (status: string, err?: Error) => void) => {
      onSubscribe = cb
      return channel
    }),
    _fire: (status: string, err?: Error) => onSubscribe?.(status, err),
  }
  return channel
}

describe("useRealtimeChannel", () => {
  let supabase: {
    auth: { getSession: ReturnType<typeof vi.fn> }
    realtime: { setAuth: ReturnType<typeof vi.fn> }
    channel: ReturnType<typeof vi.fn>
    removeChannel: ReturnType<typeof vi.fn>
  }
  let channels: ReturnType<typeof makeChannel>[]

  beforeEach(() => {
    vi.useFakeTimers()
    channels = []
    supabase = {
      auth: {
        getSession: vi
          .fn()
          .mockResolvedValue({ data: { session: { access_token: "test-token" } } }),
      },
      realtime: { setAuth: vi.fn() },
      channel: vi.fn().mockImplementation(() => {
        const ch = makeChannel()
        channels.push(ch)
        return ch
      }),
      removeChannel: vi.fn().mockResolvedValue(undefined),
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("souscrit au channel au montage", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    renderHook(() => useRealtimeChannel(supabase as never, "test", setup))
    await vi.advanceTimersByTimeAsync(0) // flush microtasks (async getSession)
    expect(supabase.channel).toHaveBeenCalledTimes(1)
    expect(channels[0].subscribe).toHaveBeenCalledTimes(1)
  })

  it("injecte le token d'auth avant la souscription", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    renderHook(() => useRealtimeChannel(supabase as never, "test", setup))
    await vi.advanceTimersByTimeAsync(0)
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1)
    expect(supabase.realtime.setAuth).toHaveBeenCalledWith("test-token")
  })

  it("retire le channel au démontage", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    const { unmount } = renderHook(() => useRealtimeChannel(supabase as never, "test", setup))
    await vi.advanceTimersByTimeAsync(0) // laisser la souscription se terminer
    unmount()
    expect(supabase.removeChannel).toHaveBeenCalledTimes(1)
  })

  it("réessaie après CHANNEL_ERROR (premier retry après 2s)", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    renderHook(() => useRealtimeChannel(supabase as never, "test", setup))
    await vi.advanceTimersByTimeAsync(0) // flush souscription initiale

    channels[0]._fire("CHANNEL_ERROR")
    expect(supabase.channel).toHaveBeenCalledTimes(1) // pas encore retenté

    await vi.advanceTimersByTimeAsync(2000)
    expect(supabase.channel).toHaveBeenCalledTimes(2)
  })

  it("réessaie 3 fois au maximum puis abandonne", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    renderHook(() => useRealtimeChannel(supabase as never, "test", setup))

    await vi.advanceTimersByTimeAsync(0) // flush souscription initiale

    // retry 1 → 2s
    channels[0]._fire("CHANNEL_ERROR")
    await vi.advanceTimersByTimeAsync(2000)

    // retry 2 → 4s
    channels[1]._fire("CHANNEL_ERROR")
    await vi.advanceTimersByTimeAsync(4000)

    // retry 3 → 8s
    channels[2]._fire("CHANNEL_ERROR")
    await vi.advanceTimersByTimeAsync(8000)

    // 4ème CHANNEL_ERROR → ne doit plus retenter
    channels[3]._fire("CHANNEL_ERROR")
    await vi.advanceTimersByTimeAsync(30_000)

    // 1 initial + 3 retries = 4 channels créés au total
    expect(supabase.channel).toHaveBeenCalledTimes(4)
  })

  it("annule le retry programmé lors du démontage", async () => {
    const setup = vi.fn().mockImplementation((ch) => ch)
    const { unmount } = renderHook(() => useRealtimeChannel(supabase as never, "test", setup))

    await vi.advanceTimersByTimeAsync(0) // flush souscription initiale
    channels[0]._fire("CHANNEL_ERROR")
    unmount()

    await vi.advanceTimersByTimeAsync(2000)
    // Le retry ne doit pas s'être produit après le démontage
    expect(supabase.channel).toHaveBeenCalledTimes(1)
  })
})
