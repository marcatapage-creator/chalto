import { createAdminClient } from "@/lib/supabase/admin"

interface CreateNotificationParams {
  userId: string
  type: "document_approved" | "document_rejected" | "message_received" | "task_assigned"
  title: string
  body?: string
  link?: string
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: CreateNotificationParams) {
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("notif_inapp_enabled")
    .eq("id", userId)
    .single()

  if (profile?.notif_inapp_enabled === false) return

  const { error } = await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link,
  })
  if (error) {
    console.error("Erreur création notification:", error)
  }
}
