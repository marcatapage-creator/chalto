import { createClient } from "@/lib/supabase/server"
import { sendReminderEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import { remindValidationSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"

const MAX_REMINDERS = 3
const MIN_HOURS_BETWEEN_REMINDERS = 24

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit(request)))
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 })

    const parsed = remindValidationSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { documentId } = parsed.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const [{ data: document }, { data: profile }] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("documents") as any)
        .select(
          "id, status, audience, request_type, reminder_count, last_reminded_at, name, validation_token, project_id, projects!inner(name, client_email, client_name, user_id)"
        )
        .eq("id", documentId)
        .single(),
      supabase
        .from("profiles")
        .select("full_name, email, logo_url, company_name, branding_enabled")
        .eq("id", user.id)
        .single(),
    ])

    if (!document) return NextResponse.json({ error: "Document introuvable" }, { status: 404 })

    const project = document.projects as {
      name: string
      client_email: string | null
      client_name: string | null
      user_id: string
    }

    if (project?.user_id !== user.id)
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })

    if (document.status !== "sent" || document.audience !== "client")
      return NextResponse.json({ error: "Document non éligible à la relance" }, { status: 409 })

    if (document.request_type !== "validation")
      return NextResponse.json(
        { error: "Les transmissions ne nécessitent pas de relance" },
        { status: 409 }
      )

    if (!project.client_email)
      return NextResponse.json({ error: "Pas d'email client" }, { status: 400 })

    const reminderCount: number = document.reminder_count ?? 0
    if (reminderCount >= MAX_REMINDERS)
      return NextResponse.json({ error: "Nombre maximum de relances atteint" }, { status: 429 })

    if (document.last_reminded_at) {
      const hoursSince =
        (Date.now() - new Date(document.last_reminded_at).getTime()) / (1000 * 60 * 60)
      if (hoursSince < MIN_HOURS_BETWEEN_REMINDERS)
        return NextResponse.json(
          { error: "Relance trop récente — attendez 24h entre deux relances" },
          { status: 429 }
        )
    }

    const baseUrl = new URL(request.url).origin
    const validationUrl = `${baseUrl}/validate/${document.validation_token}`

    const { error: emailError } = await sendReminderEmail({
      clientEmail: project.client_email,
      clientName: project.client_name ?? "Client",
      proName: profile?.full_name ?? profile?.email ?? "Votre professionnel",
      projectName: project.name,
      documentName: document.name,
      validationUrl,
      reminderCount: reminderCount + 1,
      logoUrl: profile?.branding_enabled ? (profile.logo_url ?? null) : null,
      companyName: profile?.branding_enabled ? (profile.company_name ?? null) : null,
    })

    if (emailError) {
      console.error("[remind-validation] Resend error:", emailError)
      return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("documents") as any)
      .update({
        reminder_count: reminderCount + 1,
        last_reminded_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return NextResponse.json({ success: true, reminderCount: reminderCount + 1 })
  } catch (error) {
    console.error("[remind-validation] Erreur serveur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
