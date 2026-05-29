import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { MeetingReport } from "@/types/index"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  const { data: meeting } = await admin
    .from("meeting_reports")
    .select("project_id, report, user_id, meeting_number")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!meeting) return NextResponse.json({ error: "Réunion introuvable" }, { status: 404 })

  const report = meeting.report as MeetingReport | null
  const actions = report?.actions ?? []

  if (actions.length === 0) {
    return NextResponse.json({ created: 0 })
  }

  // Récupération du nom du pro pour created_by
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()
  const createdBy = profile?.full_name ?? "Pro"

  const taskRows = actions.map((action) => ({
    project_id: meeting.project_id,
    title: action.titre,
    description:
      [
        action.responsable ? `Responsable : ${action.responsable}` : null,
        action.echeance ? `Échéance : ${action.echeance}` : null,
        `Issu de la réunion de chantier n°${meeting.meeting_number ?? ""}`,
      ]
        .filter(Boolean)
        .join("\n") || null,
    status: "todo",
    assigned_to: action.responsable ?? null,
    created_by: createdBy,
    due_date: null,
  }))

  const { data: created, error } = await admin.from("tasks").insert(taskRows).select("id")

  if (error) {
    console.error("[meetings/tasks] insert error:", error)
    return NextResponse.json({ error: "Erreur création tâches" }, { status: 500 })
  }

  return NextResponse.json({ created: created?.length ?? 0 })
}
