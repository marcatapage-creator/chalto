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

    isInitialLoad.current = true
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setNotifications(data)
        isInitialLoad.current = false
      })

    const channel = supabase
      .channel(`notifications:${userId}`)
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
          setNotifications((prev) => [notif, ...prev])
          if (!isInitialLoad.current) {
            toast(notif.title, { description: notif.body })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
