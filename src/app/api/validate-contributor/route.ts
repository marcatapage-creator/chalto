import { createAdminClient } from "@/lib/supabase/admin"
import { sendApprovalEmail, sendTransmissionAckEmail } from "@/lib/email"
import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"
import { validateContributorSchema } from "@/lib/api-schemas"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const allowed = await checkRateLimit(request)
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes — réessayez dans une minute" },
      { status: 429 }
    )
  }

  try {
    const parsed = validateContributorSchema.safeParse(await request.json())
    if (!parsed.success)
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
    const { documentId, status, comment, contributorName, requestType } = parsed.data
    const isTransmission = requestType === "transmission"

    const admin = createAdminClient()

    const { data: document } = await admin
      .from("documents")
      .select("*, projects(name, user_id)")
      .eq("id", documentId)
      .single()

    if (!document) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    const userId = document.projects.user_id
    const effectiveStatus = isTransmission ? "commented" : status

    const [{ error: docUpdateError }, { error: validationInsertError }, { data: proProfile }] =
      await Promise.all([
        admin.from("documents").update({ status: effectiveStatus }).eq("id", documentId),
        admin.from("validations").insert({
          document_id: documentId,
          status: effectiveStatus,
          comment: comment || null,
          client_name: contributorName,
          approved_at: new Date().toISOString(),
        }),
        admin
          .from("profiles")
          .select(
            "email, full_name, notif_inapp_enabled, notif_email_approved, notif_email_rejected, notif_email_frequency"
          )
          .eq("id", userId)
          .single(),
      ])

    if (docUpdateError) {
      console.error("[validate-contributor] documents update error:", docUpdateError)
      return NextResponse.json({ error: "Erreur mise à jour statut document" }, { status: 500 })
    }
    if (validationInsertError) {
      console.error("[validate-contributor] validations insert error:", validationInsertError)
      return NextResponse.json({ error: "Erreur enregistrement validation" }, { status: 500 })
    }

    if (isTransmission) {
      const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"}/projects/${document.project_id}`
      await Promise.all([
        createNotification({
          userId,
          type: "document_approved",
          title: "Document lu par un prestataire",
          body: comment
            ? `${contributorName} a lu « ${document.name} » · "${comment.length > 80 ? comment.slice(0, 80) + "…" : comment}"`
            : `${contributorName} a lu « ${document.name} »`,
          link: `/projects/${document.project_id}?highlight=doc_${document.id}`,
          inAppEnabled: proProfile?.notif_inapp_enabled,
        }),
        proProfile?.email
          ? sendTransmissionAckEmail({
              proEmail: proProfile.email,
              proName: proProfile.full_name ?? "Professionnel",
              contributorName: contributorName ?? "Un prestataire",
              projectName: document.projects?.name ?? "Projet",
              documentName: document.name,
              comment,
              projectUrl,
            })
          : Promise.resolve(),
      ])
    } else {
      const shouldSendEmail =
        proProfile?.notif_email_frequency !== "never" &&
        (status === "approved"
          ? proProfile?.notif_email_approved !== false
          : proProfile?.notif_email_rejected !== false)

      await Promise.all([
        createNotification({
          userId,
          type: status === "approved" ? "document_approved" : "document_rejected",
          title:
            status === "approved"
              ? "Document approuvé par un prestataire"
              : "Document refusé par un prestataire",
          body: `${contributorName} a ${status === "approved" ? "approuvé" : "refusé"} « ${document.name} »`,
          link: `/projects/${document.project_id}?highlight=doc_${document.id}`,
          inAppEnabled: proProfile?.notif_inapp_enabled,
        }),
        proProfile?.email && shouldSendEmail
          ? sendApprovalEmail({
              proEmail: proProfile.email,
              proName: proProfile.full_name ?? "Professionnel",
              clientName: contributorName ?? "Un prestataire",
              projectName: document.projects?.name ?? "Projet",
              documentName: document.name,
              status: status as "approved" | "rejected",
              comment: comment ?? undefined,
              projectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://chalto.fr"}/projects/${document.project_id}`,
            })
          : Promise.resolve(),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur validation prestataire:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
