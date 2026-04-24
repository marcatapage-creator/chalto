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

  useLayoutEffect(() => {
    setupRef.current = setup
  })

  useEffect(() => {
    const channel = setupRef.current(supabase.channel(channelName)).subscribe((_status, err) => {
      if (err) console.error(`[${channelName}] Realtime error:`, err)
    })
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, channelName])
}
