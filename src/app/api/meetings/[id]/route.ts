import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { updateMeetingReportSchema } from "@/lib/api-schemas"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id } = await params
  const parsed = updateMeetingReportSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const admin = createAdminClient()

  // Vérification ownership
  const { data: existing } = await admin
    .from("meeting_reports")
    .select("user_id")
    .eq("id", id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  const { data: updated, error } = await admin
    .from("meeting_reports")
    .update({ report: parsed.data.report })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 })

  return NextResponse.json(updated)
}
