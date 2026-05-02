import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { NextResponse } from "next/server"
import { buildBrandHeader } from "@/lib/email-brand"
import { sendDocumentContributorSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(request)))
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

    const parsed = sendDocumentContributorSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { contributorIds, documentName, projectId, message, requestType } = parsed.data
    const isTransmission = requestType === "transmission"

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const [{ data: contributors }, { data: project }, { data: proProfile }] = await Promise.all([
      supabase
        .from("contributors")
        .select("name, email, invite_token")
        .in("id", contributorIds)
        .eq("project_id", projectId),
      supabase.from("projects").select("name").eq("id", projectId).eq("user_id", user.id).single(),
      supabase
        .from("profiles")
        .select("full_name, company_name, logo_url, branding_enabled")
        .eq("id", user.id)
        .single(),
    ])

    if (!project) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    if (!contributors?.length) {
      return NextResponse.json({ error: "Prestataires introuvables" }, { status: 404 })
    }

    const proName = proProfile?.full_name ?? "Votre professionnel"
    const proCompany = proProfile?.company_name ? ` (${proProfile.company_name})` : ""
    const projectName = project?.name ?? "le projet"
    const brandHeader = buildBrandHeader(proProfile)

    const baseUrl = new URL(request.url).origin

    const sends = contributors
      .filter((c) => c.email && c.invite_token)
      .map((c) => {
        const spaceUrl = `${baseUrl}/invite/${c.invite_token}`
        return resend.emails.send({
          from: "Chalto <noreply@chalto.fr>",
          to: c.email,
          subject: isTransmission
            ? `${proName} vous a transmis un document — ${documentName}`
            : `${proName} vous demande de valider un document — ${documentName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111; background: #fff;">

                <div style="margin-bottom: 32px;">${brandHeader}</div>

                <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">
                  Nouveau document partagé
                </h1>

                <p style="color: #555; font-size: 15px; margin: 0 0 24px;">
                  Bonjour ${c.name},
                </p>

                <p style="color: #333; line-height: 1.7; font-size: 15px; margin: 0 0 24px;">
                  <strong>${proName}${proCompany}</strong> vous a partagé un document
                  dans le cadre du projet <strong>${projectName}</strong>.
                </p>

                <div style="background: #f9f9f9; border: 1px solid #eee; border-radius: 10px; padding: 20px; margin: 0 0 ${message ? "24px" : "32px"};">
                  <p style="margin: 0 0 4px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Document</p>
                  <p style="margin: 0; font-weight: 600; font-size: 16px;">${documentName}</p>
                  <p style="margin: 4px 0 0; font-size: 13px; color: #666;">Projet : ${projectName}</p>
                </div>

                ${
                  message
                    ? `
                <div style="background: #f0f4ff; border-left: 3px solid #3b5fdb; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 0 0 32px;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Message de ${proName}</p>
                  <p style="margin: 0; color: #333; line-height: 1.7; font-style: italic;">"${message}"</p>
                </div>
                `
                    : ""
                }

                <a href="${spaceUrl}"
                   style="display: inline-block; background: #2260E8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 0 0 32px;">
                  Consulter le document →
                </a>

                <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0; border-top: 1px solid #eee; padding-top: 24px;">
                  Vous avez reçu cet email car ${proName} vous a partagé un document via Chalto.<br/>
                  Si vous n'attendiez pas ce message, ignorez cet email.
                </p>

              </body>
            </html>
          `,
        })
      })

    await Promise.all(sends)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur send-document-contributor:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
