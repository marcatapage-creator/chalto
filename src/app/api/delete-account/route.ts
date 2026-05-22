import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"

export async function DELETE(request: Request) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
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
  } catch (error) {
    console.error("Erreur suppression compte:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
