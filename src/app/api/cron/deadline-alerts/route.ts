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

export async function GET(request: Request) {
  // Auth : CRON_SECRET requis en production, optionnel en dev
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get("Authorization")
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const admin = createAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"

  // Récupère tous les dossiers actifs avec une échéance
  const { data: dossiers, error } = await admin
    .from("admin_dossiers")
    .select("*, project:projects(id, name), profile:profiles!user_id(email, full_name)")
    .not("deadline", "is", null)
    .not("status", "in", "(obtenu,refuse)")

  if (error) {
    console.error("[cron/deadline-alerts]", error)
    return NextResponse.json({ error: "DB error" }, { status: 500 })
  }

  let alertsSent = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (const dossier of dossiers ?? []) {
    const project = dossier.project as { id: string; name: string } | null
    const profile = dossier.profile as { email: string; full_name: string | null } | null
    if (!project || !profile?.email) continue

    const days = differenceInDays(parseISO(dossier.deadline), today)
    const notified: number[] = dossier.notified_thresholds ?? []
    const typeLabel =
      dossier.type === "autre" && dossier.label
        ? dossier.label
        : (TYPE_LABEL[dossier.type] ?? dossier.type)

    for (const threshold of THRESHOLDS) {
      if (days > threshold) continue // trop tôt pour ce seuil
      if (notified.includes(threshold)) continue // déjà envoyé

      // Envoyer l'alerte
      void createNotification({
        userId: dossier.user_id,
        type: "deadline_alert",
        title: days < 0 ? `Échéance dépassée — ${typeLabel}` : `Échéance J-${days} — ${typeLabel}`,
        body: `${project.name} · ${new Date(dossier.deadline + "T00:00:00").toLocaleDateString("fr-FR")}`,
        link: `/projects/${project.id}?highlight=dossier_${dossier.id}`,
      }).catch((err: unknown) => console.error("[deadline-alerts] createNotification", err))

      void sendDeadlineAlertEmail({
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

      // Marquer le seuil comme notifié
      await admin
        .from("admin_dossiers")
        .update({ notified_thresholds: [...notified, threshold] })
        .eq("id", dossier.id)

      notified.push(threshold)
      alertsSent++
    }
  }

  return NextResponse.json({
    ok: true,
    checked: (dossiers ?? []).length,
    alertsSent,
    runAt: new Date().toISOString(),
  })
}
