import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function DELETE() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
  }

  const admin = createAdminClient()

  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    console.error("Erreur suppression compte:", error)
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
