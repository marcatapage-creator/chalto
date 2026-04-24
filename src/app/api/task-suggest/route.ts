import { createAdminClient } from "@/lib/supabase/admin"
import { createNotification } from "@/lib/notifications"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { taskSuggestSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const parsed = taskSuggestSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { projectId, title, description, contributorToken, contributorName } = parsed.data

    const admin = createAdminClient()

    const { data: contributor } = await admin
      .from("contributors")
      .select("id, contact_id, invite_expires_at")
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

    const { data: task, error } = await admin
      .from("tasks")
      .insert({
        project_id: projectId,
        title: title.trim(),
        description: description?.trim() || null,
        status: "suggestion",
        suggested_by: contributorName,
        assigned_to: contributor.contact_id,
      })
      .select()
      .single()

    if (error) {
      console.error("[task-suggest]", error)
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
    }

    if (project?.user_id) {
      void createNotification({
        userId: project.user_id,
        type: "task_assigned",
        title: `Suggestion de ${contributorName}`,
        body: `« ${title.trim()} »`,
        link: `/projects/${projectId}?highlight=task_${task.id}`,
      })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("[task-suggest]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
