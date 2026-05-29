import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createNotification } from "@/lib/notifications"
import { escapeHtml } from "@/lib/email"
import { Resend } from "resend"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 })

  const { id } = await params
  const admin = createAdminClient()

  // Récupération de la réunion
  const { data: meeting } = await admin
    .from("meeting_reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!meeting) return NextResponse.json({ error: "Réunion introuvable" }, { status: 404 })
  if (meeting.status !== "ready") {
    return NextResponse.json({ error: "Le CR n'est pas encore prêt" }, { status: 409 })
  }

  // Récupération du profil pro + projet
  const [{ data: profile }, { data: project }] = await Promise.all([
    admin.from("profiles").select("full_name, email, company_name").eq("id", user.id).single(),
    admin.from("projects").select("name").eq("id", meeting.project_id).single(),
  ])

  const proName = profile?.company_name ?? profile?.full_name ?? "Votre architecte"
  const projectName = project?.name ?? "Projet"
  const meetingDate = new Date(meeting.meeting_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  // Récupération des contributors avec email
  const { data: contributors } = await admin
    .from("contributors")
    .select("name, email")
    .eq("project_id", meeting.project_id)
    .not("email", "is", null)

  const recipients = contributors ?? []

  // Envoi notification in-app au pro (confirmation)
  await createNotification({
    userId: user.id,
    type: "message_received",
    title: `CR Réunion n°${meeting.meeting_number ?? ""} envoyé`,
    body: `Le compte-rendu du ${meetingDate} a été envoyé à ${recipients.length} participant(s)`,
    link: `/projects/${meeting.project_id}?highlight=discussion`,
  })

  // Envoi emails aux contributors
  if (recipients.length > 0 && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/${meeting.project_id}`
    const report = meeting.report as {
      decisions?: string[]
      actions?: Array<{ titre: string; responsable: string | null; echeance: string | null }>
      points_en_suspens?: string[]
    } | null

    const decisionsHtml = report?.decisions?.length
      ? `<ul style="margin:0 0 8px; padding-left:20px;">${report.decisions.map((d) => `<li style="font-size:14px; color:#333; margin-bottom:4px;">${escapeHtml(d)}</li>`).join("")}</ul>`
      : `<p style="font-size:14px; color:#666; margin:0 0 8px;">Aucune décision enregistrée.</p>`

    const actionsHtml = report?.actions?.length
      ? `<ul style="margin:0 0 8px; padding-left:20px;">${report.actions.map((a) => `<li style="font-size:14px; color:#333; margin-bottom:4px;"><strong>${escapeHtml(a.titre)}</strong>${a.responsable ? ` — ${escapeHtml(a.responsable)}` : ""}${a.echeance ? ` (${escapeHtml(a.echeance)})` : ""}</li>`).join("")}</ul>`
      : `<p style="font-size:14px; color:#666; margin:0 0 8px;">Aucune action définie.</p>`

    await Promise.allSettled(
      recipients.map((c) =>
        resend.emails.send({
          from: "Chalto <noreply@chalto.fr>",
          to: c.email!,
          subject: `CR Réunion de chantier n°${meeting.meeting_number ?? ""} — ${escapeHtml(projectName)}`,
          html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#111;background:#fff;">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:32px;">
              <img src="https://chalto.fr/Logo.svg" alt="Chalto" width="28" height="28" style="display:block;" />
              <span style="font-weight:700;font-size:16px;color:#111;">Chalto</span>
            </div>
            <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">Compte-rendu de réunion</h1>
            <p style="color:#555;font-size:15px;margin:0 0 24px;">Bonjour ${escapeHtml(c.name)},</p>
            <p style="color:#333;line-height:1.7;font-size:15px;margin:0 0 24px;">
              <strong>${escapeHtml(proName)}</strong> vous transmet le compte-rendu de la réunion de chantier du <strong>${meetingDate}</strong>
              sur le projet <strong>${escapeHtml(projectName)}</strong>.
            </p>
            <div style="background:#f9f9f9;border:1px solid #eee;border-radius:10px;padding:20px;margin:0 0 24px;">
              <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Participants</p>
              <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml((meeting.participants as string[]).join(", "))}</p>
              <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Décisions</p>
              ${decisionsHtml}
              <p style="margin:8px 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Actions</p>
              ${actionsHtml}
            </div>
            <a href="${projectUrl}" style="display:inline-block;background:#2260E8;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:0 0 32px;">Voir le projet →</a>
            <p style="color:#999;font-size:12px;line-height:1.6;margin:0;border-top:1px solid #eee;padding-top:24px;">
              Notification automatique Chalto
            </p>
          </body></html>`,
        })
      )
    )
  }

  // Marquage comme envoyé
  await admin.from("meeting_reports").update({ status: "sent" }).eq("id", id)

  return NextResponse.json({ sent: recipients.length })
}
