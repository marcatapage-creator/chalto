import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { taskId, authorName, content, contributorToken } = await request.json()

    if (!taskId || !authorName || !content?.trim() || !contributorToken) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Valide que le token appartient bien à un contributeur sur le même projet que la tâche
    const { data: task } = await admin.from("tasks").select("project_id").eq("id", taskId).single()

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

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[task-comment]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
