import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { contactId, projectId } = await request.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", contactId)
      .single()

    if (!contact?.email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 })
    }

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single()

    const { data: proProfile } = await supabase
      .from("profiles")
      .select("full_name, email, company_name")
      .eq("id", user.id)
      .single()

    // Créer ou récupérer le contributor
    const { data: existing } = await supabase
      .from("contributors")
      .select("*")
      .eq("project_id", projectId)
      .eq("contact_id", contactId)
      .single()

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
        })
        .select()
        .single()
      contributor = created
    }

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${contributor.invite_token}`
    const proName = proProfile?.full_name ?? proProfile?.email ?? "Votre professionnel"
    const proCompany = proProfile?.company_name ? ` (${proProfile.company_name})` : ""

    await resend.emails.send({
      from: "Chalto <noreply@chalto.fr>",
      to: contact.email,
      subject: `${proName} vous invite à collaborer sur "${project?.name}"`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

            <div style="margin-bottom: 32px;">
              <div style="background: #16a34a; border-radius: 8px; padding: 6px 12px; display: inline-block;">
                <span style="color: white; font-weight: 700; font-size: 14px;">Chalto</span>
              </div>
            </div>

            <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
              Invitation à collaborer
            </h1>

            <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
              Bonjour ${contact.name},
            </p>

            <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
              <strong>${proName}${proCompany}</strong> vous invite à collaborer
              sur le projet <strong>${project?.name}</strong>.
            </p>

            <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 32px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Projet</p>
              <p style="margin: 0; font-weight: 600; font-size: 16px;">${project?.name}</p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #666;">
                Vous pouvez consulter vos tâches, mettre à jour leur statut et communiquer avec l&apos;équipe.
              </p>
            </div>

            <a href="${inviteUrl}"
               style="display: inline-block; background: #16a34a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
              Voir mes tâches →
            </a>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 0 0 32px;">
              <p style="margin: 0 0 8px; font-weight: 600; font-size: 14px; color: #16a34a;">
                💡 Et si vous utilisiez Chalto pour vos propres projets ?
              </p>
              <p style="margin: 0 0 12px; font-size: 13px; color: #555; line-height: 1.6;">
                Gérez vos chantiers, partagez vos documents et faites valider vos livrables par vos clients — simplement.
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/register"
                 style="font-size: 13px; color: #16a34a; font-weight: 600; text-decoration: underline;">
                Créer mon compte gratuitement →
              </a>
            </div>

            <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
              Vous avez reçu cet email car ${proName} vous a invité via Chalto.<br/>
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
