"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export interface Notification {
  id: string
  type: string
  title: string
  body?: string
  link?: string
  read: boolean
  created_at: string
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = useMemo(() => createClient(), [])

  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const setup = async () => {
      isInitialLoad.current = true
      try {
        const { data } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20)
        if (data) setNotifications(data)
      } finally {
        isInitialLoad.current = false
      }

      if (cancelled) return

      // Inject auth token into the Realtime WS before subscribing —
      // @supabase/ssr uses cookies and the WS may connect before the token is set
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (cancelled) return

      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token)
      }

      let retries = 0
      const subscribe = () => {
        if (cancelled) return
        channel = supabase
          .channel(`notifications:${userId}:${crypto.randomUUID()}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              const notif = payload.new as Notification
              setNotifications((prev) => [notif, ...prev].slice(0, 20))
              if (!isInitialLoad.current) {
                toast(notif.title, { description: notif.body })
              }
            }
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR") {
              if (retries < 2) {
                retries++
                console.warn(`[notifications] Realtime CHANNEL_ERROR — retry ${retries}/2`)
                if (channel) void supabase.removeChannel(channel)
                retryTimer = setTimeout(subscribe, 2000 * retries)
              } else {
                console.warn(
                  "[notifications] Realtime indisponible après 2 tentatives — les notifications in-app ne seront pas temps réel"
                )
              }
            }
          })
      }
      subscribe()
    }

    void setup()

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await supabase.from("notifications").update({ read: true }).eq("id", id)
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
