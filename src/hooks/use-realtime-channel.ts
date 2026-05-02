"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js"

type SetupFn = (channel: RealtimeChannel) => RealtimeChannel

/**
 * Creates, subscribes, and cleans up a Supabase Realtime channel.
 * Pass a stable `setup` callback (wrap in useCallback) to register listeners.
 * Retries up to 3× with exponential backoff on CHANNEL_ERROR.
 */
export function useRealtimeChannel(supabase: SupabaseClient, channelName: string, setup: SetupFn) {
  const setupRef = useRef(setup)
  const instanceId = useRef(crypto.randomUUID())

  useLayoutEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    let channel: RealtimeChannel | null = null
    let retries = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let cancelled = false

    const subscribe = () => {
      if (cancelled) return
      // Suffix changes on each retry so Supabase doesn't reuse a stale channel
      const uniqueName = `${channelName}:${instanceId.current}:r${retries}`
      channel = setupRef.current(supabase.channel(uniqueName)).subscribe((status, err) => {
        if (err) console.error(`[${uniqueName}] Realtime error:`, err)
        if (status === "CHANNEL_ERROR" && !cancelled) {
          if (retries < 3) {
            retries++
            const delay = Math.min(1_000 * 2 ** retries, 30_000) // 2s → 4s → 8s → cap 30s
            console.warn(`[${uniqueName}] CHANNEL_ERROR — retry ${retries}/3 in ${delay}ms`)
            if (channel) void supabase.removeChannel(channel)
            retryTimer = setTimeout(subscribe, delay)
          } else {
            console.warn(`[${uniqueName}] Realtime indisponible après 3 tentatives`)
          }
        }
      })
    }

    subscribe()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [supabase, channelName])
}
