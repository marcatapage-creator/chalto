import { createAdminClient } from "@/lib/supabase/admin"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { taskStatusSchema } from "@/lib/api-schemas"

const STATUS_LABELS: Record<string, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
}

export async function POST(request: Request) {
  try {
    const parsed = taskStatusSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { taskId, status, contributorToken } = parsed.data

    const admin = createAdminClient()

    const { data: task } = await admin
      .from("tasks")
      .select("project_id, title")
      .eq("id", taskId)
      .single()
    if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })

    const { data: contributor } = await admin
      .from("contributors")
      .select("id, name")
      .eq("invite_token", contributorToken)
      .eq("project_id", task.project_id)
      .single()

    if (!contributor) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    const { error } = await admin.from("tasks").update({ status }).eq("id", taskId)
    if (error) {
      console.error("[task-status]", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    const { data: project } = await admin
      .from("projects")
      .select("user_id")
      .eq("id", task.project_id)
      .single()
    const userId = project?.user_id
    if (userId) {
      void createNotification({
        userId,
        type: "task_assigned",
        title: `Avancement mis à jour`,
        body: `${contributor.name} a passé « ${task.title} » en ${STATUS_LABELS[status] ?? status}`,
        link: `/projects/${task.project_id}?highlight=task_${taskId}`,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[task-status]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
