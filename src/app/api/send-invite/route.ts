import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"
import { buildBrandHeader } from "@/lib/email-brand"
import { sendInviteSchema } from "@/lib/api-schemas"
import { escapeHtml } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(request)))
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

    const parsed = sendInviteSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { contactId, projectId } = parsed.data
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .eq("user_id", user.id)
      .single()

    if (!contact) {
      return NextResponse.json({ error: "Contact introuvable" }, { status: 404 })
    }
    if (!contact.email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 })
    }

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: "Projet introuvable" }, { status: 404 })
    }

    const { data: proProfile } = await supabase
      .from("profiles")
      .select("full_name, email, company_name, logo_url, branding_enabled")
      .eq("id", user.id)
      .single()

    // Créer ou récupérer le contributor
    const { data: existing } = await supabase
      .from("contributors")
      .select("*")
      .eq("project_id", projectId)
      .eq("contact_id", contactId)
      .single()

    const tokenExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    let contributor = existing
    if (!contributor) {
      const { data: created } = await supabase
        .from("contributors")
        .insert({
          project_id: projectId,
          contact_id: contactId,
          name: contact.name,
          email: contact.email,
          profession_id: contact.profession_id,
          invite_token: crypto.randomUUID(),
          invite_expires_at: tokenExpiresAt,
        })
        .select()
        .single()
      contributor = created
    } else {
      // Refresh token and expiry on every re-invite
      const token = contributor.invite_token ?? crypto.randomUUID()
      await supabase
        .from("contributors")
        .update({ invite_token: token, invite_expires_at: tokenExpiresAt })
        .eq("id", contributor.id)
      contributor = { ...contributor, invite_token: token, invite_expires_at: tokenExpiresAt }
    }

    // Tâches assignées à ce contact sur ce projet
    const { data: assignedTasks } = await supabase
      .from("tasks")
      .select("title, description, due_date")
      .eq("project_id", projectId)
      .eq("assigned_to", contactId)
      .order("created_at", { ascending: true })

    const hasTasks = assignedTasks && assignedTasks.length > 0

    const baseUrl = new URL(request.url).origin
    const inviteUrl = `${baseUrl}/invite/${contributor.invite_token}`
    const proName = proProfile?.full_name ?? proProfile?.email ?? "Votre professionnel"
    const proCompany = proProfile?.company_name ? ` (${proProfile.company_name})` : ""
    const brandHeader = buildBrandHeader(proProfile)

    const taskListHtml = hasTasks
      ? `
        <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 12px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">
            Tâche${assignedTasks.length > 1 ? "s" : ""} qui vous sont assignée${assignedTasks.length > 1 ? "s" : ""}
          </p>
          ${assignedTasks
            .map(
              (t) => `
            <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #eee; padding: 8px 0; margin: 0;">
              <tr>
                <td width="22" valign="top" style="padding-top: 2px;">
                  <span style="display: inline-block; width: 14px; height: 14px; border: 2px solid #2260E8; border-radius: 3px;"></span>
                </td>
                <td valign="top">
                  <p style="margin: 0; font-size: 14px; font-weight: 600;">${escapeHtml(t.title)}</p>
                  ${t.description ? `<p style="margin: 2px 0 0; font-size: 12px; color: #666;">${escapeHtml(t.description)}</p>` : ""}
                  ${t.due_date ? `<p style="margin: 4px 0 0; font-size: 11px; color: #999;">Échéance : ${new Date(t.due_date).toLocaleDateString("fr-FR")}</p>` : ""}
                </td>
              </tr>
            </table>`
            )
            .join("")}
        </div>`
      : `
        <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Projet</p>
          <p style="margin: 0; font-weight: 600; font-size: 16px;">${escapeHtml(project?.name)}</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #666;">
            Vos documents et tâches seront accessibles dès que votre professionnel les partagera.
          </p>
        </div>`

    const subject = hasTasks
      ? `${escapeHtml(proName)} vous a assigné ${assignedTasks.length > 1 ? `${assignedTasks.length} tâches` : "une tâche"} sur "${escapeHtml(project?.name)}"`
      : `${escapeHtml(proName)} vous a créé un espace de collaboration — "${escapeHtml(project?.name)}"`

    const introText = hasTasks
      ? `<strong>${escapeHtml(proName)}${escapeHtml(proCompany)}</strong> vous a invité à collaborer sur le projet <strong>${escapeHtml(project?.name)}</strong> et vous a assigné ${assignedTasks.length > 1 ? `${assignedTasks.length} tâches` : "une tâche"}. Connectez-vous à votre espace pour les consulter et mettre à jour leur avancement.`
      : `<strong>${escapeHtml(proName)}${escapeHtml(proCompany)}</strong> vous a invité à rejoindre le projet <strong>${escapeHtml(project?.name)}</strong>. Votre espace personnel est accessible en un clic — consultez les documents partagés et suivez les échanges en temps réel.`

    if (process.env.SKIP_EMAILS === "true") {
      return NextResponse.json({ success: true, inviteUrl })
    }

    await resend.emails.send({
      from: "Chalto <noreply@chalto.fr>",
      to: contact.email,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

            <div style="margin-bottom: 32px;">
              ${brandHeader}
            </div>

            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
              ${hasTasks ? `${assignedTasks.length > 1 ? "Des tâches vous ont été assignées" : "Une tâche vous a été assignée"}` : "Votre espace de collaboration est prêt"}
            </h1>

            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Bonjour ${escapeHtml(contact.name)},
            </p>

            <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
              ${introText}
            </p>

            ${taskListHtml}

            <a href="${inviteUrl}"
               style="display: inline-block; background: #2260E8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
              Accéder à mon espace →
            </a>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 0 0 32px;">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #2260E8;">
                💡 Et si vous utilisiez Chalto pour vos propres projets ?
              </p>
              <p style="margin: 0 0 12px; font-size: 13px; color: #555; line-height: 1.6;">
                Gérez vos chantiers, partagez vos documents et faites valider vos livrables par vos clients — simplement.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/register"
                 style="font-size: 13px; color: #2260E8; font-weight: 600; text-decoration: underline;">
                Créer mon compte gratuitement →
              </a>
            </div>

            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
              Vous avez reçu cet email car ${escapeHtml(proName)} vous a invité via Chalto.<br/>
              Si vous n&apos;attendiez pas cette invitation, ignorez cet email.
            </p>

          </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true, inviteUrl })
  } catch (error) {
    console.error("Erreur send-invite:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
