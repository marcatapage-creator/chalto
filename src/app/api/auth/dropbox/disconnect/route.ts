import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const admin = createAdminClient()

  const { data: integration } = await admin
    .from("user_integrations")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("provider", "dropbox")
    .single()

  // Révocation best-effort — on supprime même si Dropbox répond une erreur
  if (integration?.access_token) {
    await fetch("https://api.dropboxapi.com/2/auth/token/revoke", {
      method: "POST",
      headers: { Authorization: `Bearer ${integration.access_token}` },
    }).catch(() => {})
  }

  await admin.from("user_integrations").delete().eq("user_id", user.id).eq("provider", "dropbox")

  return NextResponse.json({ success: true })
}
