import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { createAdminDossierSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const parsed = createAdminDossierSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { projectId, type, label, status, deadline, notes } = parsed.data
    const admin = createAdminClient()

    // Vérifier que le projet appartient à l'utilisateur
    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    const { data: dossier, error } = await admin
      .from("admin_dossiers")
      .insert({
        project_id: projectId,
        user_id: user.id,
        type,
        label: label ?? null,
        status,
        deadline: deadline ?? null,
        notes: notes ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("[admin-dossiers POST]", error)
      return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
    }

    return NextResponse.json({ dossier }, { status: 201 })
  } catch (error) {
    console.error("[admin-dossiers POST]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
