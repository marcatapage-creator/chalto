import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { updateAdminDossierSchema } from "@/lib/api-schemas"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const { id } = await params
    const parsed = updateAdminDossierSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const admin = createAdminClient()

    const { data: dossier, error } = await admin
      .from("admin_dossiers")
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error || !dossier) {
      if (!dossier) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 })
      console.error("[admin-dossiers PATCH]", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    return NextResponse.json({ dossier })
  } catch (error) {
    console.error("[admin-dossiers PATCH]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const { id } = await params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const admin = createAdminClient()

    const { error, count } = await admin
      .from("admin_dossiers")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[admin-dossiers DELETE]", error)
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }

    if (count === 0) {
      return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin-dossiers DELETE]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
