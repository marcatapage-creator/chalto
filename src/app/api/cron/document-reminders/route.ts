import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { sendReminderEmail } from "@/lib/email"

// Vercel Cron — déclenché chaque matin à 8h UTC
// Relance automatique les clients n'ayant pas répondu J+7 et J+14 après envoi
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_REMINDERS = 3
const REMINDER_INTERVAL_DAYS = 7
const PAGE_SIZE = 200

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET non configuré" }, { status: 503 })
  }
  if (request.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"

  const cutoff = new Date(Date.now() - REMINDER_INTERVAL_DAYS * 24 * 3600 * 1000).toISOString()

  let remindersSent = 0
  let totalChecked = 0
  let page = 0

  while (true) {
    // Sélectionne les documents :
    // - envoyés en validation client (sent + audience=client + request_type=validation)
    // - non encore répondus
    // - sous le plafond de relances
    // - dont la dernière relance (ou l'envoi initial) remonte à plus de REMINDER_INTERVAL_DAYS jours
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents, error } = await (admin.from("documents") as any)
      .select(
        "id, name, validation_token, reminder_count, last_reminded_at, sent_at, project_id, projects!inner(name, client_email, client_name, user_id, profiles!user_id(full_name, email, logo_url, company_name, branding_enabled))"
      )
      .eq("status", "sent")
      .eq("audience", "client")
      .eq("request_type", "validation")
      .lt("reminder_count", MAX_REMINDERS)
      .or(`last_reminded_at.is.null,last_reminded_at.lt.${cutoff}`)
      .not("sent_at", "is", null)
      .lt("sent_at", cutoff)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error("[cron/document-reminders]", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    if (!documents || documents.length === 0) break
    totalChecked += documents.length

    const sideEffects: Promise<unknown>[] = []
    const pendingUpdates: Array<{ id: string; reminder_count: number }> = []

    for (const doc of documents) {
      const project = doc.projects as {
        name: string
        client_email: string | null
        client_name: string | null
        profiles: {
          full_name: string | null
          email: string
          logo_url: string | null
          company_name: string | null
          branding_enabled: boolean
        } | null
      } | null

      if (!project?.client_email || !project.profiles) continue

      const reminderCount: number = doc.reminder_count ?? 0
      const profile = project.profiles
      const validationUrl = `${baseUrl}/validate/${doc.validation_token}`

      sideEffects.push(
        sendReminderEmail({
          clientEmail: project.client_email,
          clientName: project.client_name ?? "Client",
          proName: profile.full_name ?? profile.email,
          projectName: project.name,
          documentName: doc.name,
          validationUrl,
          reminderCount: reminderCount + 1,
          logoUrl: profile.branding_enabled ? (profile.logo_url ?? null) : null,
          companyName: profile.branding_enabled ? (profile.company_name ?? null) : null,
        }).catch((err: unknown) => console.error("[document-reminders] sendReminderEmail", err))
      )

      pendingUpdates.push({ id: doc.id, reminder_count: reminderCount + 1 })
      remindersSent++
    }

    await Promise.allSettled(sideEffects)
    await Promise.all(
      pendingUpdates.map((u) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (admin.from("documents") as any)
          .update({
            reminder_count: u.reminder_count,
            last_reminded_at: new Date().toISOString(),
          })
          .eq("id", u.id)
      )
    )

    if (documents.length < PAGE_SIZE) break
    page++
  }

  return NextResponse.json({
    ok: true,
    checked: totalChecked,
    remindersSent,
    runAt: new Date().toISOString(),
  })
}
