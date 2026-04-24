import { createAdminClient } from "@/lib/supabase/admin"
import { createNotification } from "@/lib/notifications"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { projectMessageSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const parsed = projectMessageSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { projectId, authorName, content, contributorToken } = parsed.data

    const admin = createAdminClient()

    const { data: contributor } = await admin
      .from("contributors")
      .select("id, invite_expires_at")
      .eq("invite_token", contributorToken)
      .eq("project_id", projectId)
      .single()

    if (!contributor) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    if (contributor.invite_expires_at && new Date(contributor.invite_expires_at) < new Date()) {
      return NextResponse.json({ error: "Lien expiré" }, { status: 410 })
    }

    const { data: project } = await admin
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single()

    const { data: message, error } = await admin
      .from("project_messages")
      .insert({
        project_id: projectId,
        author_name: authorName,
        author_role: "prestataire",
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error("[project-message]", error)
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
    }

    if (project?.user_id) {
      void createNotification({
        userId: project.user_id,
        type: "message_received",
        title: `Message de ${authorName}`,
        body: content.trim().slice(0, 100),
        link: `/projects/${projectId}?highlight=discussion`,
      })
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error("[project-message]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
