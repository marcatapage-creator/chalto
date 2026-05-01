"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import type { SupabaseClient, RealtimeChannel } from "@supabase/supabase-js"

type SetupFn = (channel: RealtimeChannel) => RealtimeChannel

/**
 * Creates, subscribes, and cleans up a Supabase Realtime channel.
 * Pass a stable `setup` callback (wrap in useCallback) to register listeners.
 */
export function useRealtimeChannel(supabase: SupabaseClient, channelName: string, setup: SetupFn) {
  const setupRef = useRef(setup)
  // Unique per-mount suffix prevents "cannot add postgres_changes after subscribe()" when
  // RealtimeClient.channel() returns an existing subscribed channel instead of a fresh one.
  const instanceId = useRef(crypto.randomUUID())

  useLayoutEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    const uniqueName = `${channelName}:${instanceId.current}`
    const channel = setupRef.current(supabase.channel(uniqueName)).subscribe((_status, err) => {
      if (err) console.error(`[${uniqueName}] Realtime error:`, err)
    })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, channelName])
}
