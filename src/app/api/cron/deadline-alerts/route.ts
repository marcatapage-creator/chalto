import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import { differenceInDays, parseISO } from "date-fns"
import { createNotification } from "@/lib/notifications"
import { sendDeadlineAlertEmail } from "@/lib/email"

// Vercel Cron — déclenché chaque matin à 7h UTC
// Protégé par Authorization: Bearer CRON_SECRET (injecté automatiquement par Vercel)
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const THRESHOLDS = [30, 15, 7, 1] as const

const TYPE_LABEL: Record<string, string> = {
  permis_construire: "Permis de construire",
  declaration_prealable: "Déclaration préalable",
  doc: "DOC",
  daact: "DAACT",
  erp: "ERP",
  autre: "Autre",
}

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

  let alertsSent = 0
  let totalChecked = 0
  let page = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  while (true) {
    const { data: dossiers, error } = await admin
      .from("admin_dossiers")
      .select("*, project:projects(id, name), profile:profiles!user_id(email, full_name)")
      .not("deadline", "is", null)
      .not("status", "in", "(obtenu,refuse)")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      console.error("[cron/deadline-alerts]", error)
      return NextResponse.json({ error: "DB error" }, { status: 500 })
    }

    if (!dossiers || dossiers.length === 0) break
    totalChecked += dossiers.length

    const sideEffects: Promise<unknown>[] = []
    const pendingUpdates: Array<{ id: string; notified_thresholds: number[] }> = []

    for (const dossier of dossiers) {
      const project = dossier.project as { id: string; name: string } | null
      const profile = dossier.profile as { email: string; full_name: string | null } | null
      if (!project || !profile?.email) continue

      const days = differenceInDays(parseISO(dossier.deadline), today)
      const notified: number[] = [...(dossier.notified_thresholds ?? [])]
      const typeLabel =
        dossier.type === "autre" && dossier.label
          ? dossier.label
          : (TYPE_LABEL[dossier.type] ?? dossier.type)
      let changed = false

      for (const threshold of THRESHOLDS) {
        if (days > threshold) continue
        if (notified.includes(threshold)) continue

        sideEffects.push(
          createNotification({
            userId: dossier.user_id,
            type: "deadline_alert",
            title:
              days < 0 ? `Échéance dépassée — ${typeLabel}` : `Échéance J-${days} — ${typeLabel}`,
            body: `${project.name} · ${new Date(dossier.deadline + "T00:00:00").toLocaleDateString("fr-FR")}`,
            link: `/projects/${project.id}?highlight=dossier_${dossier.id}`,
          }).catch((err: unknown) => console.error("[deadline-alerts] createNotification", err))
        )

        sideEffects.push(
          sendDeadlineAlertEmail({
            userEmail: profile.email,
            userName: profile.full_name ?? "Architecte",
            projectName: project.name,
            projectId: project.id,
            dossierType: typeLabel,
            deadline: dossier.deadline,
            daysRemaining: days,
            threshold,
            baseUrl,
          }).catch((err: unknown) => console.error("[deadline-alerts] sendDeadlineAlertEmail", err))
        )

        notified.push(threshold)
        changed = true
        alertsSent++
      }

      if (changed) pendingUpdates.push({ id: dossier.id, notified_thresholds: notified })
    }

    await Promise.allSettled(sideEffects)
    await Promise.all(
      pendingUpdates.map((u) =>
        admin
          .from("admin_dossiers")
          .update({ notified_thresholds: u.notified_thresholds })
          .eq("id", u.id)
      )
    )

    if (dossiers.length < PAGE_SIZE) break
    page++
  }

  return NextResponse.json({
    ok: true,
    checked: totalChecked,
    alertsSent,
    runAt: new Date().toISOString(),
  })
}
