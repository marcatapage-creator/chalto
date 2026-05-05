import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { renewContributorSchema } from "@/lib/api-schemas"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const { id } = await params

    const parsed = renewContributorSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const { contributorId, projectId } = parsed.data

    if (contributorId !== id)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const admin = createAdminClient()

    const { data: project } = await admin
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })

    const { data: contributor } = await admin
      .from("contributors")
      .select("id")
      .eq("id", contributorId)
      .eq("project_id", projectId)
      .single()

    if (!contributor)
      return NextResponse.json({ error: "Contributeur introuvable" }, { status: 404 })

    const newToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { data: updated, error } = await admin
      .from("contributors")
      .update({
        invite_token: newToken,
        invite_expires_at: expiresAt.toISOString(),
      })
      .eq("id", contributorId)
      .select("id, invite_token, invite_expires_at")
      .single()

    if (error) {
      console.error("[contributors renew POST]", error)
      return NextResponse.json({ error: "Erreur lors du renouvellement" }, { status: 500 })
    }

    return NextResponse.json({ contributor: updated })
  } catch (error) {
    console.error("[contributors renew POST]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
