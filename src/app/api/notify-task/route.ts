import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Resend } from "resend"
import { NextResponse } from "next/server"
import { buildBrandHeader } from "@/lib/email-brand"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { taskId } = await request.json()
    if (!taskId) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const admin = createAdminClient()

    const { data: task } = await admin
      .from("tasks")
      .select("id, title, description, due_date, project_id, assigned_to")
      .eq("id", taskId)
      .single()

    if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 })

    const [{ data: contact }, { data: project }, { data: proProfile }] = await Promise.all([
      admin.from("contacts").select("name, email").eq("id", task.assigned_to).single(),
      admin.from("projects").select("name, user_id").eq("id", task.project_id).single(),
      admin
        .from("profiles")
        .select("full_name, company_name, logo_url, branding_enabled")
        .eq("id", user.id)
        .single(),
    ])

    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    if (!contact?.email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 })
    }

    const { data: contributor } = await admin
      .from("contributors")
      .select("invite_token")
      .eq("project_id", task.project_id)
      .eq("contact_id", task.assigned_to)
      .single()

    if (!contributor?.invite_token) {
      return NextResponse.json({ error: "Prestataire non invité" }, { status: 400 })
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${contributor.invite_token}`
    const proName = proProfile?.full_name ?? "Votre professionnel"
    const brandHeader = buildBrandHeader(proProfile)

    const dueDateHtml = task.due_date
      ? `<p style="margin: 8px 0 0; font-size: 13px; color: #666;">
           📅 À faire avant le ${new Date(task.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
         </p>`
      : ""

    const descriptionHtml = task.description
      ? `<p style="margin: 6px 0 0; font-size: 13px; color: #555; line-height: 1.6;">${task.description}</p>`
      : ""

    await resend.emails.send({
      from: "Chalto <noreply@chalto.fr>",
      to: contact.email,
      subject: `Rappel de tâche — ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

            <div style="margin-bottom: 32px;">
              ${brandHeader}
            </div>

            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
              Rappel de tâche
            </h1>

            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Bonjour ${contact.name},
            </p>

            <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
              <strong>${proName}</strong> vous rappelle une tâche en attente
              sur le projet <strong>${project?.name}</strong>.
            </p>

            <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 32px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Tâche</p>
              <p style="margin: 0; font-weight: 600; font-size: 16px;">${task.title}</p>
              ${descriptionHtml}
              ${dueDateHtml}
            </div>

            <a href="${inviteUrl}"
               style="display: inline-block; background: #2260E8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
              Voir mes tâches →
            </a>

            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
              Vous avez reçu cet email car ${proName} vous a assigné une tâche via Chalto.<br/>
              Si vous n&apos;attendiez pas ce message, ignorez cet email.
            </p>

          </body>
        </html>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[notify-task]", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
