import { createAdminClient } from "@/lib/supabase/admin"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { taskCommentSchema } from "@/lib/api-schemas"

export async function POST(request: Request) {
  try {
    const parsed = taskCommentSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { taskId, authorName, content, contributorToken } = parsed.data

    const admin = createAdminClient()

    const { data: task } = await admin
      .from("tasks")
      .select("project_id, title")
      .eq("id", taskId)
      .single()

    if (!task) {
      return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })
    }

    const { data: contributor } = await admin
      .from("contributors")
      .select("id")
      .eq("invite_token", contributorToken)
      .eq("project_id", task.project_id)
      .single()

    if (!contributor) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { data: comment, error } = await admin
      .from("task_comments")
      .insert({
        task_id: taskId,
        author_name: authorName,
        author_role: "prestataire",
        content: content.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error("[task-comment]", error)
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
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
        type: "message_received",
        title: `Note de ${authorName}`,
        body: `Sur « ${task.title} » : ${content.trim().slice(0, 80)}`,
        link: `/projects/${task.project_id}?highlight=task_${taskId}`,
      })
    }

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[task-comment]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
