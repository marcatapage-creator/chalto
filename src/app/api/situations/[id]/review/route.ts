import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { reviewSituationSchema } from "@/lib/api-schemas"
import { createNotification } from "@/lib/notifications"
import { sendSituationReviewedEmail } from "@/lib/email"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkRateLimit(request)))
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

  try {
    const { id } = await params

    const parsed = reviewSituationSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })

    const { action, reviewerComment, refusalReason } = parsed.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const admin = createAdminClient()

    const { data: situation } = await admin
      .from("situations")
      .select("id, project_id, contributor_id, lot_label, percentage, status")
      .eq("id", id)
      .single()

    if (!situation) return NextResponse.json({ error: "Situation introuvable" }, { status: 404 })

    const { data: project } = await admin
      .from("projects")
      .select("id, name, user_id")
      .eq("id", situation.project_id)
      .eq("user_id", user.id)
      .single()

    if (!project) return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    if (situation.status !== "en_attente" && situation.status !== "corrigee") {
      return NextResponse.json(
        { error: "Cette situation ne peut plus être révisée" },
        { status: 409 }
      )
    }

    const newStatus = action === "validate" ? "validee" : "refusee"

    const { data: updated, error: updateError } = await admin
      .from("situations")
      .update({
        status: newStatus,
        reviewer_comment: reviewerComment ?? null,
        refusal_reason: action === "refuse" ? (refusalReason ?? null) : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[situations review PATCH]", updateError)
      return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
    }

    const { data: contributor } = await admin
      .from("contributors")
      .select("id, name, contact_id, invite_token")
      .eq("id", situation.contributor_id)
      .single()

    if (contributor?.contact_id) {
      const { data: contact } = await admin
        .from("contacts")
        .select("email")
        .eq("id", contributor.contact_id)
        .single()

      if (contact?.email && contributor.invite_token) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"
        void sendSituationReviewedEmail({
          contributorEmail: contact.email,
          contributorName: contributor.name,
          projectName: project.name,
          lotLabel: situation.lot_label,
          percentage: situation.percentage,
          action,
          reviewerComment,
          refusalReason,
          inviteUrl: `${baseUrl}/invite/${contributor.invite_token}`,
        }).catch((err: unknown) =>
          console.error("[situations review] sendSituationReviewedEmail", err)
        )
      }

      void createNotification({
        userId: project.user_id,
        type: "situation_reviewed",
        title: action === "validate" ? "Situation validée" : "Situation refusée",
        body: `${situation.lot_label} — ${situation.percentage}%`,
        link: `/projects/${situation.project_id}?highlight=sit_${situation.id}`,
      }).catch((err: unknown) => console.error("[situations review] createNotification", err))
    }

    return NextResponse.json({ situation: updated })
  } catch (error) {
    console.error("[situations review PATCH]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
